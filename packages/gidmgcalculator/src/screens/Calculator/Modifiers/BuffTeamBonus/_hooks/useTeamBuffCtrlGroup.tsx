import type { TeamBuffCtrl } from "@/types";
import type { ControlGroup } from "../types";

import { $AppData } from "@/services";
import { parseDescription } from "@/utils/descriptionParsers";
import { useCalcStore } from "@Store/calculator";
import { updateSetupModCtrls } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { GenshinModifierView } from "@/components/GenshinModifierView";

function reorderCtrls(teamBuffCtrls: TeamBuffCtrl[] = []) {
  let ascendantCtrl: TeamBuffCtrl | undefined;

  const otherCtrls = teamBuffCtrls.filter((ctrl) => {
    if (ctrl.data.id === $AppData.MS_ASCENDANT_BUFF_ID) {
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
    const handleToggle = (ctrl: TeamBuffCtrl) => () => {
      updateSetupModCtrls((setup) => {
        setup.teamBuffCtrls = toggleModCtrl(teamBuffCtrls, ctrl.id);
      });
    };

    const handleUpdateInput = (ctrl: TeamBuffCtrl) => (value: number, inputIndex: number) => {
      updateSetupModCtrls((setup) => {
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
                key={data.id}
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
