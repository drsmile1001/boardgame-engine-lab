import { A, useNavigate } from "@solidjs/router";
import { type ParentProps } from "solid-js";

import { client } from "@frontend/client";
import { useCurrentPlayerStore } from "@frontend/stores/currentUserStore";

function MainLayout(props: ParentProps) {
  const navigate = useNavigate();
  const { currentPlayer, setCurrentUser } = useCurrentPlayerStore();

  async function handleLogout() {
    await client.api.logout.post();
    setCurrentUser(null);
    navigate("/welcome");
  }

  return (
    <main class="p-6">
      <ul>
        <li>頁面名稱：桌遊引擎實驗室</li>
        <li>WebSocket 連線狀態：未連線（示意）</li>
        <li>玩家名稱：{currentPlayer()?.name ?? "未登入"}</li>
        <li>
          快速導覽：<A href="/">大廳</A>、
          <A href="/games/demo-game">特定對局</A>
        </li>
        <li>
          <button
            type="button"
            onClick={() => void handleLogout()}
            class="rounded border border-slate-400 px-2 py-1"
          >
            登出
          </button>
        </li>
      </ul>

      <section>{props.children}</section>
    </main>
  );
}

export default MainLayout;
