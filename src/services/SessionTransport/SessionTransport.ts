import type { MaybePromise } from "~shared/utils/TypeHelper";

export type PlayerMessageHandler = (
  gameId: string,
  playerId: string,
  message: unknown
) => MaybePromise<void>;

export type MessagerSender = (payload: unknown) => void;

export interface SessionTransport {
  connect(
    gameId: string,
    playerId: string,
    connectionId: string,
    send: MessagerSender
  ): void;
  disconnect(connectionId: string): void;
  receiveMessage(connectionId: string, message: unknown): MaybePromise<void>;
  sendToPlayer(gameId: string, playerId: string, payload: unknown): void;
  attachPlayerMessageHandler(handler: PlayerMessageHandler): void;
}
