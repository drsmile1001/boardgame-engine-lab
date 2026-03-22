import { expect, test } from "bun:test";

import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createDefaultLoggerFromEnv } from "@drsmile1001/logger";

import { MatchStoreSplitYaml } from "@backend/services/MatchStore";

test("MatchStoreSplitYaml persists matches in split yaml files", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "match-store-split-yaml-"));
  const storePath = join(tempDir, "game-saves");

  try {
    const store = new MatchStoreSplitYaml(
      createDefaultLoggerFromEnv(),
      storePath
    );
    await store.init();

    expect(await readdir(storePath)).toEqual([]);
    expect(await store.list()).toEqual([]);

    const match = {
      id: "match-1",
      name: "Test Match",
      gameId: "gomoku",
      status: "WATTING_FOR_PLAYERS" as const,
      players: [
        {
          id: "player-1",
          name: "Alice",
        },
      ],
    };

    await store.set(match);

    expect(await store.get("match-1")).toEqual(match);
    expect(await store.list()).toEqual([
      {
        id: "match-1",
        name: "Test Match",
        gameId: "gomoku",
        status: "WATTING_FOR_PLAYERS",
      },
    ]);

    const filePath = join(storePath, "match-1.yaml");
    const raw = await readFile(filePath, "utf-8");
    expect(Bun.YAML.parse(raw)).toEqual({
      version: 0,
      data: match,
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
