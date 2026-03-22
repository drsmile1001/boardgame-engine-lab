import type { EntityStore } from "@drsmile1001/entity-store";

import type { Player } from "@backend/schemas/Player";

export interface PlayerRepo extends EntityStore<Player> {}
