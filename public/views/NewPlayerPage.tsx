import { useState } from "react";

import type { Player } from "@/schemas/Player";

import Layout from "@public/layouts";
import { playerApi } from "@public/services/Apis";

export type Props = {
  onPlayerCreated: (player: Player) => void;
};
export function NewPlayerPage({ onPlayerCreated }: Props) {
  const [name, setName] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const registeredPlayer = await playerApi.api.self.post({
      name,
    });

    if (registeredPlayer.error) {
      alert("註冊玩家失敗，請重試");
      return;
    }

    onPlayerCreated(registeredPlayer.data);
  }

  return (
    <Layout title="成為新玩家">
      <form className="p-4" onSubmit={handleSubmit}>
        <label className="block mb-2">
          玩家名稱:
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
          註冊成為玩家
        </button>
      </form>
    </Layout>
  );
}
