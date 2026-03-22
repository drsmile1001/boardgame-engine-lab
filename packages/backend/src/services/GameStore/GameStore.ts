import type { EntityStore } from "@drsmile1001/entity-store";

import type { Game, GameBaseInfo } from "@backend/schemas/Game";

export type GameStore = EntityStore<Game, GameBaseInfo>;
