import Elysia from "elysia";

import type { AppServices } from "@backend/app/AppServices";

export type Deps = Pick<
  AppServices,
  "Logger" | "PlayerRepo" | "PlayerTransport"
>;

export function buildPlayerSocket(deps: Deps) {
  const { PlayerTransport } = deps;
  const api = new Elysia({
    name: "PlayerSocket",
  }).ws("/ws", {
    open(ws) {
      ws.subscribe("chat");
    },
    close(ws) {
      ws.unsubscribe("chat");
    },
    message(ws, message) {
      ws.publish("chat", message);
    },
  });
  api.server?.publish("startup", "PlayerSocket API started");
  return api;
}

export type PlayerSocket = ReturnType<typeof buildPlayerSocket>;
