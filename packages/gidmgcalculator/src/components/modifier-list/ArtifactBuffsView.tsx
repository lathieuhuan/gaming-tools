import type { CalcTeammate } from "@/models/calculator";
import type { IArtifactBuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getArtifactDesc } from "@/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type RenderArtifactBuffsArgs = {
  mutable?: boolean;
  keyPrefix: string | number;
  headingSuffix?: string;
  bonusLv?: number;
  ctrls: IArtifactBuffCtrl[];
  getHanlders?: (ctrl: IArtifactBuffCtrl) => ModifierHanlders;
};

function renderArtifactModifiers({
  keyPrefix,
  headingSuffix,
  mutable,
  ctrls,
  getHanlders,
}: RenderArtifactBuffsArgs) {
  return ctrls.map((ctrl) => {
    const { data, setData } = ctrl;

    return (
      <GenshinModifierView
        key={`${keyPrefix}-${ctrl.code}-${ctrl.id}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${setData.name} / ${headingSuffix}`}
        description={getArtifactDesc(setData, data)}
        inputs={ctrl.inputs}
        inputConfigs={data.inputConfigs}
        isTeamMod={!!data.teamBuffId}
        {...getHanlders?.(ctrl)}
      />
    );
  });
}

type ArtifactBuffsViewProps = {
  mutable?: boolean;
  artBuffCtrls: IArtifactBuffCtrl[];
  teammates: CalcTeammate[];
  getSelfHandlers?: (ctrl: IArtifactBuffCtrl) => ModifierHanlders;
  getTeammateHandlers?: (teammate: CalcTeammate, ctrl: IArtifactBuffCtrl) => ModifierHanlders;
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
      {renderArtifactModifiers({
        mutable,
        keyPrefix: "main",
        headingSuffix: "self",
        ctrls: artBuffCtrls,
        getHanlders: getSelfHandlers,
      })}

      {teammates
        .map((teammate) => {
          if (!teammate.artifact) {
            return null;
          }

          return renderArtifactModifiers({
            mutable,
            keyPrefix: teammate.name,
            headingSuffix: teammate.name,
            ctrls: teammate.artifact?.buffCtrls,
            getHanlders: (ctrl) => getTeammateHandlers?.(teammate, ctrl) || {},
          });
        })
        .flat()}
    </ModifierContainer>
  );
}
