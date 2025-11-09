import clsx from "clsx";
import type { PropsWithChildren } from "react";

import "@public/styles/global.css";

interface LayoutProps extends PropsWithChildren {
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-center items-center w-full min-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
}
