import type { ITeamBuffCtrl } from "@/types";
import type { ControlGroup } from "../types";

import { MS_ASCENDANT_BUFF_ID } from "@/models/calculator";
import { parseDescription } from "@/utils/description-parsers";
import { useCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { GenshinModifierView } from "@/components";

function reorderCtrls(teamBuffCtrls: ITeamBuffCtrl[] = []) {
  let ascendantCtrl: ITeamBuffCtrl | undefined;

  const otherCtrls = teamBuffCtrls.filter((ctrl) => {
    if (ctrl.data.index === MS_ASCENDANT_BUFF_ID) {
      ascendantCtrl = ctrl;
      return false;
    }
    return true;
  });

  return ascendantCtrl ? [ascendantCtrl, ...otherCtrls] : otherCtrls;
}

export function useTeamBuffCtrlGroup(): ControlGroup {
  const teamBuffCtrls = useCalcStore((state) => selectSetup(state).teamBuffCtrls);
  const reorderedCtrls = reorderCtrls(teamBuffCtrls);

  if (reorderedCtrls.length) {
    const handleToggle = (ctrl: ITeamBuffCtrl) => () => {
      updateActiveSetup((setup) => {
        setup.teamBuffCtrls = toggleModCtrl(teamBuffCtrls, ctrl.id);
      });
    };

    const handleUpdateInput = (ctrl: ITeamBuffCtrl) => (value: number, inputIndex: number) => {
      updateActiveSetup((setup) => {
        setup.teamBuffCtrls = updateModCtrlInputs(teamBuffCtrls, ctrl.id, inputIndex, value);
      });
    };

    return {
      isEmpty: false,
      key: "team-buffs",
      render: (className?: string) => (
        <div className={className}>
          {reorderedCtrls.map((ctrl) => {
            const data = ctrl.data;

            return (
              <GenshinModifierView
                key={data.index}
                mutable
                heading={data.src}
                description={parseDescription(data.description)}
                inputConfigs={data.inputConfigs}
                checked={ctrl.activated}
                inputs={ctrl.inputs}
                onToggle={handleToggle(ctrl)}
                onSelectOption={handleUpdateInput(ctrl)}
                onChangeText={handleUpdateInput(ctrl)}
              />
            );
          })}
        </div>
      ),
    };
  }

  return {
    isEmpty: true,
  };
}
