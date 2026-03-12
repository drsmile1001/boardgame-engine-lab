import { YAML } from "bun";

import { readdir } from "fs/promises";
import QuickLRU from "quick-lru";

import type { Logger } from "~shared/Logger";
import { type Result, err, ok } from "~shared/utils/Result";

import type { Match, MatchBaseInfo } from "@/schemas/Match";

import type { MatchStore } from "./MatchStore";

export class GameStoreDefault implements MatchStore {
  private matchCache = new QuickLRU<string, Match>({ maxSize: 1000 });

  private listCache: MatchBaseInfo[] | null = null;

  constructor(
    private logger: Logger,
    private gameStoreDir: string
  ) {}

  async list(): Promise<MatchBaseInfo[]> {
    if (this.listCache) {
      return this.listCache;
    }

    const matches: MatchBaseInfo[] = [];

    try {
      const files = await readdir(this.gameStoreDir);

      for (const fileName of files) {
        if (!fileName.endsWith(".yaml")) continue;
        try {
          const content = await Bun.file(
            `${this.gameStoreDir}/${fileName}`
          ).text();
          const match = YAML.parse(content) as Match;

          matches.push({
            id: match.id,
            name: match.name,
            gameId: match.gameId,
            status: match.status,
          });
        } catch (e) {
          this.logger.warn({
            event: "match-list-load-failed",
            emoji: "⚠️",
            fileName,
            error: (e as Error).message,
          })`無法解析 match 檔案：${fileName}`;
        }
      }

      this.listCache = matches;
      return matches;
    } catch (e) {
      this.logger.error({
        event: "match-list-error",
        emoji: "❌",
        error: (e as Error).message,
      })`無法列出對局清單`;

      return [];
    }
  }

  async load(matchId: string): Promise<Result<Match, "NOT_FOUND">> {
    const cached = this.matchCache.get(matchId);
    if (cached) {
      return ok(cached);
    }

    const filePath = `${this.gameStoreDir}/${matchId}.yaml`;

    try {
      const fileContent = await Bun.file(filePath).text();
      const match = YAML.parse(fileContent) as Match;

      this.matchCache.set(matchId, match);
      return ok(match);
    } catch (e) {
      this.logger.warn({
        event: "match-load-failed",
        emoji: "⚠️",
        matchId,
        error: (e as Error).message,
      })`找不到 match：${filePath}`;

      return err("NOT_FOUND");
    }
  }

  async save(matchId: string, match: Match): Promise<Result> {
    const filePath = `${this.gameStoreDir}/${matchId}.yaml`;

    try {
      const yaml = YAML.stringify(match, null, 2);
      await Bun.write(filePath, yaml);

      this.matchCache.set(matchId, match);
      this.updateListCache(match);

      this.logger.info({
        event: "match-saved",
        emoji: "💾",
        matchId,
      })`對局已保存：${filePath}`;

      return ok();
    } catch (error) {
      this.logger.error({
        event: "match-save-failed",
        emoji: "❌",
        matchId,
        error: (error as Error).message,
      })`無法寫入對局：${matchId}`;

      return err();
    }
  }

  private updateListCache(match: Match) {
    const base: MatchBaseInfo = {
      id: match.id,
      name: match.name,
      gameId: match.gameId,
      status: match.status,
    };

    if (!this.listCache) {
      this.listCache = [base];
      return;
    }

    const idx = this.listCache.findIndex((m) => m.id === match.id);

    if (idx === -1) {
      this.listCache.push(base);
    } else {
      this.listCache[idx] = base;
    }
  }
}
