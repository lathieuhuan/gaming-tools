import { useState } from "react";
import { clsx } from "rond";
import type { AppCharacter, AttackPattern, TalentCalcItem, LevelableTalentType } from "@Backend";
import type { OptimizedOutput } from "../../OptimizationDept.types";

import { NORMAL_ATTACKS } from "@Backend";
import { useTranslation } from "@Src/hooks";

type RenderGroup = {
  title: LevelableTalentType;
  subGroups: Array<{
    attPatt: AttackPattern;
    items: TalentCalcItem[];
  }>;
};

interface OutputSelectProps {
  calcList: AppCharacter["calcList"];
  initialValue?: OptimizedOutput;
  onChange?: (items: OptimizedOutput) => void;
  onChangeValid?: (valid: boolean) => void;
}
export function OutputSelect(props: OutputSelectProps) {
  const { calcList } = props;
  const { t } = useTranslation();
  const [selectedOutput, setSelectedOutput] = useState<OptimizedOutput | undefined>(props.initialValue);

  const renderGroups: RenderGroup[] = [
    {
      title: "NAs",
      subGroups: NORMAL_ATTACKS.map((attPatt) => {
        return {
          attPatt,
          items: calcList[attPatt],
        };
      }),
    },
    {
      title: "ES",
      subGroups: [{ attPatt: "ES", items: calcList.ES }],
    },
    {
      title: "EB",
      subGroups: [{ attPatt: "EB", items: calcList.EB }],
    },
  ];

  const onClickItem = (output: OptimizedOutput) => {
    setSelectedOutput(output);
    props.onChange?.(output);
    props.onChangeValid?.(true);
  };

  return (
    <div className="h-full flex flex-col">
      <p>Select an output to be optimized</p>

      <div className="mt-2 pr-2 grow space-y-2 custom-scrollbar">
        {renderGroups.map((group, groupIndex) => {
          return (
            <div key={groupIndex} className="p-3 text-sm bg-surface-1 cursor-default rounded">
              <p className="text-secondary-1 opacity-80">{t(group.title)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.subGroups.map((subGroup) => {
                  const isSelectedGroup = subGroup.attPatt === selectedOutput?.attPatt;

                  return subGroup.items.map((item, index) => {
                    const isSeleted = isSelectedGroup && item.name === selectedOutput?.item.name;

                    return (
                      <span
                        key={`${subGroup.attPatt}.${index}`}
                        className={clsx(
                          "px-2 py-1 font-semibold rounded",
                          isSeleted ? "bg-active-color text-black" : "hover:bg-surface-3"
                        )}
                        onClick={() => onClickItem({ attPatt: subGroup.attPatt, item })}
                      >
                        {item.name}
                      </span>
                    );
                  });
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
