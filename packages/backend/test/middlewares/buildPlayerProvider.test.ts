import { describe, expect, test } from "bun:test";

import { treaty } from "@elysiajs/eden";
import { Elysia } from "elysia";

import { SESSION_COOKIE_NAME } from "@backend/Constants";
import { buildPlayerProvider } from "@backend/middlewares/buildPlayerProvider";
import type { Player } from "@backend/schemas/Player";
import { PlayerResolverFake } from "@backend/services/PlayerResolver";

describe("buildPlayerProvider", () => {
  test("cookie 缺失時，requester 應為 null", async () => {
    const PlayerResolver = new PlayerResolverFake();
    const app = new Elysia()
      .use(buildPlayerProvider({ PlayerResolver }))
      .get("/probe", ({ requester }) => ({ hasRequester: requester !== null }));
    const eden = treaty(app);

    const result = await eden.probe.get();

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ hasRequester: false });
  });

  test("cookie 存在且可解析時，應注入 requester", async () => {
    const PlayerResolver = new PlayerResolverFake();
    const requester: Player = {
      id: "player-1",
      name: "player-1",
      email: null,
    };
    PlayerResolver.set("session-1", requester);

    const app = new Elysia()
      .use(buildPlayerProvider({ PlayerResolver }))
      .get("/probe", ({ requester }) => ({ hasRequester: requester !== null }));
    const eden = treaty(app);

    const result = await eden.probe.get({
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=session-1`,
      },
    });

    expect(result.status).toBe(200);
    expect(result.data).toEqual({ hasRequester: true });
  });
});
