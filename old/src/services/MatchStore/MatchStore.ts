import type { Match, MatchBaseInfo } from "@/schemas/Match";
import type { Result } from "~shared/utils/Result";

export interface MatchStore {
  list(): Promise<MatchBaseInfo[]>;
  load(matchId: string): Promise<Result<Match, "NOT_FOUND">>;
  save(matchId: string, match: Match): Promise<Result>;
}
