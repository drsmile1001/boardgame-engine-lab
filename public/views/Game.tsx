import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import type { MatchBaseInfo } from "@/schemas/Match";

import Layout from "@public/layouts";
import { lobbyApi } from "@public/services/Apis";

export function GamePage() {
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
    <Layout title={`Game ${info?.name}`}>
      <h1>Game Page</h1>
      <p>Game ID: {gameId}</p>
      <p>Game Name: {info?.name}</p>
    </Layout>
  );
}
