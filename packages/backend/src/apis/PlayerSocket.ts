import Elysia from "elysia";

import type { AppServices } from "@backend/app/AppServices";
import { buildRequesterProvider } from "@backend/middlewares/buildRequesterProvider";

export type Deps = Pick<
  AppServices,
  "Logger" | "PlayerRepo" | "PlayerTransport"
>;

export function buildPlayerSocket(deps: Deps) {
  const { PlayerTransport } = deps;
  const api = new Elysia({
    name: "PlayerSocket",
  })
    .use(buildRequesterProvider(deps))
    .ws("/ws", {
      open(ws) {
        const playerId = ws.data.requester?.id;
        if (!playerId) {
          ws.close(4401, "Unauthorized");
          return;
        }
        PlayerTransport.connect(playerId, ws);
      },
      close(ws) {
        PlayerTransport.disconnect(ws);
      },
      message(ws, message) {
        PlayerTransport.receiveMessage(ws, message);
      },
    });
  return api;
}

export type PlayerSocket = ReturnType<typeof buildPlayerSocket>;
