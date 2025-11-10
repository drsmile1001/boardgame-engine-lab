import { wsClient } from "@public/services/WebSocketClient";

import { renderApp } from "./app";
import { eventHub } from "./services/EventHub";
import { gameStateStore } from "./services/GameStateStore";

// wsClient.connect();

// eventHub.on("ws:message", (data) => {
//   if (data.counter !== undefined) {
//     gameStateStore.update({ counter: data.counter });
//   }
// });

renderApp();
