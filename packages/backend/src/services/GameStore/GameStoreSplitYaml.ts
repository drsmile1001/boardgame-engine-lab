import { EntityStoreSplitYaml } from "@drsmile1001/entity-store";
import type { Logger } from "@drsmile1001/logger";

import { type GameBaseInfo, gameSchema } from "@backend/schemas/Game";

import type { GameStore } from "./GameStore";

export class GameStoreSplitYaml
  extends EntityStoreSplitYaml<typeof gameSchema, GameBaseInfo>
  implements GameStore
{
  constructor(logger: Logger, path: string) {
    super({
      path,
      schema: gameSchema,
      logger: logger.extend("GameStoreSplitYaml"),
      toEntityInfo: (game) => ({
        id: game.id,
        name: game.name,
        gameId: game.gameId,
        status: game.status,
      }),
    });
  }
}
