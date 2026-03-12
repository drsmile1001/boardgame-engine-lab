import type { SystemTime } from "@drsmile1001/system-time";
import Elysia from "elysia";

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
