import { z } from "zod";
import { publicProcedure, router } from "../trpc";

export const storeRouter = router({
  getAll: publicProcedure
    .input(z.object({ take: z.number(), search: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.store.findMany({
        take: input?.take || 10,
        orderBy: {
          createdAt: "asc",
        },
        where: {
          name: {
            contains: input?.search || "",
          },
        },
      });
    }),

  create: publicProcedure
    .input(z.object({ name: z.string(), userId: z.any() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.store.create({
        data: input,
      });
    }),
});
