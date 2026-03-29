import type { Player } from "@backend/schemas/Player";

import type { PlayerResolver } from "./PlayerResolver";

export class PlayerResolverFake implements PlayerResolver {
  private players = new Map<string, Player>();

  set(sessionId: string, player: Player): void {
    this.players.set(sessionId, player);
  }

  async resolvePlayer(sessionId: string): Promise<Player | null> {
    return this.players.get(sessionId) ?? null;
  }
}
