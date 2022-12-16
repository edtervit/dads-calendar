import {router, adminProcedure} from "../trpc";


export const usersRouter = router({
  getAllUsers: adminProcedure.query(async ({ctx}) => {
    const users = await ctx.prisma.user.findMany({
      select: {
        email: true,
        emailVerified: true,
      }
    })
    return users;
  }),
});
