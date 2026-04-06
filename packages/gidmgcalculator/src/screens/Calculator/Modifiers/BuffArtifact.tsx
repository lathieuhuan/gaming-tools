import { Object_ } from "ron-utils";

import type { TeammateCalc } from "@/models";
import type { IArtifactBuffCtrl, ITeammateArtifactBuffCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup, updateTeammateArtifact } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { ArtifactBuffsView } from "@/components";

export default function BuffArtifact() {
  const { artBuffCtrls, teammates } = useShallowCalcStore((state) => {
    return Object_.extract(selectSetup(state), ["artBuffCtrls", "teammates"]);
  });

  const handleUpdateSelfCtrls = (newCtrls: IArtifactBuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.artBuffCtrls = newCtrls;
    });
  };

  const handleUpdateTeammateCtrls = (
    teammate: TeammateCalc,
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
