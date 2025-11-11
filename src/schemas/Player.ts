import { t } from "elysia";

export const playerSchema = t.Object(
  {
    id: t.String(),
    name: t.String({ description: "玩家名稱" }),
  },
  {
    title: "玩家",
  }
);

export type Player = typeof playerSchema.static;
