import type { RaceWithPhotosAndCourse } from "../types/race"; 


export const groupRacesByCourseAndSortByTime = (raceData: RaceWithPhotosAndCourse[]) => {
  const groupedRaces: {course: string, races: RaceWithPhotosAndCourse[]}[] = [];
  raceData.forEach(race => {
    //if the race is somehow null, just skip it.
    if (!race) return;
    //check if course.name is already in groupedRaces
    const courseIndex = groupedRaces.findIndex(groupedRace => groupedRace.course.toLowerCase() === race.course.name.toLowerCase());
    //if it is, push
    if (courseIndex !== -1) {
      groupedRaces[courseIndex]?.races.push(race)
    }
    //if it isn't, create new object and push
    if (courseIndex === -1) {
      groupedRaces.push({
        course: race.course.name,
        races: [race]
      });
    }
  });
  groupedRaces.forEach(group => {
    group.races.sort((a, b) => {
      const aTime = a.time.split(":");
      const bTime = b.time.split(":");
      if (aTime[0] !== undefined && aTime[1] !== undefined && bTime[0] !== undefined && bTime[1] !== undefined) {
        const aSeconds = parseInt(aTime[0]) * 60 + parseInt(aTime[1]);
        const bSeconds = parseInt(bTime[0]) * 60 + parseInt(bTime[1]);
        return aSeconds - bSeconds;
      } else
        return 0;
    }
    )
  })
  return groupedRaces;
};