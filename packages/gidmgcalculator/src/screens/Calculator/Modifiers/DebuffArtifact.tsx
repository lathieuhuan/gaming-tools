import type { IArtifactDebuffCtrl } from "@/types";

import Object_ from "@/utils/Object";
import { useShallowCalcStore } from "@Store/calculator";
import { updateActiveSetup } from "@Store/calculator/actions";
import { selectSetup } from "@Store/calculator/selectors";
import { toggleModCtrl, updateModCtrlInputs } from "@Store/calculator/utils";

import { ArtifactDebuffsView } from "@/components";

export default function DebuffArtifact() {
  const { artDebuffCtrls } = useShallowCalcStore((state) =>
    Object_.pickProps(selectSetup(state), ["artDebuffCtrls"])
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
        return {
          onToggle: () => {
            handleUpdateCtrls(toggleModCtrl(artDebuffCtrls, ctrl.id));
          },
          onSelectOption: (value, inputIndex) => {
            handleUpdateCtrls(updateModCtrlInputs(artDebuffCtrls, ctrl.id, inputIndex, value));
          },
        };
      }}
    />
  );
}
