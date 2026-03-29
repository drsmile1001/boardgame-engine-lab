import { Route, Router, redirect, useLocation } from "@solidjs/router";
import {
  type JSX,
  type ParentProps,
  Show,
  createRenderEffect,
  on,
} from "solid-js";

import { client } from "./client";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import MainLayout from "./pages/layouts/MainLayout";
import { useCurrentPlayerStore } from "./stores/currentUserStore";

function App() {
  const { currentPlayer, setCurrentUser } = useCurrentPlayerStore();

  function AuthGuard(props: ParentProps): JSX.Element {
    const location = useLocation();

    async function performAuthCheck() {
      const selfResult = await client.api.self.get();
      setCurrentUser(selfResult.data);
      if (!currentPlayer()) redirect("/welcome");
    }

    createRenderEffect(on(() => location.pathname, performAuthCheck));

    return (
      <>
        <Show when={currentPlayer()}>{props.children}</Show>
      </>
    );
  }

  return (
    <Router root={MainLayout}>
      <Route path="/welcome" component={() => <div>WELCOME</div>} />
      <Route path="/" component={AuthGuard}>
        <Route path="/" component={LobbyPage} />
        <Route path="/games/:id" component={GamePage} />
      </Route>
    </Router>
  );
}

export default App;
