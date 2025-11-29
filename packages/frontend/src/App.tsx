import { createSignal } from "solid-js";

function App() {
  const [count, setCount] = createSignal(0);

  async function fetchData() {
    const res = await fetch("/api/now");
    const text = await res.text();
    console.log(text);
  }

  return (
    <div class="p-6">
      <h1 class="font-bold text-lg">title</h1>
      <div class="my-4 flex flex-col gap-4">
        <button
          class="rounded bg-blue-200 px-2 py-1"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count()}
        </button>
        <button class="rounded bg-blue-200 px-2 py-1" onClick={fetchData}>
          Fetch /api/now
        </button>
      </div>
    </div>
  );
}

export default App;
