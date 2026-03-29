import { EntityStoreYaml } from "@drsmile1001/entity-store";
import type { Logger } from "@drsmile1001/logger";

import { sessionSchema } from "@backend/schemas/Session";

import type { SessionStore } from "./SessionStore";

export class SessionStoreYaml
  extends EntityStoreYaml<typeof sessionSchema>
  implements SessionStore
{
  constructor(logger: Logger, path: string) {
    super({
      path,
      schema: sessionSchema,
      logger: logger.extend("SessionStoreYaml"),
    });
  }
}
