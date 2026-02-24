import type { ReactNode } from "react";

import type{ ArtifactType } from "@/types";
import { useTranslation } from "@/hooks/useTranslation";

type SaverLayoutProps = {
  type: "ARTIFACT" | "WEAPON" | "CHARACTER";
  atfType?: ArtifactType;
  children: ReactNode;
};

export function SaverLayout({ type, atfType, children }: SaverLayoutProps) {
  const { t } = useTranslation();
  const extraTitle = type === "ARTIFACT" && atfType ? t(atfType) : "";

  return (
    <div data-slot="saver-layout" className="h-full bg-dark-2 flex flex-col">
      <div className="px-4 pt-4">
        <p className="pb-1 border-dark-line border-b text-lg text-heading font-bold capitalize">
          Save {type?.toLowerCase()}
          {extraTitle && (
            <span className="text-base text-light-3 font-medium"> / {extraTitle}</span>
          )}
        </p>
      </div>

      {children}
    </div>
  );
}
