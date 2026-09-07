import { Object_ } from "ron-utils";

import type { ArtifactDebuffCtrl, TeammateArtifactDebuffCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { ArtifactDebuffsView } from "@/components/ModifierLists";
import { Teammate } from "@/models";

export default function DebuffArtifact() {
  const { artDebuffCtrls, teammates } = useShallowCalcStore((state) =>
    Object_.extract(selectSetup(state), ["artDebuffCtrls", "teammates"]),
  );

  const handleUpdateSelfCtrls = (newCtrls: ArtifactDebuffCtrl[]) => {
    updateSetup((setup) => {
      setup.artDebuffCtrls = newCtrls;
    });
  };

  const handleUpdateTeammateCtrls = (
    teammate: Teammate,
    newCtrls: TeammateArtifactDebuffCtrl[],
  ) => {
    updateSetup((setup) => {
      setup.updateTeammateArtifact(teammate.data.code, {
        debuffCtrls: newCtrls,
      });
    });
  };

  return (
    <ArtifactDebuffsView
      mutable
      teammates={teammates}
      artDebuffCtrls={artDebuffCtrls}
      getSelfHandlers={(ctrl) => {
        const extraCheck = (ctrlItem: ArtifactDebuffCtrl) => ctrlItem.code === ctrl.code;

        return {
          onToggle: () => {
            handleUpdateSelfCtrls(toggleModCtrl(artDebuffCtrls, ctrl.id, extraCheck));
          },
          onSelectOption: (value, inputIndex) => {
            handleUpdateSelfCtrls(
              updateModCtrlInputs(artDebuffCtrls, ctrl.id, inputIndex, value, extraCheck),
            );
          },
        };
      }}
      getTeammateHandlers={(teammate, ctrl) => {
        const debuffCtrls = teammate.artifact?.debuffCtrls;

        if (!debuffCtrls) {
          return {};
        }

        const updateCtrlInput = (value: number, inputIndex: number) => {
          handleUpdateTeammateCtrls(
            teammate,
            updateModCtrlInputs(debuffCtrls, ctrl.id, inputIndex, value),
          );
        };

        return {
          onToggle: () => {
            handleUpdateTeammateCtrls(teammate, toggleModCtrl(debuffCtrls, ctrl.id));
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
