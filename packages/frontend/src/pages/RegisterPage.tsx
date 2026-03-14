import { A } from "@solidjs/router";

function RegisterPage() {
  return (
    <div class="mt-6">
      <ul>
        <li>頁面：註冊</li>
        <li>顯示註冊表單（示意）</li>
        <li>欄位：名稱（示意）</li>
        <li>欄位：Email 確認（示意）</li>
        <li>完成註冊按鈕（示意）</li>
        <li>
          返回大廳：<A href="/">前往大廳</A>
        </li>
      </ul>
    </div>
  );
}

export default RegisterPage;
