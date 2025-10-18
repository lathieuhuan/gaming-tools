import { ReactNode } from "react";
import { Button, cn, FancyBackSvg, useScreenWatcher } from "rond";

type TabHeaderProps = {
  className?: string;
  children: ReactNode;
  onBack?: () => void;
};

export function TabHeader({ className, onBack, children }: TabHeaderProps) {
  const isMobile = !useScreenWatcher("sm");

  return (
    <div className="flex gap-2 divide-x divide-dark-line">
      {isMobile && (
        <div>
          <Button icon={<FancyBackSvg className="text-light-hint" />} boneOnly onClick={onBack} />
        </div>
      )}

      <div className={cn("grow", className)}>{children}</div>
    </div>
  );
}
