import { router, publicProcedure, protectedProcedure } from "../trpc";
import { env } from "../../../env/server.mjs";


export const authRouter = router({
  getSession: publicProcedure.query(({ ctx }) => {
    return ctx.session;
  }),
  checkIfAdmin: protectedProcedure.query(({ ctx }) => {
    if(ctx.session.user.email && env.ADMIN_EMAIL.split(", ").includes(ctx.session.user.email)){
      return true;
    }
    return false;
  }),
});
