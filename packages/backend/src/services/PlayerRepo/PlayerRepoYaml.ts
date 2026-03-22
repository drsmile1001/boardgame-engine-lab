import { EntityStoreYaml } from "@drsmile1001/entity-store";
import type { Logger } from "@drsmile1001/logger";

import { playerSchema } from "@backend/schemas/Player";

import type { PlayerRepo } from "./PlayerRepo";

export class PlayerRepoYaml
  extends EntityStoreYaml<typeof playerSchema>
  implements PlayerRepo
{
  constructor(logger: Logger, path: string) {
    super({
      path,
      schema: playerSchema,
      logger: logger.extend("PlayerRepoYaml"),
    });
  }
}
