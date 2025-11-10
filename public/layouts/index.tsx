import type { PropsWithChildren } from "react";

import "@public/styles/global.css";

interface LayoutProps extends PropsWithChildren {
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="py-4 px-8 text-xl font-bold border-b border-gray-300 bg-stone-100 shadow">
        {title}
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
