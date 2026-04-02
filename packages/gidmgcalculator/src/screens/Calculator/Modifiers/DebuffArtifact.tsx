import { Object_ } from "ron-utils";

import type { IArtifactDebuffCtrl } from "@/types";

import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { ArtifactDebuffsView } from "@/components";

export default function DebuffArtifact() {
  const { artDebuffCtrls } = useShallowCalcStore((state) =>
    Object_.extract(selectSetup(state), ["artDebuffCtrls"])
  );

  const handleUpdateCtrls = (newCtrls: IArtifactDebuffCtrl[]) => {
    updateActiveSetup((setup) => {
      setup.artDebuffCtrls = newCtrls;
    });
  };

  return (
    <ArtifactDebuffsView
      mutable
      artDebuffCtrls={artDebuffCtrls}
      getHanlders={(ctrl) => {
        const extraCheck = (ctrlItem: IArtifactDebuffCtrl) => ctrlItem.code === ctrl.code;

        return {
          onToggle: () => {
            handleUpdateCtrls(toggleModCtrl(artDebuffCtrls, ctrl.id, extraCheck));
          },
          onSelectOption: (value, inputIndex) => {
            handleUpdateCtrls(
              updateModCtrlInputs(artDebuffCtrls, ctrl.id, inputIndex, value, extraCheck)
            );
          },
        };
      }}
    />
  );
}
