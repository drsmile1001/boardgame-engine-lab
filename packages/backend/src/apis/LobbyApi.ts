import { isErr } from "@drsmile1001/utils/Result";
import Elysia, { t } from "elysia";
import { ulid } from "ulid";

import type { AppServices } from "@backend/app/AppServices";
import { buildRequesterProvider } from "@backend/middlewares/buildRequesterProvider";
import { type Match, matchBaseInfoSchema } from "@backend/schemas/Match";

export type Deps = Pick<AppServices, "Logger" | "MatchStore" | "PlayerRepo">;

export function buildLobbyApi(deps: Deps) {
  const { Logger, MatchStore } = deps;
  return new Elysia({
    name: "LobbyApi",
  })
    .use(buildRequesterProvider(deps))
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
      async ({ body, requester, status }) => {
        if (!requester) {
          return status(403, { type: "FORBIDDEN" });
        }
        const { name, gameId } = body;
        //TODO: 依據 gameId 檢查遊戲類型是否存在
        //TODO: 依據 gameId 取得遊戲預設設定
        const newMatch: Match = {
          id: ulid(),
          name,
          gameId,
          status: "WATTING_FOR_PLAYERS",
          players: [
            {
              id: requester.id,
              name: requester.name,
            },
          ],
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
          403: t.Object({
            type: t.Literal("FORBIDDEN"),
          }),
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
    );
}

export type LobbyApi = ReturnType<typeof buildLobbyApi>;
