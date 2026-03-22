import { A, useParams } from "@solidjs/router";

function MatchPage() {
  const params = useParams<{ id: string }>();

  return (
    <div class="mt-6">
      <ul>
        <li>頁面：特定對局</li>
        <li>對局 ID：{params.id}</li>
        <li>非進行中的對局</li>
        <li>顯示對局資訊（示意）</li>
        <li>玩家列表（示意）</li>
        <li>加入與離開對局按鈕（示意）</li>
        <li>開始與繼續對局按鈕（主機玩家，示意）</li>
        <li>進行中的對局</li>
        <li>顯示遊戲畫面（示意）</li>
        <li>中斷對局按鈕（示意）</li>
        <li>
          回到大廳：<A href="/">前往大廳</A>
        </li>
      </ul>
    </div>
  );
}

export default MatchPage;
