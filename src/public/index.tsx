import { createRoot } from "react-dom/client";

import { wsClient } from "@/public/services/WebSocketClient";
import { ViewRoot } from "@/public/view/index";

import { eventHub } from "./services/EventHub";
import { gameStateStore } from "./services/GameStateStore";

wsClient.connect();

eventHub.on("ws:message", (data) => {
  if (data.counter !== undefined) {
    gameStateStore.update({ counter: data.counter });
  }
});

createRoot(document.getElementById("app")!).render(<ViewRoot />);
