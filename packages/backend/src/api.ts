import { Elysia } from "elysia";

export async function buildApi() {
  const api = new Elysia().get("/api/now", () => Date.now());
  return api;
}

export type Api = Awaited<ReturnType<typeof buildApi>>;
