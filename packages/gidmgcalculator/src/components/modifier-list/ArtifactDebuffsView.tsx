import type { ArtifactDebuffCtrl } from "@Src/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { $AppData } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { GiModifierView } from "../GiModifierView";
import { renderModifiers, getArtifactDescription } from "./modifiers.utils";

interface ArtifactDebuffsViewProps {
  mutable?: boolean;
  artDebuffCtrls: ArtifactDebuffCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}
export function ArtifactDebuffsView({ mutable, artDebuffCtrls, getHanlders }: ArtifactDebuffsViewProps) {
  const content: JSX.Element[] = [];

  artDebuffCtrls.forEach((ctrl, ctrlIndex) => {
    const data = $AppData.getArtifactSet(ctrl.code);
    if (!data) return;

    const { name, debuffs = [] } = data;
    const debuff = findByIndex(debuffs, ctrl.index);

    if (debuff) {
      content.push(
        <GiModifierView
          key={`${ctrl.code}-${ctrl.index}`}
          mutable={mutable}
          heading={name}
          description={getArtifactDescription(data, debuff)}
          checked={ctrl.activated}
          inputs={ctrl.inputs}
          inputConfigs={debuff.inputConfigs}
          {...getHanlders?.({ ctrl, ctrlIndex, ctrls: artDebuffCtrls })}
        />
      );
    }
  });
  return renderModifiers(content, "debuffs", mutable);
}
