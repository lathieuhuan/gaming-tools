type EventListLayoutProps = {
  title: string;
  children: React.ReactNode;
};

export function EventListLayout({ title, children }: EventListLayoutProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-light-hint uppercase">{title}</p>
      {children}
    </div>
  );
}
