import staticPlugin from "@elysiajs/static";
import { Elysia } from "elysia";

import type { Logger } from "~shared/Logger";
import { AsyncLock } from "~shared/utils/AsyncLock";

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
  const app = new Elysia()
    .get("/api/now", () => {
      baseLogger.info()`收到 /api/now 請求`;
      return { now: new Date().toISOString() };
    })
    .use(
      await staticPlugin({
        prefix: "/",
        assets: "src/public",
      })
    );

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
