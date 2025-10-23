import { AppArtifact } from "@Calculation";
import { clsx } from "rond";

import { FilterTemplate, type FilterTemplateProps } from "@/components/FilterTemplate";
import { GenshinImage } from "@/components/GenshinImage";

export type ArtifactFilterSet = {
  code: number;
  chosen: boolean;
  icon: string;
  data: AppArtifact;
  count: number;
};

export type ArtifactSetFilterProps = Pick<
  FilterTemplateProps,
  "title" | "message" | "className" | "clearAllDisabled" | "onClearAll"
> & {
  setsWrapCls?: string;
  setOptions: ArtifactFilterSet[];
  onSetClick?: (index: number) => void;
};

export function ArtifactSetFilter({
  className,
  setOptions,
  setsWrapCls,
  onSetClick,
  ...templateProps
}: ArtifactSetFilterProps) {
  return (
    <FilterTemplate
      className={["h-full flex flex-col", className]}
      clearAllDisabled={setOptions.every((set) => !set.chosen)}
      {...templateProps}
    >
      <div className="grow custom-scrollbar">
        <div className={setsWrapCls}>
          {setOptions.map((set, i) => {
            return (
              <div key={i} className="p-2 relative" onClick={() => onSetClick?.(i)}>
                <div
                  title={set.data.name}
                  className={clsx(
                    "rounded-circle",
                    set.chosen ? "shadow-hightlight-2 shadow-bonus bg-dark-1" : "bg-transparent"
                  )}
                >
                  <GenshinImage className="p-1" src={set.icon} imgType="artifact" />
                </div>

                <span className="absolute top-1 left-1 rounded bg-black/60 text-light-1 flex">
                  <span className="px-1 text-sm font-semibold rounded bg-black/30">
                    {set.count}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </FilterTemplate>
  );
}
