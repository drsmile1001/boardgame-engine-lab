import type { Logger } from "~shared/Logger";
import { isErr } from "~shared/utils/Result";

import type { AppServices } from "@/app/AppServices";

export type Deps = Pick<
  AppServices,
  "Logger" | "SessionTransport" | "MatchStore" | "GameRule"
>;

export class GameRunner {
  logger: Logger;
  constructor(private deps: Deps) {
    this.logger = deps.Logger.extend("GameRunner");
    deps.SessionTransport.attachPlayerMessageHandler(this.onPlayerMessage);
  }
  async onPlayerMessage(gameId: string, playerId: string, message: unknown) {
    const logger = this.logger.extend("onPlayerMessage", {
      gameId,
      playerId,
      message,
    });
    logger.debug()`開始處理 ${gameId} 的玩家 ${playerId} 訊息`;
    const { MatchStore: GameStore, GameRule, SessionTransport } = this.deps;
    const loadResult = await GameStore.load(gameId);
    if (isErr(loadResult)) {
      logger.warn()`遊戲狀態未找到，當作建立新遊戲處理`;
      const state = await GameRule.setup({});
      SessionTransport.sendToPlayer(gameId, playerId, state);
      return;
    }
    const state = loadResult.value;
    const moveResult = await GameRule.move(
      state as any,
      playerId,
      message as Record<string, unknown>
    );
    if (isErr(moveResult)) {
      logger.warn()`玩家移動失敗：${moveResult.error}`;
      SessionTransport.sendToPlayer(gameId, playerId, {
        error: moveResult.error,
      });
      return;
    }
    const newState = moveResult.value;
    const saveResult = await GameStore.save(gameId, newState);
    if (isErr(saveResult)) {
      logger.error()`無法保存遊戲狀態`;
      SessionTransport.sendToPlayer(gameId, playerId, {
        error: "SAVE_FAILED",
      });
      return;
    }
    logger.info()`玩家移動成功，已保存新狀態`;
    SessionTransport.sendToPlayer(gameId, playerId, newState);
  }
}
