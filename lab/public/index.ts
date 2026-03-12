import { renderApp } from "./app";
import { syncCurrentPlayer } from "./services/CurrentPlayerStore";

syncCurrentPlayer();
renderApp();
