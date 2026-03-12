import Elysia from "elysia";
import { ElysiaCustomStatusResponse } from "elysia/error";
import { ulid } from "ulid";

import type { Logger } from "~shared/Logger";

export type RequestMonitorDependency = {
  Logger: Logger;
};
export function buildRequestMonitor(
  deps: RequestMonitorDependency,
  options?: {
    logDetails?: boolean;
  }
) {
  const logger = deps.Logger;
  const fallbackLogger = logger.extend("Monitor");
  function logResponse(
    ctx: {
      store: {};
    },
    method: string,
    path: string,
    status: string | number
  ): Logger {
    const { beforeTime, logger } = ctx.store as {
      beforeTime: bigint;
      logger: Logger;
    };
    const useLogger = logger ?? fallbackLogger;
    const afterTime = process.hrtime.bigint();
    const duration = Number(afterTime - beforeTime) / 1_000_000; // ns to ms
    useLogger.info({
      event: "responded",
      emoji: "⬅️ ",
      durationMs: duration,
      status: status,
    })`${method} ${path} ${duration} ms ${status}`;
    return useLogger;
  }

  return new Elysia({
    name: "RequestMonitor",
  })
    .onRequest((ctx) => {
      const url = new URL(ctx.request.url);
      const { pathname, searchParams } = url;
      const requestLogger = logger.extend("Request", {
        rid: ulid(),
        method: ctx.request.method,
        path: pathname,
        searchParams,
      });
      requestLogger.info({
        event: "received",
        emoji: "➡️ ",
      })`${ctx.request.method} ${pathname}`;
      ctx.store = {
        beforeTime: process.hrtime.bigint(),
        logger: requestLogger,
      };
    })
    .onAfterResponse((ctx) => {
      logResponse(ctx, ctx.request.method, ctx.path, ctx.set.status ?? 200);
      if (options?.logDetails) {
        const { logger } = ctx.store as { logger: Logger };
        logger.debug({
          requestHeaders: ctx.request.headers,
          requestBody: ctx.body,
          response: ctx.response,
          status: ctx.set.status,
        })`API 請求與回應紀錄`;
      }
    })
    .onError((ctx) => {
      const errorResponse = ctx.error as ElysiaCustomStatusResponse<
        number,
        unknown
      >;
      if(ctx.error instanceof Response && ctx.error.status >= 300 && ctx.error.status < 400){
        return;
      }
      if (errorResponse.code && errorResponse.response) {
        logResponse(ctx, ctx.request.method, ctx.path, errorResponse.code);
        return;
      }
      switch (ctx.code) {
        case "NOT_FOUND":
          logResponse(ctx, ctx.request.method, ctx.path, 404); //XXX NOT_FOUND 沒有進到 onAfterResponse
          return;
        case "INVALID_COOKIE_SIGNATURE":
        case "INVALID_FILE_TYPE":
        case "PARSE":
          return;
        case "VALIDATION":
          if (ctx.error.type === "response") {
            logger.error(
              { error: ctx.error, event: "InvaildResponse" },
              "回應資料驗證錯誤"
            );
            ctx.set.status = 500;
            logResponse(ctx, ctx.request.method, ctx.path, 500);
            return "Internal Server Error: Invaild Response";
          }
          return;
        default:
          logger.error(
            { error: ctx.error, event: "onError" },
            "server 內部錯誤"
          );
          logResponse(ctx, ctx.request.method, ctx.path, 500);
          return "Internal Server Error";
      }
    })
    .as("global");
}

export function buildRequestLoggerProvider(deps: RequestMonitorDependency) {
  const baseLogger = deps.Logger;
  return new Elysia({
    name: "RequestLoggerProvider",
  })
    .derive(({ store, request, path }) => {
      const loggerInStore = (store as any).logger as Logger | undefined;
      return {
        logger:
          loggerInStore ??
          baseLogger.extend("Request", {
            rid: ulid(),
            method: request.method,
            path,
          }),
      };
    })
    .as("scoped");
}
