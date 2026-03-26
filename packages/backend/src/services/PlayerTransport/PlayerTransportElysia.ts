import type { Logger } from "@drsmile1001/logger";
import type { ElysiaWS } from "elysia/ws";

import type {
  PlayerPayloadHandler,
  PlayerTransport,
  ReceiveFromPlayerPayload,
  SendToPlayerPayload,
} from "./PlayerTransport";

const PLAYER_TOPIC_PREFIX = "players:";
const GAME_TOPIC_PREFIX = "games:";

function getPlayerTopic(playerId: string) {
  return `${PLAYER_TOPIC_PREFIX}${playerId}`;
}

function getGameTopic(gameId: string) {
  return `${GAME_TOPIC_PREFIX}${gameId}`;
}

function toSerializablePayload(payload: SendToPlayerPayload) {
  return JSON.stringify(payload);
}

function toReceivePayload(message: unknown): ReceiveFromPlayerPayload | null {
  const parsed =
    typeof message === "string"
      ? (() => {
          try {
            return JSON.parse(message);
          } catch {
            return null;
          }
        })()
      : message;
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  const maybePayload = parsed as Record<string, unknown>;
  if (maybePayload.type !== "GAME_MOVE") {
    return null;
  }
  if (typeof maybePayload.gameId !== "string") {
    return null;
  }
  return {
    type: "GAME_MOVE",
    gameId: maybePayload.gameId,
    move: maybePayload.move,
  };
}

export class PlayerTransportElysia implements PlayerTransport {
  private readonly logger: Logger;
  private readonly wsToPlayerMap = new Map<string, string>();
  private readonly playerToWsMap = new Map<string, Set<ElysiaWS>>();
  private readonly playerToGameMap = new Map<string, Set<string>>();
  private readonly handlers = new Set<PlayerPayloadHandler>();

  constructor(logger: Logger) {
    this.logger = logger.extend("PlayerTransportElysia");
  }

  connect(playerId: string, ws: ElysiaWS): void {
    const wsId = ws.id;
    this.wsToPlayerMap.set(wsId, playerId);

    const wsSet = this.playerToWsMap.get(playerId) ?? new Set<ElysiaWS>();
    wsSet.add(ws);
    this.playerToWsMap.set(playerId, wsSet);

    ws.subscribe(getPlayerTopic(playerId));

    const joinedGameIds = this.playerToGameMap.get(playerId);
    if (!joinedGameIds) {
      return;
    }
    for (const gameId of joinedGameIds) {
      ws.subscribe(getGameTopic(gameId));
    }
  }

  disconnect(ws: ElysiaWS): void {
    const wsId = ws.id;
    const playerId = this.wsToPlayerMap.get(wsId);
    if (!playerId) {
      return;
    }
    this.wsToPlayerMap.delete(wsId);

    const wsSet = this.playerToWsMap.get(playerId);
    if (!wsSet) {
      return;
    }
    wsSet.delete(ws);
    if (wsSet.size === 0) {
      this.playerToWsMap.delete(playerId);
      if (!this.playerToGameMap.has(playerId)) {
        this.playerToGameMap.delete(playerId);
      }
    }
  }

  async receiveMessage(ws: ElysiaWS, message: unknown): Promise<void> {
    const playerId = this.wsToPlayerMap.get(ws.id);
    if (!playerId) {
      ws.send(
        toSerializablePayload({
          type: "ERROR",
          error: "Player not connected",
        })
      );
      return;
    }

    const payload = toReceivePayload(message);
    if (!payload) {
      this.sendToPlayer(playerId, {
        type: "ERROR",
        error: "Invalid message payload",
      });
      return;
    }

    for (const handler of this.handlers) {
      await handler(playerId, payload);
    }
  }

  sendToPlayer(playerId: string, payload: SendToPlayerPayload): void {
    const wsSet = this.playerToWsMap.get(playerId);
    if (!wsSet || wsSet.size === 0) {
      this.logger.debug({ playerId, payload }, "玩家不在線上，略過傳送");
      return;
    }

    const data = toSerializablePayload(payload);
    for (const ws of wsSet) {
      ws.send(data);
    }
  }

  sendToPlayersInGame(gameId: string, payload: SendToPlayerPayload): void {
    const topic = getGameTopic(gameId);
    const data = toSerializablePayload(payload);
    const firstOnlineWs = this.playerToWsMap.values().next().value;
    const ws = firstOnlineWs?.values().next().value;
    if (!ws) {
      this.logger.debug({ gameId, payload }, "無在線連線可用於廣播");
      return;
    }
    ws.publish(topic, data);
  }

  playerJoinGame(playerId: string, gameId: string): void {
    const gameIds = this.playerToGameMap.get(playerId) ?? new Set<string>();
    gameIds.add(gameId);
    this.playerToGameMap.set(playerId, gameIds);

    const wsSet = this.playerToWsMap.get(playerId);
    if (!wsSet) {
      return;
    }

    const topic = getGameTopic(gameId);
    for (const ws of wsSet) {
      ws.subscribe(topic);
    }
  }

  playerLeaveGame(playerId: string, gameId: string): void {
    const gameIds = this.playerToGameMap.get(playerId);
    if (gameIds) {
      gameIds.delete(gameId);
      if (gameIds.size === 0) {
        this.playerToGameMap.delete(playerId);
      }
    }

    const wsSet = this.playerToWsMap.get(playerId);
    if (!wsSet) {
      return;
    }

    const topic = getGameTopic(gameId);
    for (const ws of wsSet) {
      ws.unsubscribe(topic);
    }
  }

  receiveFromPlayer(handler: PlayerPayloadHandler): void {
    this.handlers.add(handler);
  }
}
