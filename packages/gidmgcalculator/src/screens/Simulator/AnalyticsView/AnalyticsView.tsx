type AnalyticsViewProps = {
  className?: string;
};

export function AnalyticsView({ className }: AnalyticsViewProps) {
  return (
    <div className={className}>
      <div>
        <span>Analytics</span>
      </div>
    </div>
  );
}
