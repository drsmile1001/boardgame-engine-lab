import { type Player } from "@/schemas/Player";
import { proxy } from "valtio";
import { subscribeKey } from "valtio/utils";

import { playerApi } from "./Apis";

export type CurrentPlayerState = Player | "UNKNOWN" | "NO_PLAYER";

export const currentPlayerStore = proxy({
  player: "UNKNOWN" as CurrentPlayerState,
});

export async function syncCurrentPlayer() {
  const res = await playerApi.api.self.get();
  if (res.data) {
    currentPlayerStore.player = res.data;
  } else {
    currentPlayerStore.player = "NO_PLAYER";
  }
}

const unsubscribe = subscribeKey(currentPlayerStore, "player", (v) =>
  console.log("state has changed to", state)
);
