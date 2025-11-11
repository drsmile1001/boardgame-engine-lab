import type { PropsWithChildren } from "react";

import type { Player } from "@/schemas/Player";

import "@public/styles/global.css";

interface LayoutProps extends PropsWithChildren {
  title?: string;
  player?: Player;
}

export default function Layout({ children, title, player }: LayoutProps) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="py-4 px-8  border-b border-gray-300 bg-stone-100 shadow flex justify-between items-center">
        <span className="text-xl font-bold">{title}</span>
        <span className="float-right">玩家: {player?.name}</span>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
