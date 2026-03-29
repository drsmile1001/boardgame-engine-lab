import Elysia, { t } from "elysia";
import { ulid } from "ulid";

import type { AppServices } from "@backend/app/AppServices";
import { buildRequesterProvider } from "@backend/middlewares/buildRequesterProvider";
import { type Player, playerSchema } from "@backend/schemas/Player";

export type Deps = Pick<AppServices, "Logger" | "PlayerRepo">;

export function buildPlayerApi(deps: Deps) {
  const { PlayerRepo } = deps;
  return new Elysia({
    name: "PlayerApi",
  })
    .use(buildRequesterProvider(deps))
    .get(
      "/api/self",
      async ({ requester, status }) => {
        if (!requester) {
          return status(404, null);
        }
        return requester;
      },
      {
        detail: { summary: "取得目前請求者的玩家資訊" },
        response: {
          200: playerSchema,
          404: t.Unknown(),
        },
      }
    )
    .post(
      "/api/register/anonymous",
      async ({ setRequester }) => {
        //TODO: 中斷先前的玩家身分
        const players = await PlayerRepo.list();
        const newPlayer: Player = {
          id: ulid(),
          name: `player#${players.length + 1}`,
          email: null,
        };
        await PlayerRepo.set(newPlayer);
        setRequester(newPlayer);
        return newPlayer;
      },
      {
        detail: { summary: "註冊成匿名玩家" },
        response: {
          200: playerSchema,
        },
      }
    );
}

export type PlayerApi = ReturnType<typeof buildPlayerApi>;
