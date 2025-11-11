import Elysia, { t } from "elysia";
import { ulid } from "ulid";

import { isErr } from "~shared/utils/Result";

import type { AppServices } from "@/app/AppServices";
import { type Match, matchBaseInfoSchema } from "@/schemas/Match";

export type Deps = Pick<AppServices, "Logger" | "MatchStore">;

export function buildLobbyApi(deps: Deps) {
  const { Logger, MatchStore } = deps;
  return new Elysia({
    name: "LobbyApi",
  })
    .get(
      "/api/matches",
      async () => {
        return await MatchStore.list();
      },
      {
        response: {
          200: t.Array(matchBaseInfoSchema),
        },
      }
    )
    .post(
      "/api/matches",
      async ({ body }) => {
        const { name, gameId } = body;
        //TODO: 依據 gameId 檢查遊戲類型是否存在
        //TODO: 依據 gameId 取得遊戲預設設定
        const newMatch: Match = {
          id: ulid(),
          name,
          gameId,
          status: "WATTING_FOR_PLAYERS",
          players: [],
        };
        await MatchStore.save(newMatch.id, newMatch);
        return newMatch;
      },
      {
        body: t.Object({
          name: t.String({ description: "對局名稱" }),
          gameId: t.String({ description: "遊戲類型ID" }),
        }),
        response: {
          200: matchBaseInfoSchema,
          400: t.Union([
            t.Object({
              type: t.Literal("GAME_NOT_FOUND"),
            }),
            t.Object({
              type: t.Literal("INVALID_SETUP_CONTEXT"),
            }),
          ]),
        },
      }
    )
    .get(
      "/api/matches/:matchId",
      async ({ params, status }) => {
        const loadResult = await MatchStore.load(params.matchId);
        if (isErr(loadResult)) {
          return status(404, { type: "MATCH_NOT_FOUND" });
        }
        return loadResult.value;
      },
      {
        params: t.Object({
          matchId: t.String(),
        }),
        response: {
          200: matchBaseInfoSchema,
          404: t.Object({
            type: t.Literal("MATCH_NOT_FOUND"),
          }),
        },
      }
    )
    .ws("/ws", {
      open(ws) {
        Logger.info({
          event: "ws-open",
          emoji: "🔗",
        })`WebSocket 連線已開啟，ID：${ws.id}`;

        Logger.log("ws.data", ws.data);
      },
      close(ws) {
        Logger.info({
          event: "ws-close",
          emoji: "❌",
        })`WebSocket 連線已關閉，ID：${ws.id}`;
      },
      message(ws, message) {
        Logger.info({
          event: "ws-message",
          emoji: "📨",
        })`收到來自 ID：${ws.id} 的訊息`;
        Logger.log("ws.data", ws.data);
        Logger.log("ws.message", message);
      },
    });
}

export type LobbyApi = ReturnType<typeof buildLobbyApi>;
