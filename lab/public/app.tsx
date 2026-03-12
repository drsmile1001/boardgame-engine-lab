import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { jsx } from "react/jsx-runtime";
import { useSnapshot } from "valtio";

import { currentPlayerStore } from "./services/CurrentPlayerStore";
import { GamePage } from "./views/Game";
import { LobbyPage } from "./views/Lobby";
import { NewGamePage } from "./views/NewGame";
import { NewPlayerPage } from "./views/NewPlayerPage";

export function ViewRoot() {
  const { player } = useSnapshot(currentPlayerStore);

  if (player === "UNKNOWN") {
    return <div></div>;
  }
  if (player === "NO_PLAYER") {
    return <NewPlayerPage />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage player={player} />} />
        <Route path="/game/new" element={<NewGamePage />} />
        <Route path="/game/:gameId" element={<GamePage player={player} />} />
      </Routes>
    </BrowserRouter>
  );
}

export function renderApp() {
  createRoot(document.getElementById("app")!).render(jsx(ViewRoot, {}));
}
