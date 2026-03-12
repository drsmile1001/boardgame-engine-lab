import staticPlugin from "@elysiajs/static";
import { Elysia, t } from "elysia";

import type { Logger } from "~shared/Logger";
import { ServiceMapBuilder } from "~shared/ServiceMap";
import { AsyncLock } from "~shared/utils/AsyncLock";

import { buildLobbyApi } from "@/apis/LobbyApi";
import { buildPlayerApi } from "@/apis/PlayerApi";
import { buildPlayerSocket } from "@/apis/PlayerSocket";
import { buildRequestMonitor } from "@/middlewares/RequestMonitor";
import { GameStoreDefault } from "@/services/MatchStore";
import { PlayerRepoYaml } from "@/services/PlayerRepoYaml";

import index from "@public/index.html";

import type { AppServices } from "./AppServices";

export async function serve(baseLogger: Logger) {
  const logger = baseLogger.extend("Server");
  const server = await buildServer(logger);
  server.listen();

  const shutdownLock = new AsyncLock();
  async function shutdown(signal: string) {
    logger.info({
      event: "shutdown-signal",
      emoji: "📲",
    })`收到關閉信號：${signal}`;
    await shutdownLock.run(async () => {
      await server.dispose();
      logger.info({
        event: "shutdown",
        emoji: "🛑",
      })`所有服務已關閉，準備退出`;
    });
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

async function buildServer(baseLogger: Logger) {
  const logger = baseLogger.extend("Server");
  const services = await ServiceMapBuilder.create<AppServices>()
    .register("Logger", logger)
    .register(
      "PlayerRepo",
      ({ Logger }) => new PlayerRepoYaml(Logger, "players.yaml")
    )
    .register(
      "MatchStore",
      ({ Logger }) => new GameStoreDefault(Logger, "game-saves")
    )
    // .register(
    //   "SessionTransport",
    //   ({ Logger }) => new SessionTransportDefault(Logger)
    // )
    // .register("GameRunner", (deps) => new GameRunner(deps))
    .build();

  const app = new Elysia()
    .use(buildRequestMonitor(services))
    .use(buildPlayerSocket(services))
    .use(buildPlayerApi(services))
    .use(buildLobbyApi(services))
    .use(
      await staticPlugin({
        prefix: "/",
        assets: "public",
      })
    )
    .get("/*", index);

  return {
    listen: () =>
      app.listen(3000, ({ hostname, port }) => {
        logger.info({
          event: "listen",
          emoji: "🚀",
          hostname,
          port,
        })`伺服器開始聆聽，在 http://${hostname}:${port}`;
      }),
    dispose: async () => {
      await app.stop();
    },
  };
}
