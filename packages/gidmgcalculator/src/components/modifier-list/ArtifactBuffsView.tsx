import type { CalcTeammate } from "@/models/calculator";
import type { IArtifactBuffCtrl, ITeammateArtifactBuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getArtifactDesc } from "@/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type ArtifactBuffsViewProps = {
  mutable?: boolean;
  artBuffCtrls: IArtifactBuffCtrl[];
  teammates: CalcTeammate[];
  getSelfHandlers?: (ctrl: IArtifactBuffCtrl) => ModifierHanlders;
  getTeammateHandlers?: (
    teammate: CalcTeammate,
    ctrl: ITeammateArtifactBuffCtrl
  ) => ModifierHanlders;
};

export function ArtifactBuffsView({
  mutable,
  artBuffCtrls,
  teammates,
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

          if (!artifact) {
            return null;
          }

          return artifact.buffCtrls.map((ctrl) => {
            const { data } = ctrl;

            return (
              <GenshinModifierView
                key={`${teammate.name}-${artifact.data.code}-${ctrl.id}`}
                mutable={mutable}
                checked={ctrl.activated}
                heading={`${artifact.data.name} / ${teammate.name}`}
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
