import type { Result } from "@drsmile1001/utils/Result";

import type { Match, MatchBaseInfo } from "@backend/schemas/Match";

export interface MatchStore {
  list(): Promise<MatchBaseInfo[]>;
  load(matchId: string): Promise<Result<Match, "NOT_FOUND">>;
  save(matchId: string, match: Match): Promise<Result>;
}
