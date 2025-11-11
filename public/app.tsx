import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { jsx } from "react/jsx-runtime";

import type { Player } from "@/schemas/Player";

import { playerApi } from "./services/Apis";
import { GamePage } from "./views/Game";
import { LobbyPage } from "./views/Lobby";
import { NewGamePage } from "./views/NewGame";
import { NewPlayerPage } from "./views/NewPlayerPage";

export function ViewRoot() {
  const [player, setPlayer] = useState<Player | undefined | "NO">(undefined);

  useEffect(() => {
    playerApi.api.self.get().then((res) => {
      res.error ? setPlayer("NO") : setPlayer(res.data);
    });
  }, []);

  if (player === undefined) {
    return <div>載入中</div>;
  }
  if (player === "NO") {
    return <NewPlayerPage onPlayerCreated={(p) => setPlayer(p)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage player={player} />} />
        <Route path="/game/new" element={<NewGamePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export function renderApp() {
  createRoot(document.getElementById("app")!).render(jsx(ViewRoot, {}));
}
