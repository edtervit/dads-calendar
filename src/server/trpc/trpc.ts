import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import {env} from "../../env/server.mjs";

import { type Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;

/**
 * Unprotected procedure
 **/
export const publicProcedure = t.procedure;

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

/**
 * Reusable middleware to ensure
 * users are logged in
 */
const isAdmin = t.middleware(({ ctx, next }) => {
  if(ctx?.session?.user?.email && env.ADMIN_EMAIL.split(", ").includes(ctx.session.user.email)){
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session, user: ctx.session.user },
      },
    })
  }
  throw new TRPCError({ code: "UNAUTHORIZED" });
});


/**
 * Protected procedure
 **/
export const protectedProcedure = t.procedure.use(isAuthed);

/**
 * Admin procedure
 **/
export const adminProcedure = t.procedure.use(isAdmin);
