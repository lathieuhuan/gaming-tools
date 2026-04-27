import type { ReactNode } from "react";

type EventListLayoutProps = {
  title: ReactNode;
  children: ReactNode;
};

export function EventListLayout({ title, children }: EventListLayoutProps) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-light-hint uppercase">{title}</div>
      {children}
    </div>
  );
}
