import { t } from "elysia";

import { playerSchema } from "./Player";

export const gameStatusSchema = t.Union([
  t.Literal("WATTING_FOR_PLAYERS"),
  t.Literal("IN_PROGRESS"),
  t.Literal("INTERRUPTED"),
  t.Literal("COMPLETED"),
]);

export type GameStatus = typeof gameStatusSchema.static;

export const gameSchema = t.Object(
  {
    id: t.String(),
    name: t.String({ description: "對局名稱" }),
    gameId: t.String({ description: "遊戲類型ID" }),
    status: gameStatusSchema,
    players: t.Array(playerSchema),
    setupContext: t.Optional(t.Unknown({ description: "遊戲設定相關資訊" })),
    state: t.Optional(t.Unknown({ description: "遊戲狀態相關資訊" })),
  },
  {
    description: "對局資訊",
  }
);

export type Game = typeof gameSchema.static;

export const gameBaseInfoSchema = t.Pick(
  gameSchema,
  ["id", "name", "gameId", "status"],
  {
    description: "對局基本資訊",
  }
);
export type GameBaseInfo = typeof gameBaseInfoSchema.static;
