import type { Logger } from "@drsmile1001/logger";

import type { GameRunner } from "@backend/services/GameRunner";
import type { GameStore } from "@backend/services/GameStore";
import type { PlayerRepo } from "@backend/services/PlayerRepo";
import type { PlayerResolver } from "@backend/services/PlayerResolver";
import type { PlayerTransport } from "@backend/services/PlayerTransport";
import type { SessionStore } from "@backend/services/SessionStore";

export type AppServices = {
  Logger: Logger;
  PlayerRepo: PlayerRepo;
  SessionStore: SessionStore;
  PlayerResolver: PlayerResolver;
  GameStore: GameStore;
  PlayerTransport: PlayerTransport;
  GameRunner: GameRunner;
};
