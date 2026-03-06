
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { searchTransport, getPopularRoutes } from "./transport";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,


  transport: router({
    search: publicProcedure
      .input(
        z.object({
          from: z.string(),
          to: z.string(),
          date: z.string(),
        })
      )
      .query(async ({ input }) => {
        return await searchTransport(input);
      }),

    popularRoutes: publicProcedure
      .input(z.object({ destination: z.string() }))
      .query(({ input }) => {
        return getPopularRoutes(input.destination);
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
