import { readFile, readdir, stat, writeFile } from "node:fs/promises";

import { createDefaultLoggerFromEnv } from "@drsmile1001/logger";
import { safeExit } from "@drsmile1001/safe-exit";
import { ServiceMapBuilder } from "@drsmile1001/service-map";
import { Elysia, file } from "elysia";

import { buildLobbyApi } from "./apis/LobbyApi";
import { buildPlayerApi } from "./apis/PlayerApi";
import { buildPlayerSocket } from "./apis/PlayerSocket";
import type { AppServices } from "./app/AppServices";
import { buildRequestMonitor } from "./middlewares/RequestMonitor";
import { GameStoreDefault } from "./services/MatchStore";
import { PlayerRepoYaml } from "./services/PlayerRepoYaml";

const logger = createDefaultLoggerFromEnv();

const baseUrl = process.env.BASE_URL || "/";
const baseUrlPlaceholder = "/__BASE_URL_TO_REPLACE__/";
const googleClientId = Bun.env.GOOGLE_CLIENT_ID;
const googleClientIdPlaceholder = "__GOOGLE_CLIENT_ID__";

async function rewriteBaseUrl(root: string) {
  const rootExists = await stat(root)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (!rootExists && Bun.env.NODE_ENV !== "production") {
    return;
  }
  const entries = await readdir(root, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = `${root}/${entry.name}`;
    if (entry.isDirectory()) {
      await rewriteBaseUrl(fullPath);
      continue;
    }

    if (
      entry.name.endsWith(".js") ||
      entry.name.endsWith(".css") ||
      entry.name.endsWith(".html")
    ) {
      const content = await readFile(fullPath, "utf-8");
      const replaced = content
        .replaceAll(baseUrlPlaceholder, baseUrl)
        .replaceAll(googleClientIdPlaceholder, googleClientId || "");

      await writeFile(fullPath, replaced, "utf-8");
    }
  }
}

await rewriteBaseUrl("public");
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
  .get("/*", async ({ path }) => {
    const allowedExtensions = [
      ".js",
      ".css",
      ".html",
      ".png",
      ".jpg",
      ".svg",
      ".ico",
      ".json",
    ];
    const hasAllowedExtension = allowedExtensions.some((ext) =>
      path.endsWith(ext)
    );
    if (!hasAllowedExtension) {
      return file("public/index.html");
    }
    const filePath = `public${path}`;
    const fileExists = await stat(filePath)
      .then((s) => s.isFile())
      .catch(() => false);
    if (fileExists) {
      return file(filePath);
    }
    return file("public/index.html");
  })
  .get("/*", () => file("public/index.html"))
  .listen(3000, (server) => {
    logger.info(`伺服器已啟動，監聽於 http://localhost:3000${baseUrl}`);
  });

safeExit(logger, async () => {
  await app.stop(true);
});

export type Api = typeof app;
