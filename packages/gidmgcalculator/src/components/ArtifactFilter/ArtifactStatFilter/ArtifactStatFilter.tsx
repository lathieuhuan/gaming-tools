import { ArtifactCalc, ArtifactType, ATTACK_ELEMENTS } from "@Calculation";

import { ARTIFACT_SUBSTAT_TYPES } from "@/constants";
import { useTranslation } from "@/hooks";
import { ArtifactStatFilterCondition } from "@/utils/filterArtifacts";

import { FilterTemplate, FilterTemplateProps } from "@/components/FilterTemplate";
import { StatSelect } from "./StatSelect";

export type ArtifactStatFilterProps = Pick<
  FilterTemplateProps,
  "title" | "message" | "className" | "onClearAll"
> & {
  filter: ArtifactStatFilterCondition;
  artifactType?: ArtifactType;
  hasDuplicates?: boolean;
  onMainStatChange: (newStat: string) => void;
  onSubStatChange: (newStat: string, index: number) => void;
};

export function ArtifactStatFilter({
  filter,
  artifactType,
  hasDuplicates,
  onMainStatChange,
  onSubStatChange,
  ...templateProps
}: ArtifactStatFilterProps) {
  const { t } = useTranslation();

  const mainStatOptions = artifactType
    ? ["All", ...ArtifactCalc.allMainStatTypesOf(artifactType)]
    : [
        "All",
        "hp",
        "hp_",
        "atk",
        "atk_",
        "def_",
        "em",
        "er_",
        "cRate_",
        "cDmg_",
        ...ATTACK_ELEMENTS,
        "healB_",
      ];
  const subStatOptions = ["All"].concat(ARTIFACT_SUBSTAT_TYPES);

  const clearAllDisabled = filter.main === "All" && filter.subs.every((s) => s === "All");

  const toSelectOptions = (options: string[]) => {
    return options.map((type) => ({
      label: t(type),
      value: type,
    }));
  };

  return (
    <FilterTemplate
      message={`Also sort by stats. The priority is Main Stat (if not "All"), then Sub Stat 1, Sub Stat 2, and so on.`}
      clearAllDisabled={clearAllDisabled}
      {...templateProps}
    >
      <div className="space-y-1">
        <p className="text-lg text-secondary-1 font-semibold">Main Stat</p>
        <div className="mt-1 flex justify-center">
          <StatSelect
            value={filter.main}
            options={toSelectOptions(mainStatOptions)}
            onChange={onMainStatChange}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <p className="text-lg text-secondary-1 font-semibold">Sub Stats</p>
        <div className="flex flex-col items-center space-y-2">
          {[1, 2, 3, 4].map((no, i) => {
            const prevValue = filter.subs[i - 1];

            return (
              <StatSelect
                key={no}
                prefix={no}
                visible={!prevValue || prevValue !== "All"}
                value={filter.subs[i]}
                options={toSelectOptions(subStatOptions)}
                onChange={(value) => onSubStatChange(value, i)}
              />
            );
          })}
        </div>
      </div>

      {hasDuplicates && <p className="mt-4 text-danger-3">Every stat must be unique!</p>}
    </FilterTemplate>
  );
}
