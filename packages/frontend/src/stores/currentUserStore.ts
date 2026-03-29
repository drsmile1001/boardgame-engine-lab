import { createSignal } from "solid-js";

import type { Player } from "@backend/public";

import { singulation } from "@frontend/utils/singulation";

function createCurrentPlayerStore() {
  const [currentPlayer, setCurrentUser] = createSignal<Player | null>(null);

  return {
    currentPlayer,
    setCurrentUser,
  };
}

export const useCurrentPlayerStore = singulation(createCurrentPlayerStore);
