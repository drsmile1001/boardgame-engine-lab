import { Route, Router } from "@solidjs/router";

import GamePage from "./pages/GamePage";
import LobbyPage from "./pages/LobbyPage";
import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./pages/layouts/MainLayout";

function App() {
  return (
    <Router root={MainLayout}>
      <Route path="/" component={LobbyPage} />
      <Route path="/games/:id" component={GamePage} />
      <Route path="/register" component={RegisterPage} />
    </Router>
  );
}

export default App;
