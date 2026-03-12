import Elysia from "elysia";

import type { AppServices } from "@backend/app/AppServices";

export type Deps = Pick<AppServices, "Logger" | "PlayerRepo">;

export function buildPlayerSocket(deps: Deps) {
  const { Logger } = deps;
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

export type PlayerApi = ReturnType<typeof buildPlayerSocket>;
