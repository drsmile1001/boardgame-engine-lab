import type { MaybePromise } from "@drsmile1001/utils/TypeHelper";

export type PlayerPayloadHandler = (
  playerId: string,
  payload: ReceiveFromPlayerPayload
) => MaybePromise<void>;

export type SendToPlayerPayload =
  | {
      type: "GAME_STATE_UPDATE";
      gameId: string;
      state: unknown;
    }
  | {
      type: "PLAYER_MOVE_ERROR";
      gameId: string;
      error: string;
    }
  | {
      type: "GAME_NOT_FOUND";
      gameId: string;
    }
  | {
      type: "ERROR";
      error: string;
    };

export type ReceiveFromPlayerPayload = {
  type: "GAME_MOVE";
  gameId: string;
  move: unknown;
};

export interface PlayerTransport {
  connect(): void;
  disconnect(connectionId: string): void;
  receiveMessage(connectionId: string, message: unknown): MaybePromise<void>;
  sendToPlayer(playerId: string, payload: SendToPlayerPayload): void;
  receiveFromPlayer(handler: PlayerPayloadHandler): void;
}
