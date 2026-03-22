import { EntityStoreSplitYaml } from "@drsmile1001/entity-store";
import type { Logger } from "@drsmile1001/logger";

import { type MatchBaseInfo, matchSchema } from "@backend/schemas/Match";

import type { MatchStore } from "./MatchStore";

export class MatchStoreSplitYaml
  extends EntityStoreSplitYaml<typeof matchSchema, MatchBaseInfo>
  implements MatchStore
{
  constructor(logger: Logger, path: string) {
    super({
      path,
      schema: matchSchema,
      logger: logger.extend("MatchStoreSplitYaml"),
      toEntityInfo: (match) => ({
        id: match.id,
        name: match.name,
        gameId: match.gameId,
        status: match.status,
      }),
    });
  }
}
