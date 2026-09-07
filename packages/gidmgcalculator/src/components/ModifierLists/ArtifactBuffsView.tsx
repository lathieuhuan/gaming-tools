import type { Teammate } from "@/models";
import type { ArtifactBuffCtrl, TeammateArtifactBuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getArtifactDesc } from "@/utils/descriptionParsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type ArtifactBuffsViewProps = {
  mutable?: boolean;
  teammates: Teammate[];
  artBuffCtrls: ArtifactBuffCtrl[];
  getSelfHandlers?: (ctrl: ArtifactBuffCtrl) => ModifierHanlders;
  getTeammateHandlers?: (teammate: Teammate, ctrl: TeammateArtifactBuffCtrl) => ModifierHanlders;
};

export function ArtifactBuffsView({
  mutable,
  teammates,
  artBuffCtrls,
  getSelfHandlers,
  getTeammateHandlers,
}: ArtifactBuffsViewProps) {
  return (
    <ModifierContainer type="buffs" mutable={mutable}>
      {artBuffCtrls.map((ctrl) => {
        const { data, setData } = ctrl;

        return (
          <GenshinModifierView
            key={`main-${ctrl.code}-${ctrl.id}`}
            mutable={mutable}
            checked={ctrl.activated}
            heading={`${setData.name} / self`}
            description={getArtifactDesc(setData, data)}
            inputs={ctrl.inputs}
            inputConfigs={data.inputConfigs}
            isTeamMod={!!data.teamBuffId}
            {...getSelfHandlers?.(ctrl)}
          />
        );
      })}

      {teammates
        .map((teammate) => {
          const { artifact } = teammate;
          if (!artifact) return null;

          return artifact.buffCtrls.map((ctrl) => {
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
