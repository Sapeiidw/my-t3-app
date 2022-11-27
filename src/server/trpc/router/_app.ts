import { router } from "../trpc";
import { authRouter } from "./auth";
import { exampleRouter } from "./example";
import { storeRouter } from "./store";

export const appRouter = router({
  store: storeRouter,
  example: exampleRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
