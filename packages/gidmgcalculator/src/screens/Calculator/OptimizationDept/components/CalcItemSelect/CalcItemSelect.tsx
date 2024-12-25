import { useState } from "react";
import { clsx } from "rond";
import { AppCharacter, AttackPattern, CalcItem, LevelableTalentType, NORMAL_ATTACKS } from "@Backend";
import { useTranslation } from "@Src/hooks";

export type SelectedCalcItem = {
  patternCate: AttackPattern;
  value: CalcItem;
};

type RenderGroup = {
  title: LevelableTalentType;
  subGroups: Array<{
    attPatt: AttackPattern;
    items: CalcItem[];
  }>;
};

interface CalcItemSelectProps {
  calcList: AppCharacter["calcList"];
  initialValue?: SelectedCalcItem;
  onChange?: (items: SelectedCalcItem[]) => void;
  onChangeValid?: (valid: boolean) => void;
}
export function CalcItemSelect(props: CalcItemSelectProps) {
  const { calcList } = props;
  const { t } = useTranslation();
  const [selectedItems, setSelectedItems] = useState<SelectedCalcItem[]>(
    props.initialValue ? [props.initialValue] : []
  );

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

  const onClickItem = (item: SelectedCalcItem) => {
    setSelectedItems([item]);
    props.onChange?.([item]);
    props.onChangeValid?.(true);
  };

  return (
    <div className="h-full flex flex-col">
      <p>Damage Instance to be optimized</p>

      <div className="mt-2 pr-2 grow space-y-2 custom-scrollbar">
        {renderGroups.map((group, groupIndex) => {
          return (
            <div key={groupIndex} className="p-3 text-sm bg-surface-1 cursor-default rounded">
              <p className="text-secondary-1">{t(group.title)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.subGroups.map((subGroup) => {
                  const isSelectedGroup = subGroup.attPatt === selectedItems[0]?.patternCate;

                  return subGroup.items.map((item, index) => {
                    const isSeleted = isSelectedGroup && item.name === selectedItems[0]?.value.name;

                    return (
                      <span
                        key={`${subGroup.attPatt}.${index}`}
                        className={clsx(
                          "px-2 py-1 font-medium rounded",
                          isSeleted ? "bg-active-color text-black" : "hover:bg-surface-3"
                        )}
                        onClick={() => onClickItem({ patternCate: subGroup.attPatt, value: item })}
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
