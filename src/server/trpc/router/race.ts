import {z} from "zod";

import {router, publicProcedure, protectedProcedure} from "../trpc";
import {env} from "../../../env/server.mjs";

export const raceRouter = router({
  hello: publicProcedure
    .input(z.object({text: z.string().nullish()}).nullish())
    .query(({input}) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getRaces: protectedProcedure
    .input(z.string())
    .query(async ({ctx, input}) => {
      //MAX 50 CALLS PERS DAY TO API
      //first check the database if we have races for that date, if we do return them
      const racesWeHave = await ctx.prisma.race.findMany({
        where: {
          date: input,
        },
        include: {
          course: {
            select: {
              name: true
            }
          }
        }
      });

      if (racesWeHave.length > 0) return {data: racesWeHave, success: true, error: null}

      //if the user isn't an admin, return an error to avoid non-admins wasting the API calls
      if (ctx.session.user.email && !env.ADMIN_EMAIL.split(", ").includes(ctx.session.user.email)) return {
        data: null,
        success: false,
        error: ['We don\'t have any races for this date in the database, only admins can request new races.']
      }

      //if we have 0 races for that date, fetch them from the API and insert them into the database
      try {
        const options = {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': 'baa2311211msh2d26d7befb60161p1bea14jsnef4a4c0ce048',
            'X-RapidAPI-Host': 'horse-racing.p.rapidapi.com'
          }
        };
        const response = await fetch(`https://horse-racing.p.rapidapi.com/racecards?date=${input}`, options);
        const json = await response.json();

        interface raceRes {
          date: string
          course: string
        }

        //loop through json adding new course.name to an array
        const courseArray: string[] = []
        json.forEach((race: raceRes) => {
          if (!courseArray.includes(race.course)) courseArray.push(race.course)
        })
        //add new courses to database and get id, if they already exist get id
        const coursesWithIds: {name: string, id: number}[] = await Promise.all(courseArray.map(async (course: string) => {
          //check if course exists in database and get id, if not create it and get id
          const courseId = await ctx.prisma.course.findUnique({
            where: {
              name: course
            },
            select: {
              id: true
            }
          })
          if (courseId) return {name: course, id: courseId.id}
          else {
            const newCourse = await ctx.prisma.course.create({
              data: {
                name: course
              }
            })
            return {name: course, id: newCourse.id}
          }
        }))

        //loop through json adding new races to database
        const races = await Promise.all(json.map(async (race: raceRes) => {
          const raceCourseId = coursesWithIds.find(course => course.name === race.course)?.id;
          const raceTimeWithTrailing00 = race.date.split(" ")[1]
          //remove trailing 00 from time
          const raceTime = raceTimeWithTrailing00?.slice(0, -3)
          const raceDate = race.date.split(" ")[0]
          if (raceCourseId && raceTime && raceDate) {
            const newRace = await ctx.prisma.race.upsert({
              where: {
                raceIdentifier: {
                  courseId: raceCourseId,
                  time: raceTime,
                  date: raceDate
                }
              },
              update: {
                time: raceTime,
                date: raceDate
              },
              create: {
                courseId: raceCourseId,
                time: raceTime,
                date: raceDate
              },
              include: {
                course: {
                  select: {
                    name: true
                  }
                }
              }
            })
            return newRace
          }
          return null;
        }))

        return {data: races, success: true, error: null}
      } catch (err) {
        return {
          data: null,
          success: false,
          error: [err, 'Error getting races for this date, maybe the API has maxed out for the day. 50 new dates per day.'],
        }
      }
    }),
  updateRating: protectedProcedure
    .input(z.object({
      raceId: z.number(),
      rating: z.number().nullable(),
      type: z.enum(['winner', 'race'])
    }))
    .mutation(async ({ctx, input}) => {
      
      if (ctx.session.user.email && !env.ADMIN_EMAIL.split(", ").includes(ctx.session.user.email)) return {
        success: false,
        error: ['Only admins can update ratings.']
      }
      try {
        if(input.type === 'winner'){
          await ctx.prisma.race.update({
            where: {
              id: input.raceId
            },
            data: {
              winnerRating: input.rating ?? null
            },
          })
        } else {
          await ctx.prisma.race.update({
            where: {
              id: input.raceId
            },
            data: {
              raceRating: input.rating ?? null
            },
          })
        }

        return {success: true, error: null}
      } catch (error) {
        return {success: false, error: [error, 'Error saving rating to DB']}
      }


    }),
});
