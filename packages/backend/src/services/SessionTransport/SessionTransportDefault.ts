import type { Logger } from "@drsmile1001/logger";

import type {
  MessagerSender,
  PlayerMessageHandler,
  SessionTransport,
} from "./SessionTransport";

export type PlayerConnection = {
  gameId: string;
  playerId: string;
  connectionId: string;
  send: MessagerSender;
};

export class SessionTransportDefault implements SessionTransport {
  logger: Logger;
  connections: PlayerConnection[] = [];
  playerMessageHandlers: PlayerMessageHandler[] = [];

  constructor(logger: Logger) {
    this.logger = logger.extend("SessionTransportDefault");
  }
  connect(
    gameId: string,
    playerId: string,
    connectionId: string,
    send: (payload: unknown) => void
  ): void {
    this.connections = this.connections.filter(
      (conn) =>
        conn.connectionId !== connectionId &&
        !(conn.gameId === gameId && conn.playerId === playerId)
    );
    this.connections.push({ gameId, playerId, connectionId, send });

    this.logger.info({
      event: "connect",
      emoji: "🔌",
    });
    `玩家已連線，遊戲 ID: ${gameId}，玩家 ID: ${playerId}，連線 ID: ${connectionId}`;
  }
  disconnect(connectionId: string): void {
    const connection = this.connections.find(
      (conn) => conn.connectionId === connectionId
    );
    if (connection) {
      this.connections = this.connections.filter(
        (conn) => conn.connectionId !== connectionId
      );
      this.logger.info({
        event: "disconnect",
        emoji: "❌",
      });
      `玩家已斷線，遊戲 ID: ${connection.gameId}，玩家 ID: ${connection.playerId}，連線 ID: ${connectionId}`;
    }
  }
  async receiveMessage(connectionId: string, message: unknown): Promise<void> {
    const connection = this.connections.find(
      (conn) => conn.connectionId === connectionId
    );
    if (!connection) {
      this.logger.warn({
        event: "message-received-unknown-connection",
        emoji: "⚠️",
      });
      `收到未知連線的玩家訊息，連線 ID: ${connectionId}，訊息內容: ${JSON.stringify(
        message
      )}`;
      return;
    }

    this.logger.info({
      event: "message-received",
      emoji: "📨",
    });
    `收到玩家訊息，遊戲 ID: ${connection.gameId}，玩家 ID: ${connection.playerId}，連線 ID: ${connectionId}，訊息內容: ${JSON.stringify(
      message
    )}`;
    for (const handler of this.playerMessageHandlers) {
      await handler(connection.gameId, connection.playerId, message);
    }
  }
  sendToPlayer(gameId: string, playerId: string, payload: unknown): void {
    const connection = this.connections.find(
      (conn) => conn.gameId === gameId && conn.playerId === playerId
    );
    if (!connection) {
      this.logger.warn({
        event: "send-to-player-no-connection",
        emoji: "⚠️",
      });
      `嘗試發送訊息給未連線的玩家，遊戲 ID: ${gameId}，玩家 ID: ${playerId}，訊息內容: ${JSON.stringify(
        payload
      )}`;
      return;
    }
    connection.send(payload);
    this.logger.info({
      event: "send-to-player",
      emoji: "📤",
    });
    `已發送訊息給玩家，遊戲 ID: ${gameId}，玩家 ID: ${playerId}，訊息內容: ${JSON.stringify(
      payload
    )}`;
  }
  attachPlayerMessageHandler(handler: PlayerMessageHandler): void {
    this.playerMessageHandlers.push(handler);
  }
}
