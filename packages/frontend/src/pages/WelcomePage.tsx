import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";

import { client } from "@frontend/client";

function WelcomePage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  async function registerAnonymous() {
    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await client.api.register.anonymous.post();
    setIsSubmitting(false);

    if (!result.data) {
      setErrorMessage("匿名登入失敗，請稍後再試。");
      return;
    }

    navigate("/");
  }

  return (
    <section class="flex min-h-[70vh] items-center justify-center">
      <div class="w-full max-w-md rounded-xl border border-slate-300 bg-white p-6 shadow-sm">
        <h1 class="text-xl font-semibold">歡迎使用 Boardgame Engine Lab！</h1>
        <p class="mt-2 text-sm text-slate-600">
          你可以先以匿名身份開始，Google 帳號登入功能稍後開放。
        </p>

        <div class="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void registerAnonymous()}
            disabled={isSubmitting()}
            class="rounded-md bg-slate-900 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting() ? "建立匿名身份中..." : "以匿名身份開始"}
          </button>

          <button
            type="button"
            disabled
            class="rounded-md border border-slate-300 px-4 py-2 text-slate-500"
          >
            以 Google 帳號登入（暫未開放）
          </button>
        </div>

        <p class="mt-3 text-sm text-red-600">{errorMessage()}</p>
      </div>
    </section>
  );
}

export default WelcomePage;
