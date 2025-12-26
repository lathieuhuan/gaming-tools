import type { CalcTeammate } from "@/models/calculator";
import type { IArtifactBuffCtrl, ITeammateArtifactBuffCtrl } from "@/types";

import Object_ from "@/utils/Object";
import { updateActiveSetup, updateTeammateArtifact } from "@Store/calculator/actions";
import { useShallowCalcStore } from "@Store/calculator/calculator-store";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { ArtifactBuffsView } from "@/components";

export default function BuffArtifact() {
  const { artBuffCtrls, teammates } = useShallowCalcStore((state) => {
    return Object_.pickProps(selectSetup(state), ["artBuffCtrls", "teammates"]);
  });

  const handleUpdateSelfCtrls = (newCtrls: IArtifactBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.artBuffCtrls = newCtrls;
    });
  };

  const handleUpdateTeammateCtrls = (
    teammate: CalcTeammate,
    newCtrls: ITeammateArtifactBuffCtrl[]
  ) => {
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

        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateSelfCtrls(
            updateModCtrlInputs(artBuffCtrls, ctrl.id, inputIndex, value, extraCheck)
          );
        };

        return {
          onToggle: () => {
            handleUpdateSelfCtrls(toggleModCtrl(artBuffCtrls, ctrl.id, extraCheck));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateCtrlInput,
          onSelectOption: updateCtrlInput,
        };
      }}
      getTeammateHandlers={(teammate, ctrl) => {
        const buffCtrls = teammate.artifact?.buffCtrls;

        if (!buffCtrls) {
          return {};
        }

        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateTeammateCtrls(
            teammate,
            updateModCtrlInputs(buffCtrls, ctrl.id, inputIndex, value)
          );
        };

        return {
          onToggle: () => {
            handleUpdateTeammateCtrls(teammate, toggleModCtrl(buffCtrls, ctrl.id));
          },
          onToggleCheck: (currentInput, inputIndex) => {
            updateCtrlInput(currentInput === 1 ? 0 : 1, inputIndex);
          },
          onChangeText: updateCtrlInput,
          onSelectOption: updateCtrlInput,
        };
      }}
    />
  );
}
