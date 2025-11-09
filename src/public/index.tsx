import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import Layout from "@/public/layouts";

function App() {
  const [count, setCount] = useState(0);
  const increase = () => setCount((c) => c + 1);

  const [now, setNow] = useState("--");

  useEffect(() => {
    const id = setInterval(async () => {
      const res = await fetch("/api/now");
      const data = await res.json();
      setNow(data.now);
    }, 1000);

    return () => clearInterval(id); // HMR 或 unmount 會清掉
  }, []);

  return (
    <>
      <h1 className="text-3xl">桌遊引擎測試124443</h1>
      <h2 className="text-6xl">{count}</h2>
      <button
        className="text-xl text-blue-500 px-6 py-2 bg-blue-100 rounded-xl"
        onClick={increase}
      >
        Increase
      </button>
      <h2 className="text-6xl">now : {now}</h2>
    </>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(
  <Layout className="gap-6">
    <App />
  </Layout>
);
