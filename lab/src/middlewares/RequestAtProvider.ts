import Elysia from "elysia";

import type { SystemTime } from "~shared/SystemTime";

export type RequestAtProviderDependency = {
  SystemTime: SystemTime;
};
export function buildRequestAtProvider(deps: RequestAtProviderDependency) {
  return new Elysia({
    name: "RequestAtProvider",
  })
    .derive(() => {
      const systemTime = deps.SystemTime;
      const now = systemTime.now();
      return {
        requestAt: now,
        systemTime,
      };
    })
    .as("scoped");
}
