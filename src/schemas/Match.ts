import { t } from "elysia";

export const matchStatusSchema = t.Union([
  t.Literal("WATTING_FOR_PLAYERS"),
  t.Literal("IN_PROGRESS"),
  t.Literal("INTERRUPTED"),
  t.Literal("COMPLETED"),
]);

export type MatchStatus = typeof matchStatusSchema.static;

export const matchSchema = t.Object(
  {
    id: t.String(),
    name: t.String({ description: "對局名稱" }),
    gameId: t.String({ description: "遊戲類型ID" }),
    status: matchStatusSchema,
    players: t.Array(
      t.Object({
        id: t.String(),
      })
    ),
    setupContext: t.Optional(t.Any({ description: "遊戲設定相關資訊" })),
    state: t.Optional(t.Any({ description: "遊戲狀態相關資訊" })),
  },
  {
    description: "對局資訊",
  }
);

export type Match = typeof matchSchema.static;

export const matchBaseInfoSchema = t.Pick(
  matchSchema,
  ["id", "name", "gameId", "status"],
  {
    description: "對局基本資訊",
  }
);
export type MatchBaseInfo = typeof matchBaseInfoSchema.static;
