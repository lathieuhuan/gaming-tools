import type { CalcTeammate } from "@/models/calculator";
import type { IArtifactBuffCtrl } from "@/types";

import { updateActiveSetup, updateTeammateArtifact } from "@Store/calculator/actions";
import { useShallowCalcStore } from "@Store/calculator/calculator-store";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { ArtifactBuffsView } from "@/components";
import Object_ from "@/utils/Object";

export default function BuffArtifact() {
  const { artBuffCtrls, teammates } = useShallowCalcStore((state) => {
    return Object_.pickProps(selectSetup(state), ["artBuffCtrls", "teammates"]);
  });

  const handleUpdateSelfBuffCtrls = (newCtrls: IArtifactBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.artBuffCtrls = newCtrls;
    });
  };

  const handleUpdateTeammateBuffCtrls = (teammate: CalcTeammate, newCtrls: IArtifactBuffCtrl[]) => {
    updateTeammateArtifact(teammate.data.code, {
      buffCtrls: newCtrls,
    });
  };

  return (
    <ArtifactBuffsView
      mutable
      teammates={teammates}
      artBuffCtrls={artBuffCtrls}
      getSelfHandlers={(ctrl) => {
        const extraCheck = (ctrlItem: IArtifactBuffCtrl) => ctrlItem.code === ctrl.code;

        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateSelfBuffCtrls(
            updateModCtrlInputs(artBuffCtrls, ctrl.id, inputIndex, value, extraCheck)
          );
        };

        return {
          onToggle: () => {
            handleUpdateSelfBuffCtrls(toggleModCtrl(artBuffCtrls, ctrl.id, extraCheck));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateBuffCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateBuffCtrlInput,
          onSelectOption: updateBuffCtrlInput,
        };
      }}
      getTeammateHandlers={(teammate, ctrl) => {
        const buffCtrls = teammate.artifact?.buffCtrls;

        if (!buffCtrls) {
          return {};
        }

        const updateBuffCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateTeammateBuffCtrls(
            teammate,
            updateModCtrlInputs(buffCtrls, ctrl.id, inputIndex, value)
          );
        };

        return {
          onToggle: () => {
            handleUpdateTeammateBuffCtrls(teammate, toggleModCtrl(buffCtrls, ctrl.id));
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
