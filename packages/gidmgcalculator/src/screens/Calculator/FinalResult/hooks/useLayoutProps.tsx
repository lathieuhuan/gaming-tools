import { Array_, Object_ } from "ron-utils";

import type { FinalResultLayoutProps } from "@/components";
import type { TalentType } from "@/types";
import type { CalculatorState } from "@Store/calculator/types";

import { TALENT_TYPES } from "@/constants/global";
import { useShallowCalcStore } from "@Store/calculator";

type UseLayoutPropsReturn = Pick<FinalResultLayoutProps, "showWeaponCalc" | "headerConfigs" | "character"> &
  Pick<CalculatorState, "setupsById" | "standardId"> & {
    setupIds: number[];
  };

export function useLayoutProps(comparedIds: number[]): UseLayoutPropsReturn {
  const { setupManagers, setupsById, standardId } = useShallowCalcStore((state) =>
    Object_.extract(state, ["setupManagers", "setupsById", "standardId"])
  );

  const standardWeapon = setupsById[standardId].main.weapon.code;
  const showWeaponCalc = comparedIds.some((id) => setupsById[id].main.weapon.code !== standardWeapon);
  const setupIds = [standardId].concat(comparedIds.filter((id) => id !== standardId));

  const talent = {} as Record<TalentType, { areSame: boolean; levels: number[] }>;

  for (const talentType of TALENT_TYPES) {
    const levels = setupIds.map((id) => setupsById[id].main.getFinalTalentLv(talentType));

    talent[talentType] = {
      areSame: new Set(levels).size === 1,
      levels,
    };
  }

  const headerConfigs: UseLayoutPropsReturn["headerConfigs"] = setupIds.map((id, setupIndex) => {
    const text = Array_.findById(setupManagers, id)?.name || "";

    return {
      content: (talentType) => {
        const talentCalc = talentType ? talent[talentType] : undefined;
        const talentLevel = talentCalc && !talentCalc.areSame ? talentCalc.levels[setupIndex] : undefined;

        if (talentLevel) {
          return (
            <div className="flex flex-col items-center">
              <span>{text}</span>
              <span className="px-1 rounded-sm text-xs font-bold text-secondary-1">Lv.{talentLevel}</span>
            </div>
          );
        }

        return text;
      },
    };
  });

  return {
    character: setupsById[standardId].main,
    showWeaponCalc,
    headerConfigs,
    setupIds,
    standardId,
    setupsById,
  };
}
