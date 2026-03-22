import type { Logger } from "@drsmile1001/logger";

import type { GameRule } from "@backend/services/GameRule/GameRule";
import type { GameRunner } from "@backend/services/GameRunner";
import type { GameStore } from "@backend/services/GameStore";
import type { PlayerRepo } from "@backend/services/PlayerRepo";
import type { SessionTransport } from "@backend/services/SessionTransport";

export type AppServices = {
  Logger: Logger;
  PlayerRepo: PlayerRepo;
  GameStore: GameStore;
  SessionTransport: SessionTransport;
  GameRunner: GameRunner;
  GameRule: GameRule;
};
