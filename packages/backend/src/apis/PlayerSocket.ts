import Elysia from "elysia";

import type { AppServices } from "@backend/app/AppServices";
import { buildPlayerProvider } from "@backend/middlewares/buildPlayerProvider";

export type Deps = Pick<
  AppServices,
  "Logger" | "PlayerResolver" | "PlayerTransport"
>;

export function buildPlayerSocket(deps: Deps) {
  const { PlayerTransport } = deps;
  const api = new Elysia({
    name: "PlayerSocket",
  })
    .use(buildPlayerProvider(deps))
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
