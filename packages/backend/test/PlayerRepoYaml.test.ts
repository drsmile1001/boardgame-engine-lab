import { expect, test } from "bun:test";

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { createDefaultLoggerFromEnv } from "@drsmile1001/logger";

import { PlayerRepoYaml } from "@backend/services/PlayerRepo";

test("PlayerRepoYaml persists players with entity-store yaml format", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "player-repo-yaml-"));
  const filePath = join(tempDir, "players.yaml");

  try {
    const repo = new PlayerRepoYaml(createDefaultLoggerFromEnv(), filePath);
    await repo.init();

    expect(await repo.list()).toEqual([]);

    await repo.set({ id: "player-1", name: "Alice", email: null });

    expect(await repo.get("player-1")).toEqual({
      id: "player-1",
      name: "Alice",
      email: null,
    });
    expect(await repo.list()).toEqual([
      { id: "player-1", name: "Alice", email: null },
    ]);

    const raw = await readFile(filePath, "utf-8");
    expect(Bun.YAML.parse(raw)).toEqual({
      version: 0,
      data: [{ id: "player-1", name: "Alice", email: null }],
    });

    const reloadedRepo = new PlayerRepoYaml(
      createDefaultLoggerFromEnv(),
      filePath
    );
    await reloadedRepo.init();

    expect(await reloadedRepo.get("player-1")).toEqual({
      id: "player-1",
      name: "Alice",
      email: null,
    });
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});
