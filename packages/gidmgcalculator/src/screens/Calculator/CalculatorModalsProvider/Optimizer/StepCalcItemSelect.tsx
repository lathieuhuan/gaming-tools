import { AttackPattern, LevelableTalentType, NORMAL_ATTACKS } from "@Backend";
import { useTranslation } from "@Src/hooks";
import { useCharacterData } from "../../contexts";
import { useState } from "react";
import { clsx } from "rond";

export type SelectedCalcItem = {
  attPatt: AttackPattern;
  index: number;
};

type RenderGroup = {
  title: LevelableTalentType;
  subGroups: Array<{
    attPatt: AttackPattern;
    items: string[];
  }>;
};

interface StepCalcItemSelectProps {
  id: string;
  initialValue?: SelectedCalcItem;
  onChangeValid?: (valid: boolean) => void;
  onSubmit: (calcItem: SelectedCalcItem) => void;
}
export function StepCalcItemSelect(props: StepCalcItemSelectProps) {
  const { t } = useTranslation();
  const appChar = useCharacterData();
  const [selectedItems, setSelectedItems] = useState<SelectedCalcItem[]>(
    props.initialValue ? [props.initialValue] : []
  );

  const renderGroups: RenderGroup[] = [
    {
      title: "NAs",
      subGroups: NORMAL_ATTACKS.map((attPatt) => {
        return {
          attPatt,
          items: appChar.calcList[attPatt].map((item) => item.name),
        };
      }),
    },
    {
      title: "ES",
      subGroups: [
        {
          attPatt: "ES",
          items: appChar.calcList.ES.map((item) => item.name),
        },
      ],
    },
    {
      title: "EB",
      subGroups: [
        {
          attPatt: "EB",
          items: appChar.calcList.EB.map((item) => item.name),
        },
      ],
    },
  ];

  const onClickItem = (item: SelectedCalcItem) => {
    setSelectedItems([item]);
    props.onChangeValid?.(true);
  };

  return (
    <form
      id={props.id}
      className="h-full flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(selectedItems[0]);
      }}
    >
      <p>Damage Instance to be optimized</p>

      <div className="mt-2 pr-2 grow space-y-2 custom-scrollbar">
        {renderGroups.map((group, groupIndex) => {
          return (
            <div key={groupIndex} className="p-3 text-sm bg-surface-1 cursor-default rounded">
              <p className="text-secondary-1">{t(group.title)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.subGroups.map((subGroup) => {
                  const isSelectedGroup = subGroup.attPatt === selectedItems[0]?.attPatt;

                  return subGroup.items.map((item, index) => {
                    const isSeleted = isSelectedGroup && index === selectedItems[0]?.index;

                    return (
                      <span
                        key={`${subGroup.attPatt}.${index}`}
                        className={clsx(
                          "px-2 py-1 font-medium rounded",
                          isSeleted ? "bg-active-color text-black" : "hover:bg-surface-3"
                        )}
                        onClick={() => onClickItem({ attPatt: subGroup.attPatt, index })}
                      >
                        {item}
                      </span>
                    );
                  });
                })}
              </div>
            </div>
          );
        })}
      </div>
    </form>
  );
}
