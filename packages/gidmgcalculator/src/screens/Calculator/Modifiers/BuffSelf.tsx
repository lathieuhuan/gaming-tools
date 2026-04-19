import { Array_, Object_ } from "ron-utils";

import type { CharacterBuff, AbilityBuffCtrl, TalentLevelBonus } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { SelfBuffsView } from "@/components";

function extractLevelBonus(effects: CharacterBuff["effects"] = []) {
  const levelBonus: TalentLevelBonus[] = [];

  for (const effect of Array_.toArray(effects)) {
    for (const bonus of Array_.toArray(effect.targets)) {
      if (bonus.module !== "TLT") continue;

      levelBonus.push({
        id: bonus.path,
        toType: bonus.path,
        value: 1,
        label: `Talent ${bonus.path}`,
      });
    }
  }

  return levelBonus;
}

export default function BuffSelf() {
  const { main, team, selfBuffCtrls } = useShallowCalcStore((state) =>
    Object_.extract(selectSetup(state), ["main", "team", "selfBuffCtrls"])
  );

  const handleUpdateCtrls = (newCtrls: AbilityBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      //
      for (const ctrl of newCtrls) {
        if (ctrl.activated) {
          extractLevelBonus(ctrl.data.effects).forEach((bonus) => {
            setup.main.state.addLevelBonus(bonus);
          });
        } else {
          extractLevelBonus(ctrl.data.effects).forEach((bonus) => {
            setup.main.state.removeLevelBonus(bonus.id);
          });
        }
      }

      setup.selfBuffCtrls = newCtrls;
    });
  };

  return (
    <SelfBuffsView
      mutable
      character={main}
      team={team}
      modCtrls={selfBuffCtrls}
      getHanlders={(ctrl) => {
        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateCtrls(updateModCtrlInputs(selfBuffCtrls, ctrl.id, inputIndex, value));
        };

        return {
          onToggle: () => {
            handleUpdateCtrls(toggleModCtrl(selfBuffCtrls, ctrl.id));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrlInput,
          onSelectOption: updateBuffCtrlInput,
        };
      }}
    />
  );
}
