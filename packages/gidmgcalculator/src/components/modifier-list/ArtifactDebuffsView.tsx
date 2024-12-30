import type { ArtifactModCtrl } from "@Src/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { $AppArtifact } from "@Src/services";
import { getArtifactDescription } from "@Src/utils/description-parsers";
import Array_ from "@Src/utils/array-utils";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface ArtifactDebuffsViewProps {
  mutable?: boolean;
  artDebuffCtrls: ArtifactModCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs<ArtifactModCtrl>) => ModifierHanlders;
}
export function ArtifactDebuffsView({ mutable, artDebuffCtrls, getHanlders }: ArtifactDebuffsViewProps) {
  const content: JSX.Element[] = [];

  artDebuffCtrls.forEach((ctrl, ctrlIndex, ctrls) => {
    const data = $AppArtifact.getSet(ctrl.code);
    if (!data) return;

    const debuff = Array_.findByIndex(data.debuffs, ctrl.index);

    if (debuff) {
      content.push(
        <GenshinModifierView
          key={`${ctrl.code}-${ctrl.index}`}
          mutable={mutable}
          heading={data.name}
          description={getArtifactDescription(data, debuff)}
          checked={ctrl.activated}
          inputs={ctrl.inputs}
          inputConfigs={debuff.inputConfigs}
          {...getHanlders?.({ ctrl, ctrlIndex, ctrls })}
        />
      );
    }
  });
  return renderModifiers(content, "debuffs", mutable);
}
