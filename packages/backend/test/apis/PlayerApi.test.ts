import { describe, expect, test } from "bun:test";

import { EntityStoreInMemory } from "@drsmile1001/entity-store";
import { buildTestLogger, withContext } from "@drsmile1001/testkit";
import { treaty } from "@elysiajs/eden";

import {
  SESSION_COOKIE_NAME,
  SESSION_LIFETIME_SECONDS,
} from "@backend/Constants";
import { type Deps, buildPlayerApi } from "@backend/apis/PlayerApi";
import { type Player } from "@backend/schemas/Player";
import { type Session } from "@backend/schemas/Session";
import { PlayerResolverDefault } from "@backend/services/PlayerResolver";

describe("PlayerApi", () => {
  async function buildContext() {
    const Logger = buildTestLogger();
    const PlayerRepo = new EntityStoreInMemory<Player>();
    const SessionStore = new EntityStoreInMemory<Session>();
    const PlayerResolver = new PlayerResolverDefault(SessionStore, PlayerRepo);

    const deps: Deps = {
      Logger,
      PlayerRepo,
      SessionStore,
      PlayerResolver,
    };

    const api = buildPlayerApi(deps);

    const eden = treaty(api);

    return {
      Logger,
      PlayerRepo,
      SessionStore,
      api,
      eden,
    };
  }

  test(
    "GET /api/self - 當前請求者不存在時，應該回傳 401",
    withContext(buildContext, async ({ eden }) => {
      const result = await eden.api.self.get();
      expect(result.error?.status).toBe(401);
    })
  );

  test(
    "GET /api/self - 有請求者時，應該回傳玩家資訊",
    withContext(buildContext, async ({ PlayerRepo, SessionStore, eden }) => {
      const player: Player = {
        id: "user-123",
        name: "Test User",
        email: null,
      };
      const session: Session = {
        id: "session-123",
        playerId: player.id,
        createdAt: Date.now() - 1000,
        expiresAt: Date.now() + 60 * 1000,
      };

      await PlayerRepo.set(player);
      await SessionStore.set(session);

      const result = await eden.api.self.get({
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=session-123`,
        },
      });

      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        id: "user-123",
        name: "Test User",
        email: null,
      });
    })
  );

  test(
    "POST /api/register/anonymous - 應建立玩家與 session 並設定 cookie",
    withContext(buildContext, async ({ PlayerRepo, SessionStore, eden }) => {
      const result = await eden.api.register.anonymous.post();

      expect(result.status).toBe(200);
      const player = result.data!;
      expect(player).toEqual({
        id: player.id,
        name: "player#1",
        email: null,
      });

      const setCookie = result.response.headers.getSetCookie()[0] ?? "";
      expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain(`Max-Age=${SESSION_LIFETIME_SECONDS}`);

      const storedPlayer = await PlayerRepo.get(player.id);
      expect(storedPlayer).toEqual(player);

      const sessionId = setCookie
        .split(";")[0]
        ?.replace(`${SESSION_COOKIE_NAME}=`, "");
      expect(sessionId).toBeString();

      const session = await SessionStore.get(sessionId!);
      expect(session?.id).toBe(sessionId);
      expect(session?.playerId).toBe(player.id);
      expect(session?.createdAt).toBeNumber();
      expect(session?.expiresAt).toBeNumber();
      expect(session?.expiresAt).toBeGreaterThan(session?.createdAt ?? 0);
    })
  );

  test(
    "POST /api/register/anonymous - 若已有舊 session，應先移除舊 session",
    withContext(buildContext, async ({ PlayerRepo, SessionStore, eden }) => {
      await PlayerRepo.set({
        id: "old-player",
        name: "old-player",
        email: null,
      });
      await SessionStore.set({
        id: "old-session",
        playerId: "old-player",
        createdAt: Date.now() - 1000,
        expiresAt: Date.now() + 60 * 1000,
      });

      const result = await eden.api.register.anonymous.post(undefined, {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=old-session`,
        },
      });

      expect(result.status).toBe(200);
      expect(await SessionStore.get("old-session")).toBeUndefined();

      const setCookie = result.response.headers.getSetCookie()[0] ?? "";
      const newSessionId = setCookie
        .split(";")[0]
        ?.replace(`${SESSION_COOKIE_NAME}=`, "");
      expect(newSessionId).toBeString();
      expect(await SessionStore.get(newSessionId!)).toBeDefined();
    })
  );

  test(
    "POST /api/logout - session 存在時應刪除 session 並清除 cookie",
    withContext(buildContext, async ({ PlayerRepo, SessionStore, eden }) => {
      await PlayerRepo.set({
        id: "player-1",
        name: "player-1",
        email: null,
      });
      await SessionStore.set({
        id: "session-1",
        playerId: "player-1",
        createdAt: Date.now() - 1000,
        expiresAt: Date.now() + 60 * 1000,
      });

      const result = await eden.api.logout.post(undefined, {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=session-1`,
        },
      });

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ success: true });
      expect(await SessionStore.get("session-1")).toBeUndefined();

      const setCookie = result.response.headers.getSetCookie()[0] ?? "";
      expect(setCookie).toContain(`${SESSION_COOKIE_NAME}=`);
      expect(setCookie).toContain("Max-Age=0");
    })
  );

  test(
    "POST /api/logout - session 不存在時仍應回傳 200",
    withContext(buildContext, async ({ eden }) => {
      const result = await eden.api.logout.post(undefined, {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=missing-session`,
        },
      });

      expect(result.status).toBe(200);
      expect(result.data).toEqual({ success: true });
    })
  );
});
