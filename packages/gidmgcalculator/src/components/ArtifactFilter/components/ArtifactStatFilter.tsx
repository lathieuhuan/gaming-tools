import { clsx, VersatileSelect } from "rond";
import { ArtifactCalc, ArtifactType, ATTACK_ELEMENTS } from "@Calculation";

import { ARTIFACT_SUBSTAT_TYPES } from "@/constants";
import { useTranslation } from "@/hooks";
import { ArtifactStatFilterCondition } from "@/utils/filter-artifacts";
import { FilterTemplate, FilterTemplateProps } from "../../FilterTemplate";

type RenderSelectArgs = {
  no?: number;
  value: string;
  options: string[];
  showSelect?: boolean;
  onChange: (value: string, no: number) => void;
};

export interface ArtifactStatFilterProps
  extends Pick<FilterTemplateProps, "title" | "message" | "className" | "disabledClearAll" | "onClickClearAll"> {
  filter: ArtifactStatFilterCondition;
  artifactType?: ArtifactType;
  hasDuplicates?: boolean;
  onChangeMainStat: (newStat: string) => void;
  onChangeSubStat: (newStat: string, index: number) => void;
}
export function ArtifactStatFilter({
  filter,
  artifactType,
  hasDuplicates,
  onChangeMainStat,
  onChangeSubStat,
  ...templateProps
}: ArtifactStatFilterProps) {
  const { t } = useTranslation();

  const mainStatOptions = artifactType
    ? ["All", ...ArtifactCalc.possibleMainStatTypesOf(artifactType)]
    : ["All", "hp", "hp_", "atk", "atk_", "def_", "em", "er_", "cRate_", "cDmg_", ...ATTACK_ELEMENTS, "healB_"];
  const subStatOptions = ["All"].concat(ARTIFACT_SUBSTAT_TYPES);

  const disabledClearAll = filter.main === "All" && filter.subs.every((s) => s === "All");

  const renderSelect = (args: RenderSelectArgs) => {
    const { no = 0, showSelect = true } = args;

    return (
      <div key={no} className="px-4 w-56 h-8 bg-dark-3 flex items-center">
        <div className="mr-1 pt-0.5 w-2.5 text-base text-light-1 shrink-0">{no ? <p>{no}.</p> : null}</div>
        {showSelect ? (
          <VersatileSelect
            title="Select Stat"
            className={clsx("w-full", args.value === "All" ? "text-light-1" : "text-bonus")}
            transparent
            options={args.options.map((type) => ({ label: t(type), value: type }))}
            value={args.value}
            onChange={(value) => args.onChange(`${value}`, no - 1)}
          />
        ) : null}
      </div>
    );
  };

  return (
    <FilterTemplate
      message={`Also sort by stats. The priority is Main Stat (if not "All"), then Sub Stat 1, Sub Stat 2, and so on.`}
      disabledClearAll={disabledClearAll}
      {...templateProps}
    >
      <div className="space-y-1">
        <p className="text-lg text-secondary-1 font-semibold">Main Stat</p>
        <div className="mt-1 flex justify-center">
          {renderSelect({ value: filter.main, options: mainStatOptions, onChange: onChangeMainStat })}
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-lg text-secondary-1 font-semibold">Sub Stats</p>
        <div className="flex flex-col items-center space-y-2">
          {[1, 2, 3, 4].map((no, i) => {
            const prevValue = filter.subs[i - 1];

            return renderSelect({
              no,
              value: filter.subs[i],
              options: subStatOptions,
              showSelect: !prevValue || prevValue !== "All",
              onChange: onChangeSubStat,
            });
          })}
        </div>
      </div>

      {hasDuplicates && <p className="mt-4 text-danger-2">Every stat must be unique!</p>}
    </FilterTemplate>
  );
}
