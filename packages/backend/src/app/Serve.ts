import { Elysia, t } from "elysia";

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

  let coutner = 0;

  const eventHandlers: Record<string, (payload: any) => void> = {};

  const app = new Elysia()
    .ws("/ws", {
      open(ws) {
        const connectionId = ws.id;
        if (!eventHandlers[connectionId]) {
          eventHandlers[connectionId] = (payload: any) => {
            ws.send(JSON.stringify(payload));
          };
          logger.info({
            event: "ws-connect",
            emoji: "🔌",
          })`WebSocket 連線已建立，連線 ID: ${connectionId}`;
        }
      },
      close(ws) {
        const connectionId = ws.id;
        delete eventHandlers[connectionId];
        logger.info({
          event: "ws-disconnect",
          emoji: "❌",
        })`WebSocket 連線已關閉，連線 ID: ${connectionId}`;
      },
      message(ws, message) {
        logger.info({
          event: "ws-message",
          emoji: "💬",
        })`收到 WebSocket 訊息: action:${message.action}`;
        if (message.action === "counter-add") {
          coutner += 1;
        } else if (message.action === "counter-reset") {
          coutner = 0;
        }
        logger.info({
          event: "ws-counter-update",
          emoji: "🔢",
        })`計數器更新為: ${coutner}`;
        for (const eventHandler of Object.values(eventHandlers)) {
          eventHandler({ counter: coutner });
        }
      },
      body: t.Object({
        action: t.Union([t.Literal("counter-add"), t.Literal("counter-reset")]),
      }),
    })
    .get("/api/now", () => {
      baseLogger.info()`收到 /api/now 請求`;
      return { now: new Date().toISOString() };
    });

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
