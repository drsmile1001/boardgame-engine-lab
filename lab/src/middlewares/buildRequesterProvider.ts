import Elysia from "elysia";

import type { AppServices } from "@/app/AppServices";
import type { Player } from "@/schemas/Player";

export type Deps = Pick<AppServices, "PlayerRepo">;

export const SESSION_COOKIE_NAME = "BG_ENGINE_SESSION_ID";

export function buildRequesterProvider(deps: Deps) {
  return new Elysia({
    name: "RequesterProvider",
  })
    .derive(async ({ cookie }) => {
      const sessionCookie = cookie[SESSION_COOKIE_NAME];
      const sessionId = sessionCookie.value;
      let requester: Player | undefined = undefined;
      if (sessionId && typeof sessionId === "string") {
        requester = await deps.PlayerRepo.get(sessionId);
      }

      function setRequester(player: Player) {
        requester = player;
        sessionCookie.value = player.id;
        sessionCookie.maxAge = 60 * 60 * 24 * 30; // 30 天
        sessionCookie.expires = new Date(Date.now() + 60 * 60 * 24 * 30 * 1000);
      }

      return {
        requester,
        setRequester,
      };
    })
    .as("scoped");
}
