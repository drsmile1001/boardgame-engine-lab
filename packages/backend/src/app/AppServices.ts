import type { Logger } from "@drsmile1001/logger";

import type { GameRule } from "@backend/services/GameRule/GameRule";
import type { GameRunner } from "@backend/services/GameRunner";
import type { MatchStore } from "@backend/services/MatchStore";
import type { PlayerRepo } from "@backend/services/PlayerRepo";
import type { SessionTransport } from "@backend/services/SessionTransport";

export type AppServices = {
  Logger: Logger;
  PlayerRepo: PlayerRepo;
  MatchStore: MatchStore;
  SessionTransport: SessionTransport;
  GameRunner: GameRunner;
  GameRule: GameRule;
};
