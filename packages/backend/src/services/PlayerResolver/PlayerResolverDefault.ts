import type { Player } from "@backend/schemas/Player";
import type { PlayerRepo } from "@backend/services/PlayerRepo";
import type { SessionStore } from "@backend/services/SessionStore";

import type { PlayerResolver } from "./PlayerResolver";

export class PlayerResolverDefault implements PlayerResolver {
  constructor(
    private sessionStore: SessionStore,
    private playerRepo: PlayerRepo
  ) {}

  async resolvePlayer(sessionId: string): Promise<Player | null> {
    const session = await this.sessionStore.get(sessionId);
    if (!session) {
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      await this.sessionStore.remove(session.id);
      return null;
    }

    const player = await this.playerRepo.get(session.playerId);
    if (!player) {
      return null;
    }

    return player;
  }
}
