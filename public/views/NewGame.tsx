import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "@public/layouts";
import { lobbyApi } from "@public/services/Apis";

export function NewGamePage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await lobbyApi.api.matches.post({
      name,
      gameId: "tic-tac-toe",
    });

    if (res.error) {
      console.error("建立遊戲失敗:", res.error);
      return;
    }

    navigate(`/game/${res.data.id}`);
  }

  return (
    <Layout title="建立新遊戲">
      <form className="p-4" onSubmit={handleSubmit}>
        <label className="block mb-2">
          遊戲名稱:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="ml-2 p-1 border border-gray-300 rounded"
          />
        </label>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          建立遊戲
        </button>
      </form>
    </Layout>
  );
}
