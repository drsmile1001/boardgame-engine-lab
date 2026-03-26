import { describe, expect, test } from "bun:test";

import { buildTestLogger } from "@drsmile1001/testkit";
import type { ElysiaWS } from "elysia/ws";

import { PlayerTransportElysia } from "@backend/services/PlayerTransport";

type PublishCall = {
  topic: string;
  data: string;
};

function createFakeWs(id: string) {
  const sent: string[] = [];
  const subscriptions = new Set<string>();
  const unsubscribed = new Set<string>();
  const publishCalls: PublishCall[] = [];
  const ws = {
    id,
    send(data: string) {
      sent.push(data);
      return data.length;
    },
    subscribe(topic: string) {
      subscriptions.add(topic);
    },
    unsubscribe(topic: string) {
      unsubscribed.add(topic);
      subscriptions.delete(topic);
    },
    publish(topic: string, data: string) {
      publishCalls.push({ topic, data });
      return data.length;
    },
  } as unknown as ElysiaWS;

  return {
    ws,
    sent,
    subscriptions,
    unsubscribed,
    publishCalls,
  };
}

describe("PlayerTransportElysia", () => {
  test("sendToPlayer 會送到同玩家所有連線", () => {
    const transport = new PlayerTransportElysia(buildTestLogger());
    const ws1 = createFakeWs("ws-1");
    const ws2 = createFakeWs("ws-2");

    transport.connect("player-1", ws1.ws);
    transport.connect("player-1", ws2.ws);

    transport.sendToPlayer("player-1", {
      type: "GAME_NOT_FOUND",
      gameId: "game-1",
    });

    expect(ws1.sent).toEqual([
      JSON.stringify({
        type: "GAME_NOT_FOUND",
        gameId: "game-1",
      }),
    ]);
    expect(ws2.sent).toEqual([
      JSON.stringify({
        type: "GAME_NOT_FOUND",
        gameId: "game-1",
      }),
    ]);
  });

  test("receiveMessage 會轉交有效 payload，無效 payload 回錯誤", async () => {
    const transport = new PlayerTransportElysia(buildTestLogger());
    const ws1 = createFakeWs("ws-1");

    transport.connect("player-1", ws1.ws);

    const received: Array<{ playerId: string; gameId: string; move: unknown }> =
      [];
    transport.receiveFromPlayer((playerId, payload) => {
      received.push({
        playerId,
        gameId: payload.gameId,
        move: payload.move,
      });
    });

    await transport.receiveMessage(
      ws1.ws,
      JSON.stringify({
        type: "GAME_MOVE",
        gameId: "game-1",
        move: { x: 1, y: 2 },
      })
    );

    expect(received).toEqual([
      {
        playerId: "player-1",
        gameId: "game-1",
        move: { x: 1, y: 2 },
      },
    ]);

    await transport.receiveMessage(ws1.ws, {
      type: "UNKNOWN",
    });

    expect(JSON.parse(ws1.sent[0]!)).toEqual({
      type: "ERROR",
      error: "Invalid message payload",
    });
  });

  test("playerJoinGame 與 playerLeaveGame 會更新 topic 訂閱", () => {
    const transport = new PlayerTransportElysia(buildTestLogger());
    const ws1 = createFakeWs("ws-1");
    const ws2 = createFakeWs("ws-2");

    transport.connect("player-1", ws1.ws);
    transport.connect("player-1", ws2.ws);

    transport.playerJoinGame("player-1", "game-1");

    expect(ws1.subscriptions.has("players:player-1")).toBeTrue();
    expect(ws2.subscriptions.has("players:player-1")).toBeTrue();
    expect(ws1.subscriptions.has("games:game-1")).toBeTrue();
    expect(ws2.subscriptions.has("games:game-1")).toBeTrue();

    transport.playerLeaveGame("player-1", "game-1");

    expect(ws1.unsubscribed.has("games:game-1")).toBeTrue();
    expect(ws2.unsubscribed.has("games:game-1")).toBeTrue();
  });

  test("sendToPlayersInGame 會透過 game topic 廣播", () => {
    const transport = new PlayerTransportElysia(buildTestLogger());
    const ws1 = createFakeWs("ws-1");

    transport.connect("player-1", ws1.ws);

    transport.sendToPlayersInGame("game-1", {
      type: "GAME_STATE_UPDATE",
      gameId: "game-1",
      state: { board: [] },
    });

    expect(ws1.publishCalls).toEqual([
      {
        topic: "games:game-1",
        data: JSON.stringify({
          type: "GAME_STATE_UPDATE",
          gameId: "game-1",
          state: { board: [] },
        }),
      },
    ]);
  });
});
