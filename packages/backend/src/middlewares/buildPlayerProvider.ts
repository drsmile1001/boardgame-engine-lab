import Elysia from "elysia";

import { SESSION_COOKIE_NAME } from "@backend/Constants";
import type { AppServices } from "@backend/app/AppServices";

export type Deps = Pick<AppServices, "PlayerResolver">;

export function buildPlayerProvider(deps: Deps) {
  return new Elysia({
    name: "PlayerProvider",
  })
    .derive(async ({ cookie }) => {
      const sessionCookie = cookie[SESSION_COOKIE_NAME];
      const sessionId = sessionCookie.value;
      const requester =
        sessionId && typeof sessionId === "string"
          ? await deps.PlayerResolver.resolvePlayer(sessionId)
          : null;

      return {
        requester,
      };
    })
    .as("scoped");
}
