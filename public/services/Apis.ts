import { treaty } from "@elysiajs/eden";

import type { LobbyApi } from "@/apis/LobbyApi";

export const lobbyApi = treaty<LobbyApi>("localhost:3000");
