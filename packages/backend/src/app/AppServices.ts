import type { Logger } from "@drsmile1001/logger";

import type { GameRunner } from "@backend/services/GameRunner";
import type { GameStore } from "@backend/services/GameStore";
import type { PlayerRepo } from "@backend/services/PlayerRepo";
import type { PlayerTransport } from "@backend/services/PlayerTransport";

export type AppServices = {
  Logger: Logger;
  PlayerRepo: PlayerRepo;
  GameStore: GameStore;
  PlayerTransport: PlayerTransport;
  GameRunner: GameRunner;
};
