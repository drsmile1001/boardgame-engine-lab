import Elysia, { t } from "elysia";
import { ulid } from "ulid";

import type { AppServices } from "@backend/app/AppServices";
import { buildPlayerProvider } from "@backend/middlewares/buildPlayerProvider";
import { type Game, gameBaseInfoSchema } from "@backend/schemas/Game";

export type Deps = Pick<
  AppServices,
  "Logger" | "GameStore" | "PlayerResolver" | "PlayerTransport"
>;

export function buildLobbyApi(deps: Deps) {
  const { Logger, GameStore, PlayerTransport } = deps;
  return new Elysia({
    name: "LobbyApi",
  })
    .use(buildPlayerProvider(deps))
    .get(
      "/api/games",
      async () => {
        return await GameStore.list();
      },
      {
        response: {
          200: t.Array(gameBaseInfoSchema),
        },
      }
    )
    .post(
      "/api/games",
      async ({ body, requester, status }) => {
        if (!requester) {
          return status(403, { type: "FORBIDDEN" });
        }
        const { name, gameId } = body;
        //TODO: 依據 gameId 檢查遊戲類型是否存在
        //TODO: 依據 gameId 取得遊戲預設設定
        const newGame: Game = {
          id: ulid(),
          name,
          gameId,
          status: "WATTING_FOR_PLAYERS",
          players: [
            {
              id: requester.id,
              name: requester.name,
              email: requester.email,
            },
          ],
        };
        await GameStore.set(newGame);
        PlayerTransport.playerJoinGame(requester.id, newGame.id);
        return newGame;
      },
      {
        body: t.Object({
          name: t.String({ description: "對局名稱" }),
          gameId: t.String({ description: "遊戲類型ID" }),
        }),
        response: {
          200: gameBaseInfoSchema,
          400: t.Union([
            t.Object({
              type: t.Literal("GAME_NOT_FOUND"),
            }),
            t.Object({
              type: t.Literal("INVALID_SETUP_CONTEXT"),
            }),
          ]),
          403: t.Object({
            type: t.Literal("FORBIDDEN"),
          }),
        },
      }
    )
    .get(
      "/api/games/:gameId",
      async ({ params, status }) => {
        const game = await GameStore.get(params.gameId);
        if (!game) {
          return status(404, { type: "GAME_NOT_FOUND" });
        }
        return game;
      },
      {
        response: {
          200: gameBaseInfoSchema,
          404: t.Object({
            type: t.Literal("GAME_NOT_FOUND"),
          }),
        },
      }
    );
}

export type LobbyApi = ReturnType<typeof buildLobbyApi>;
