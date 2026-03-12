import { type ParentProps, children, createSignal } from "solid-js";

import { client } from "./client";

function AppButton(props: ParentProps<{ onClick: () => void }>) {
  const safeChildren = children(() => props.children);
  return (
    <button class="rounded bg-blue-200 px-2 py-1" onClick={props.onClick}>
      {safeChildren()}
    </button>
  );
}

function App() {
  const [count, setCount] = createSignal(0);
  const [now, setNow] = createSignal(0);

  async function fetchData() {
    const res = await client.api.now.get();
    setNow(res.data!);
  }

  return (
    <div class="p-6">
      <h1 class="font-bold text-lg">title</h1>
      <div class="my-4 flex flex-col gap-4">
        <div
          class="p-4 rounded"
          classList={{
            "bg-red-100": count() > 5,
            "bg-green-100": count() <= 5,
          }}
        >
          {count() > 5 ? "Count is greater than 5" : "Count is 5 or less"}
        </div>
        <button
          class="rounded bg-blue-200 px-2 py-1"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count()}
        </button>
        <button
          class="rounded bg-blue-200 px-2 py-1"
          onclick={() => setCount(0)}
        >
          set count to 0
        </button>
        <AppButton onClick={fetchData}>Fetch Now API: {now()}</AppButton>
      </div>
    </div>
  );
}

export default App;
