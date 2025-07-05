import { clsx } from "rond";
import { AppArtifact } from "@Calculation";

import { FilterTemplate, type FilterTemplateProps } from "../../FilterTemplate";
import { GenshinImage } from "../../GenshinImage";

export type ArtifactFilterSet = {
  code: number;
  chosen: boolean;
  icon: string;
  data: AppArtifact;
  count: number;
};

export interface ArtifactSetFilterProps
  extends Pick<FilterTemplateProps, "title" | "message" | "className" | "disabledClearAll" | "onClickClearAll"> {
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
              <div key={i} className="p-2 relative" onClick={() => onClickSet?.(i)}>
                <div
                  title={set.data.name}
                  className={clsx(
                    "rounded-circle",
                    set.chosen ? "shadow-3px-2px shadow-bonus-color bg-surface-1" : "bg-transparent"
                  )}
                >
                  <GenshinImage className="p-1" src={set.icon} imgType="artifact" />
                </div>

                <span className="absolute top-1 left-1 rounded bg-black/60 text-light-default flex">
                  <span className="px-1 text-sm font-semibold rounded bg-black/30">{set.count}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </FilterTemplate>
  );
}
