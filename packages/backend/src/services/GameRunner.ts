import type { Logger } from "@drsmile1001/logger";
import { isErr } from "@drsmile1001/utils/Result";

import type { AppServices } from "@backend/app/AppServices";

import { TicTacToe } from "./GameRule/TicTacToe";
import type { GameStore } from "./GameStore";
import type { PlayerTransport } from "./PlayerTransport";

export type Deps = Pick<
  AppServices,
  "Logger" | "PlayerTransport" | "GameStore"
>;

export class GameRunner {
  logger: Logger;
  transport: PlayerTransport;
  gameStore: GameStore;
  constructor(deps: Deps) {
    const { Logger, PlayerTransport, GameStore } = deps;
    this.logger = Logger.extend("GameRunner");
    PlayerTransport.receiveFromPlayer((playerId, message) => {
      const { gameId } = message;
      return this.onPlayerMessage(gameId, playerId, message);
    });
    this.transport = PlayerTransport;
    this.gameStore = GameStore;
  }
  async onPlayerMessage(gameId: string, playerId: string, message: unknown) {
    const logger = this.logger.extend("onPlayerMessage", {
      gameId,
      playerId,
      message,
    });
    logger.debug()`開始處理 ${gameId} 的玩家 ${playerId} 訊息`;
    const game = await this.gameStore.get(gameId);
    if (!game) {
      logger.warn()`遊戲 ${gameId} 不存在`;
      this.transport.sendToPlayer(playerId, {
        type: "GAME_NOT_FOUND",
        gameId,
      });
      return;
    }
    //TODO: 依據遊戲類型取用遊戲規則實例
    const rule = new TicTacToe();
    const moveResult = await rule.move(
      game.state as any, //TODO: gameRule 提供 state 驗證
      playerId,
      message as Record<string, unknown>
    );
    if (isErr(moveResult)) {
      logger.warn()`玩家移動失敗：${moveResult.error}`;
      this.transport.sendToPlayer(playerId, {
        type: "PLAYER_MOVE_ERROR",
        gameId,
        error: "",
      });
      return;
    }
    const newState = moveResult.value;
    try {
      await this.gameStore.set({
        ...game,
        state: newState,
      });
    } catch {
      logger.error()`無法保存遊戲狀態`;
      this.transport.sendToPlayer(playerId, {
        type: "ERROR",
        error: "Failed to save game state",
      });
      return;
    }
    logger.info()`玩家移動成功，已保存新狀態`;
    for (const { id } of game.players) {
      this.transport.sendToPlayer(id, {
        type: "GAME_STATE_UPDATE",
        gameId,
        state: newState,
      });
    }
  }
}
