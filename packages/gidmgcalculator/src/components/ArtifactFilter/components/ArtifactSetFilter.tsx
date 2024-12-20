import { clsx } from "rond";
import { AppArtifact } from "@Backend";

import { FilterTemplate, type FilterTemplateProps } from "../../FilterTemplate";
import { GenshinImage } from "../../GenshinImage";

export type ArtifactFilterSet = {
  code: number;
  chosen: boolean;
  icon: string;
  data: AppArtifact;
};

export interface ArtifactSetFilterProps
  extends Pick<FilterTemplateProps, "title" | "description" | "className" | "disabledClearAll" | "onClickClearAll"> {
  setsWrapCls?: string;
  setOptions: ArtifactFilterSet[];
  onClickSet?: (index: number) => void;
}
export function ArtifactSetFilter({
  className,
  setOptions,
  setsWrapCls,
  onClickSet,
  ...templateProps
}: ArtifactSetFilterProps) {
  return (
    <FilterTemplate
      className={["h-full flex flex-col", className]}
      disabledClearAll={setOptions.every((set) => !set.chosen)}
      {...templateProps}
    >
      <div className="grow custom-scrollbar">
        <div className={setsWrapCls}>
          {setOptions.map((set, i) => {
            return (
              <div key={i} className="p-2" onClick={() => onClickSet?.(i)}>
                <div
                  title={set.data.name}
                  className={clsx(
                    "rounded-circle",
                    set.chosen ? "shadow-3px-2px shadow-bonus-color bg-surface-1" : "bg-transparent"
                  )}
                >
                  <GenshinImage className="p-1" src={set.icon} imgType="artifact" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FilterTemplate>
  );
}
