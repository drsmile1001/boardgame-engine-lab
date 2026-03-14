import { Route, Router } from "@solidjs/router";

import LobbyPage from "./pages/LobbyPage";
import MatchPage from "./pages/MatchPage";
import RegisterPage from "./pages/RegisterPage";
import MainLayout from "./pages/layouts/MainLayout";

function App() {
  return (
    <Router root={MainLayout}>
      <Route path="/" component={LobbyPage} />
      <Route path="/matches/:id" component={MatchPage} />
      <Route path="/register" component={RegisterPage} />
    </Router>
  );
}

export default App;
