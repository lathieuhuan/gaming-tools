import type { IArtifactDebuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getArtifactDesc } from "@/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type ArtifactDebuffsViewProps = {
  mutable?: boolean;
  artDebuffCtrls: IArtifactDebuffCtrl[];
  getHanlders?: (ctrl: IArtifactDebuffCtrl) => ModifierHanlders;
};

export function ArtifactDebuffsView({
  mutable,
  artDebuffCtrls,
  getHanlders,
}: ArtifactDebuffsViewProps) {
  return (
    <ModifierContainer type="debuffs" mutable={mutable}>
      {artDebuffCtrls.map((ctrl) => {
        return (
          <GenshinModifierView
            key={`${ctrl.code}-${ctrl.id}`}
            mutable={mutable}
            heading={ctrl.setData.name}
            description={getArtifactDesc(ctrl.setData, ctrl.data)}
            checked={ctrl.activated}
            inputs={ctrl.inputs}
            inputConfigs={ctrl.data.inputConfigs}
            {...getHanlders?.(ctrl)}
          />
        );
      })}
    </ModifierContainer>
  );
}
