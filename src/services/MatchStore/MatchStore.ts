import type { Result } from "~shared/utils/Result";

import type { Match, MatchBaseInfo } from "@/schemas/Match";

export interface MatchStore {
  list(): Promise<MatchBaseInfo[]>;
  load(matchId: string): Promise<Result<Match, "NOT_FOUND">>;
  save(matchId: string, match: Match): Promise<Result>;
}
