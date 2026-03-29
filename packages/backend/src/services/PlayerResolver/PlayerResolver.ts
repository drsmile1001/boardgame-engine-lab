import type { Player } from "@backend/schemas/Player";

export interface PlayerResolver {
  resolvePlayer(sessionId: string): Promise<Player | null>;
}
