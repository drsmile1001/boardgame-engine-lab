import { describe, expect, test } from "bun:test";

import { EntityStoreInMemory } from "@drsmile1001/entity-store";

import type { Player } from "@backend/schemas/Player";
import type { Session } from "@backend/schemas/Session";
import { PlayerResolverDefault } from "@backend/services/PlayerResolver";

describe("PlayerResolverDefault", () => {
  test("session 不存在時，應回傳 null", async () => {
    const playerRepo = new EntityStoreInMemory<Player>();
    const sessionStore = new EntityStoreInMemory<Session>();
    const resolver = new PlayerResolverDefault(sessionStore, playerRepo);

    await expect(resolver.resolvePlayer("missing-session")).resolves.toBeNull();
  });

  test("session 過期時，應回傳 null 並移除 session", async () => {
    const playerRepo = new EntityStoreInMemory<Player>();
    const sessionStore = new EntityStoreInMemory<Session>();
    const resolver = new PlayerResolverDefault(sessionStore, playerRepo);

    await sessionStore.set({
      id: "expired-session",
      playerId: "player-1",
      createdAt: Date.now() - 10_000,
      expiresAt: Date.now() - 1_000,
    });

    await expect(resolver.resolvePlayer("expired-session")).resolves.toBeNull();
    await expect(sessionStore.get("expired-session")).resolves.toBeUndefined();
  });

  test("session 與 player 有效時，應回傳 player", async () => {
    const playerRepo = new EntityStoreInMemory<Player>();
    const sessionStore = new EntityStoreInMemory<Session>();
    const resolver = new PlayerResolverDefault(sessionStore, playerRepo);

    await playerRepo.set({
      id: "player-1",
      name: "player-1",
      email: null,
    });
    await sessionStore.set({
      id: "valid-session",
      playerId: "player-1",
      createdAt: Date.now() - 1_000,
      expiresAt: Date.now() + 10_000,
    });

    await expect(resolver.resolvePlayer("valid-session")).resolves.toEqual({
      id: "player-1",
      name: "player-1",
      email: null,
    });
  });
});
