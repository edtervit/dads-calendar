import {router, adminProcedure} from "../trpc";


export const ratelimitRouter = router({
  getTodaysRateLimit: adminProcedure.query(async ({ctx}) => {
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
  }),
});
