import { A } from "@solidjs/router";
import { type ParentProps } from "solid-js";

function MainLayout(props: ParentProps) {
  return (
    <main class="p-6">
      <ul>
        <li>頁面名稱：桌遊引擎實驗室</li>
        <li>WebSocket 連線狀態：未連線（示意）</li>
        <li>玩家名稱：訪客玩家（示意）</li>
        <li>
          快速導覽：
          <A href="/">大廳</A>、<A href="/matches/demo-match">特定對局</A>、
          <A href="/register">註冊</A>
        </li>
      </ul>

      <section>{props.children}</section>
    </main>
  );
}

export default MainLayout;
