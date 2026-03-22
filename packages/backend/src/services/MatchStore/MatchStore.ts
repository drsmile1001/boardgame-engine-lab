import type { EntityStore } from "@drsmile1001/entity-store";

import type { Match, MatchBaseInfo } from "@backend/schemas/Match";

export type MatchStore = EntityStore<Match, MatchBaseInfo>;
