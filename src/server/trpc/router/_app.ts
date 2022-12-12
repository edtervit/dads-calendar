import { router } from "../trpc";
import { authRouter } from "./auth";
import { raceRouter } from "./race";

export const appRouter = router({
  race: raceRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
