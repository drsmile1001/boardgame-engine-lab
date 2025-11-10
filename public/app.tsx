import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { jsx } from "react/jsx-runtime";

import { GamePage } from "./views/Game";
import { LobbyPage } from "./views/Lobby";
import { NewGamePage } from "./views/NewGame";

export function ViewRoot() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LobbyPage />} />
        <Route path="/game/new" element={<NewGamePage />} />
        <Route path="/game/:gameId" element={<GamePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export function renderApp() {
  createRoot(document.getElementById("app")!).render(jsx(ViewRoot, {}));
}
