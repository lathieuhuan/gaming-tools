import { GenshinModifierView } from "@/components";
import { $AppData } from "@/services";
import { TeamBuffCtrl } from "@/types";
import Modifier_ from "@/utils/Modifier";
import { selectTeamBuffCtrls, updateTeamBuffs } from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { ControlGroup } from "../types";
import { parseDescription } from "@/utils/description-parsers";

function reorderCtrls(teamBuffCtrls: TeamBuffCtrl[] = []) {
  let ascendantCtrl: TeamBuffCtrl | undefined;
  const otherCtrls: TeamBuffCtrl[] = [];

  for (const ctrl of teamBuffCtrls) {
    if (ctrl.id === Modifier_.MS_ASCENDANT_BUFF_ID) {
      ascendantCtrl = ctrl;
    } else {
      otherCtrls.push(ctrl);
    }
  }

  return ascendantCtrl ? [ascendantCtrl, ...otherCtrls] : otherCtrls;
}

export function useTeamBuffCtrlGroup(): ControlGroup {
  const dispatch = useDispatch();
  const teamBuffCtrls = useSelector(selectTeamBuffCtrls);
  const reorderedCtrls = reorderCtrls(teamBuffCtrls);

  const nodes: JSX.Element[] = [];

  const updateCtrl = (id: string, data: Partial<TeamBuffCtrl>) => {
    dispatch(
      updateTeamBuffs({
        id,
        ...data,
      })
    );
  };

  const handleToggle = (ctrl: TeamBuffCtrl) => () => {
    updateCtrl(ctrl.id, { activated: !ctrl.activated });
  };

  const handleUpdateInput = (ctrl: TeamBuffCtrl) => (value: number, inputIndex: number) => {
    const { inputs = [] } = ctrl;
    const newInputs = [...inputs];
    newInputs[inputIndex] = value;

    updateCtrl(ctrl.id, { inputs: newInputs });
  };

  for (const ctrl of reorderedCtrls) {
    const buff = $AppData.teamBuffs.find((buff) => buff.id === ctrl.id);

    if (buff) {
      nodes.push(
        <GenshinModifierView
          key={ctrl.id}
          mutable
          heading={buff.src}
          description={parseDescription(buff.description)}
          inputConfigs={buff.inputConfigs}
          checked={ctrl.activated}
          inputs={ctrl.inputs}
          onToggle={handleToggle(ctrl)}
          onSelectOption={handleUpdateInput(ctrl)}
          onChangeText={handleUpdateInput(ctrl)}
        />
      );
    }
  }

  if (nodes.length) {
    return {
      isEmpty: false,
      key: "team-buffs",
      render: (className?: string) => <div className={className}>{nodes}</div>,
    };
  }

  return {
    isEmpty: true,
  };
}
