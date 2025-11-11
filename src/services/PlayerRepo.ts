import type { Player } from "@/schemas/Player";

export interface PlayerRepo {
  list(): Promise<Player[]>;
  get(id: string): Promise<Player | undefined>;
  set(player: Player): Promise<void>;
}
