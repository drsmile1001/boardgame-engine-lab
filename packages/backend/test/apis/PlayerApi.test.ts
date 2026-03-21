import { describe, expect, test } from "bun:test";

import { EntityStoreInMemory } from "@drsmile1001/entity-store";
import {
  buildTestLogger,
  expectHasSubset,
  withContext,
} from "@drsmile1001/testkit";
import { treaty } from "@elysiajs/eden";

import { type Deps, buildPlayerApi } from "@backend/apis/PlayerApi";
import { SESSION_COOKIE_NAME } from "@backend/middlewares/buildRequesterProvider";
import { type Player } from "@backend/schemas/Player";

describe("PlayerApi", () => {
  async function buildContext() {
    const Logger = buildTestLogger();
    const PlayerRepo = new EntityStoreInMemory<Player>();
    const deps: Deps = {
      Logger,
      PlayerRepo,
    };

    const api = buildPlayerApi(deps);

    const eden = treaty(api);

    return {
      Logger,
      PlayerRepo,
      api,
      eden,
    };
  }

  test(
    "GET /api/self - 當前請求者不存在時，應該回傳 404",
    withContext(buildContext, async ({ eden }) => {
      const result = await eden.api.self.get();
      expect(result.error?.status).toBe(404);
    })
  );

  test(
    "GET /api/self - 有請求者時，應該回傳玩家資訊",
    withContext(buildContext, async ({ PlayerRepo, eden }) => {
      await PlayerRepo.set({
        id: "user-123",
        name: "Test User",
      });
      const result = await eden.api.self.get({
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=user-123`,
        },
      });
      expect(result.status).toBe(200);
      expect(result.data).toEqual({
        id: "user-123",
        name: "Test User",
      });
    })
  );

  test(
    "POST /api/self - 註冊新玩家，應該回傳玩家資訊並設定 session",
    withContext(buildContext, async ({ PlayerRepo, eden }) => {
      const result = await eden.api.self.post({
        name: "New Player",
      });
      expect(result.status).toBe(200);
      expect(result.response.headers.getSetCookie()[0]).toStartWith(
        `${SESSION_COOKIE_NAME}=`
      );
      expect(result.headers).toBeDefined();
      const player = result.data!;
      expectHasSubset(player, {
        name: "New Player",
      });
      const retrievedPlayer = PlayerRepo.get(player.id)!;
      expectHasSubset(retrievedPlayer, {
        name: "New Player",
      });
    })
  );
});
