import type { Teammate } from "@/models";
import type { ArtifactDebuffCtrl, TeammateArtifactDebuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getArtifactDesc } from "@/utils/descriptionParsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type ArtifactDebuffsViewProps = {
  mutable?: boolean;
  teammates: Teammate[];
  artDebuffCtrls: ArtifactDebuffCtrl[];
  getSelfHandlers?: (ctrl: ArtifactDebuffCtrl) => ModifierHanlders;
  getTeammateHandlers?: (teammate: Teammate, ctrl: TeammateArtifactDebuffCtrl) => ModifierHanlders;
};

export function ArtifactDebuffsView({
  mutable,
  teammates,
  artDebuffCtrls,
  getSelfHandlers,
  getTeammateHandlers,
}: ArtifactDebuffsViewProps) {
  return (
    <ModifierContainer type="debuffs" mutable={mutable}>
      {artDebuffCtrls.map((ctrl) => {
        return (
          <GenshinModifierView
            key={`${ctrl.code}-${ctrl.id}`}
            mutable={mutable}
            heading={`${ctrl.setData.name} / Self`}
            description={getArtifactDesc(ctrl.setData, ctrl.data)}
            checked={ctrl.activated}
            inputs={ctrl.inputs}
            inputConfigs={ctrl.data.inputConfigs}
            {...getSelfHandlers?.(ctrl)}
          />
        );
      })}

      {teammates
        .map((teammate) => {
          const { artifact } = teammate;
          if (!artifact) return null;

          return artifact.debuffCtrls.map((ctrl) => {
            const { data } = ctrl;

            return (
              <GenshinModifierView
                key={`${teammate.code}-${ctrl.id}`}
                mutable={mutable}
                checked={ctrl.activated}
                heading={`${artifact.data.name} / ${teammate.data.name}`}
                description={getArtifactDesc(artifact.data, data)}
                inputs={ctrl.inputs}
                inputConfigs={data.inputConfigs}
                isTeamMod={!!data.teamBuffId}
                {...getTeammateHandlers?.(teammate, ctrl)}
              />
            );
          });
        })
        .flat()}
    </ModifierContainer>
  );
}
