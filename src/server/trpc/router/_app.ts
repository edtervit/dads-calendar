import { router } from "../trpc";
import { authRouter } from "./auth";
import { raceRouter } from "./race";
import {ratelimitRouter} from "./rateLimit";

export const appRouter = router({
  race: raceRouter,
  auth: authRouter,
  rateLimit: ratelimitRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
