import { t } from "elysia";

export const playerSchema = t.Object(
  {
    id: t.String(),
    name: t.String({ description: "玩家名稱" }),
    email: t.Nullable(t.String({ description: "玩家電子郵件" })),
  },
  {
    title: "玩家",
  }
);

export type Player = typeof playerSchema.static;
