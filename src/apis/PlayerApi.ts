import Elysia, { t } from "elysia";
import { ulid } from "ulid";

import type { AppServices } from "@/app/AppServices";
import { buildRequesterProvider } from "@/middlewares/buildRequesterProvider";
import { type Player, playerSchema } from "@/schemas/Player";

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
      "/api/self",
      async ({ body, setRequester }) => {
        //TODO: 中斷先前的玩家身分
        const newPlayer: Player = {
          id: ulid(),
          name: body.name,
        };
        await PlayerRepo.set(newPlayer);
        setRequester(newPlayer);
        return newPlayer;
      },
      {
        detail: { summary: "註冊成為新玩家" },
        body: t.Object({
          name: t.String({ description: "玩家名稱" }),
        }),
        response: {
          200: playerSchema,
          400: t.Object({}),
        },
      }
    );
}

export type PlayerApi = ReturnType<typeof buildPlayerApi>;
