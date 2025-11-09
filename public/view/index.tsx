import { useEffect, useState } from "react";

import { eventHub } from "@public/services/EventHub";
import {
  type GameState,
  gameStateStore,
} from "@public/services/GameStateStore";
import { wsClient } from "@public/services/WebSocketClient";

export function ViewRoot() {
  const [state, setState] = useState(gameStateStore.getState());

  useEffect(() => {
    // 訂閱遊戲狀態更新
    const off = eventHub.on("state:update", (s) => {
      setState({ ...s } as GameState);
    });

    return () => off();
  }, []);

  const add = () => wsClient.send("counter-add");
  const reset = () => wsClient.send("counter-reset");

  return (
    <div>
      <h1 className="text-3xl">桌遊引擎測試</h1>
      <h2 className="text-6xl">{state.counter}</h2>

      <button onClick={add}>Increase</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
