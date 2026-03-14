import { A } from "@solidjs/router";

function LobbyPage() {
  return (
    <div class="mt-6">
      <ul>
        <li>頁面：大廳</li>
        <li>當前對局列表（示意）</li>
        <li>
          對局連結：<A href="/matches/match-001">前往 match-001</A>
        </li>
        <li>
          註冊按鈕（連結）：<A href="/register">前往註冊頁</A>
        </li>
        <li>登入按鈕（示意）</li>
        <li>建立對局按鈕（示意）</li>
      </ul>
    </div>
  );
}

export default LobbyPage;
