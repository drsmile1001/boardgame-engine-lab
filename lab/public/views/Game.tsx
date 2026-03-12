import type { MatchBaseInfo } from "@/schemas/Match";
import type { Player } from "@/schemas/Player";
import Layout from "@public/layouts";
import { lobbyApi } from "@public/services/Apis";
import { wsClient } from "@public/services/WebSocketClient";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export type Props = {
  player: Player;
};

export function GamePage(props: Props) {
  const [info, setInfo] = useState<MatchBaseInfo>();
  const { gameId } = useParams();

  useEffect(() => {
    lobbyApi.api
      .matches({
        matchId: gameId!,
      })
      .get()
      .then((res) => {
        if (res.error) {
          console.error("Failed to fetch games:", res.error);
          return;
        }
        setInfo(res.data);
      });
  }, []);

  return (
    <Layout title={`Game ${info?.name}`} player={props.player}>
      <div className="p-4">
        <h1>Game Page</h1>
        <p>Game ID: {gameId}</p>
        <p>Game Name: {info?.name}</p>
        <div className="flex gap-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => wsClient.connect()}
          >
            Connect WebSocket
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => wsClient.disconnect()}
          >
            Disconnect WebSocket
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => wsClient.send("hello")}
          >
            Send Hello
          </button>
        </div>
      </div>
    </Layout>
  );
}
