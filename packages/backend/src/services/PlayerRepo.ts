import type { Player } from "@backend/schemas/Player";

export interface PlayerRepo {
  list(): Promise<Player[]>;
  get(id: string): Promise<Player | undefined>;
  set(player: Player): Promise<void>;
}
