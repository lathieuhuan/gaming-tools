import { ReactNode } from "react";
import { Button, cn, FancyBackSvg, useScreenWatcher } from "rond";

type TabHeaderProps = {
  className?: string;
  children: ReactNode;
  sub?: ReactNode;
  onBack?: () => void;
};

export function TabHeader({ className, children, sub, onBack }: TabHeaderProps) {
  const isMobile = !useScreenWatcher("sm");

  return (
    <div className="flex gap-2 divide-x divide-dark-line">
      {isMobile && onBack && (
        <div>
          <Button icon={<FancyBackSvg className="text-light-hint" />} boneOnly onClick={onBack} />
        </div>
      )}

      <div className={cn("h-12 grow", className)}>
        <div className="text-lg font-semibold">{children}</div>
        {sub && <div className="text-sm text-light-hint">{sub}</div>}
      </div>
    </div>
  );
}
