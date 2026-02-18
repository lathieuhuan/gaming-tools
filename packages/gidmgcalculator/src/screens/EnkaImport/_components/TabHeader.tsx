import { ReactNode } from "react";
import { Button, cn, FancyBackSvg } from "rond";

import type { EnkaImportSection } from "../_types";

import { useLayoutState } from "../Layout";

type TabHeaderProps = {
  className?: string;
  children: ReactNode;
  sub?: ReactNode;
  prevSection?: EnkaImportSection;
};

export function TabHeader({ className, children, sub, prevSection }: TabHeaderProps) {
  const { isMobile, goToSection } = useLayoutState();

  const handleBack = (section: EnkaImportSection) => {
    goToSection(section);
  };

  return (
    <div className="flex gap-2 divide-x divide-dark-line">
      {isMobile && prevSection !== undefined && (
        <div>
          <Button
            icon={<FancyBackSvg className="text-light-hint" />}
            boneOnly
            onClick={() => handleBack(prevSection)}
          />
        </div>
      )}

      <div className={cn("min-h-12 grow", className)}>
        <div className="text-lg font-semibold">{children}</div>
        {sub && <div className="text-sm text-light-hint">{sub}</div>}
      </div>
    </div>
  );
}
