import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import type { MatchBaseInfo, MatchStatus } from "@/schemas/Match";
import type { Player } from "@/schemas/Player";

import Layout from "@public/layouts";
import { lobbyApi } from "@public/services/Apis";

export type Props = {
  player: Player;
};
export function LobbyPage(props: Props) {
  const [list, setList] = useState<MatchBaseInfo[]>([]);

  useEffect(() => {
    lobbyApi.api.matches.get().then((res) => {
      if (res.error) {
        console.error("Failed to fetch games:", res.error);
        return;
      }
      setList(res.data);
    });
  }, []);

  function statusText(status: MatchStatus) {
    switch (status) {
      case "WATTING_FOR_PLAYERS":
        return "等待中";
      case "IN_PROGRESS":
        return "進行中";
      case "COMPLETED":
        return "已結束";
      case "INTERRUPTED":
        return "中斷";
      default:
        return "--";
    }
  }

  return (
    <Layout title="遊戲大廳" player={props.player}>
      <div className="flex p-4">
        {list.map((game) => (
          <Link
            key={game.id}
            className="w-40 h-20 mr-4 shadow rounded hover:bg-stone-200 p-2 flex justify-center items-center flex flex-col"
            to={`/game/${game.id}`}
          >
            <span className="font-bold">{game.name}</span>
            <span className="text-sm text-stone-600">{game.gameId}</span>
            <span className="text-sm text-stone-600">
              {statusText(game.status)}
            </span>
          </Link>
        ))}
        <Link
          className="w-40 h-20 mr-4 shadow rounded hover:bg-stone-200 p-2 flex justify-center items-center"
          to="/game/new"
        >
          + 建立新遊戲
        </Link>
      </div>
    </Layout>
  );
}
