import { Value } from "@sinclair/typebox/value";
import { t } from "elysia";
import QuickLRU from "quick-lru";

import type { Logger } from "~shared/Logger";

import { type Player, playerSchema } from "@/schemas/Player";

import type { PlayerRepo } from "./PlayerRepo";

const schema = t.Array(playerSchema);

export class PlayerRepoYaml implements PlayerRepo {
  private playerCache = new QuickLRU<string, Player>({ maxSize: 1000 });
  logger: Logger;

  constructor(
    logger: Logger,
    private path: string
  ) {
    this.logger = logger.extend("PlayerRepoYaml");
  }

  async list(): Promise<Player[]> {
    try {
      const yaml = await Bun.file(this.path).text();
      const players = Bun.YAML.parse(yaml);
      if (!Value.Check(schema, players)) {
        this.logger.error(
          {
            players,
          },
          "玩家資料格式錯誤，回傳空清單"
        );
        return [];
      }
      return players;
    } catch (error) {
      this.logger.error(
        {
          error,
        },
        "讀取玩家資料失敗，回傳空清單"
      );
      return [];
    }
  }
  async get(id: string): Promise<Player | undefined> {
    const cache = this.playerCache.get(id);
    if (cache) {
      return cache;
    }
    const players = await this.list();
    const player = players.find((p) => p.id === id);
    if (player) {
      this.playerCache.set(id, player);
    }
    return player;
  }
  async set(player: Player): Promise<void> {
    const players = await this.list();
    const index = players.findIndex((p) => p.id === player.id);
    if (index >= 0) {
      players[index] = player;
    } else {
      players.push(player);
    }
    const yaml = Bun.YAML.stringify(players, null, 2);
    await Bun.write(this.path, yaml);
    this.playerCache.set(player.id, player);
  }
}
