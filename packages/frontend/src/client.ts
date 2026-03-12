import { treaty } from "@elysiajs/eden";

import { type Api } from "@backend/public";

export const client = treaty<Api>(
  document.location.origin + import.meta.env.BASE_URL
);
//client.api.matches
