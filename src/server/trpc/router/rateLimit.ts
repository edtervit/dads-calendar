import {env} from "../../../env/server.mjs";
import {router, protectedProcedure} from "../trpc";


export const ratelimitRouter = router({
  getTodaysRateLimit: protectedProcedure.query(async ({ctx}) => {
    if (ctx.session.user.email && env.ADMIN_EMAIL.split(", ").includes(ctx.session.user.email)) {
      const todaysDate = new Date().toISOString().split("T")[0]?.slice(0, 10);
      const count = await ctx.prisma.dailyRateLimit.findUnique({
        where: {
          date: todaysDate
        },
        select: {
          count: true
        }
      })
      return count?.count ?? null
    }
    return null;
  }),
});
