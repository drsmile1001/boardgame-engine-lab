import { expect, test } from "bun:test";

import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createDefaultLoggerFromEnv } from "@drsmile1001/logger";

import type { Game } from "@backend/schemas/Game";
import { GameStoreSplitYaml } from "@backend/services/GameStore";

test("GameStoreSplitYaml persists games in split yaml files", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "game-store-split-yaml-"));
  const storePath = join(tempDir, "game-saves");

  try {
    const store = new GameStoreSplitYaml(
      createDefaultLoggerFromEnv(),
      storePath
    );
    await store.init();

    expect(await readdir(storePath)).toEqual([]);
    expect(await store.list()).toEqual([]);

    const game: Game = {
      id: "game-1",
      name: "Test Game",
      gameId: "gomoku",
      status: "WATTING_FOR_PLAYERS" as const,
      players: [
        {
          id: "player-1",
          name: "Alice",
          email: null,
        },
      ],
    };

    await store.set(game);

    expect(await store.get("game-1")).toEqual(game);
    expect(await store.list()).toEqual([
      {
        id: "game-1",
        name: "Test Game",
        gameId: "gomoku",
        status: "WATTING_FOR_PLAYERS",
      },
    ]);

    const filePath = join(storePath, "game-1.yaml");
    const raw = await readFile(filePath, "utf-8");
    expect(Bun.YAML.parse(raw)).toEqual({
      version: 0,
      data: game,
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
