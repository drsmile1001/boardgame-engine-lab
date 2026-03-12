import { treaty } from "@elysiajs/eden";

import type { LobbyApi } from "@/apis/LobbyApi";
import type { PlayerApi } from "@/apis/PlayerApi";

const BASE_URL = "localhost:3000";
export const lobbyApi = treaty<LobbyApi>(BASE_URL);
export const playerApi = treaty<PlayerApi>(BASE_URL);
