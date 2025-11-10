import type { Logger } from "~shared/Logger";

import type { GameRule } from "@/services/GameRule/GameRule";
import type { GameRunner } from "@/services/GameRunner";
import type { MatchStore } from "@/services/MatchStore";
import type { SessionTransport } from "@/services/SessionTransport";

export type AppServices = {
  Logger: Logger;
  MatchStore: MatchStore;
  SessionTransport: SessionTransport;
  GameRunner: GameRunner;
  GameRule: GameRule;
};
