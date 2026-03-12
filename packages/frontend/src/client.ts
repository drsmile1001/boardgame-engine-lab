import { type Api } from "@backend/public";
import { treaty } from "@elysiajs/eden";

export const client = treaty<Api>(
  document.location.origin + import.meta.env.BASE_URL
);
