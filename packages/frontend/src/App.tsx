import { Route, Router, useLocation, useNavigate } from "@solidjs/router";
import { type JSX, type ParentProps, Show, createEffect, on } from "solid-js";

import { client } from "./client";
import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import WelcomePage from "./pages/WelcomePage";
import MainLayout from "./pages/layouts/MainLayout";
import { useCurrentPlayerStore } from "./stores/currentUserStore";

function App() {
  const { currentPlayer, setCurrentUser } = useCurrentPlayerStore();

  function AuthGuard(props: ParentProps): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();

    async function performAuthCheck() {
      const selfResult = await client.api.self.get();
      if (!selfResult.data) {
        setCurrentUser(null);
        navigate("/welcome");
        return;
      }

      setCurrentUser(selfResult.data);
    }

    createEffect(
      on(
        () => location.pathname,
        () => void performAuthCheck()
      )
    );

    return (
      <>
        <Show when={currentPlayer()}>{props.children}</Show>
      </>
    );
  }

  return (
    <Router root={MainLayout}>
      <Route path="/welcome" component={WelcomePage} />
      <Route path="/" component={AuthGuard}>
        <Route path="/" component={LobbyPage} />
        <Route path="/games/:id" component={GamePage} />
      </Route>
    </Router>
  );
}

export default App;
