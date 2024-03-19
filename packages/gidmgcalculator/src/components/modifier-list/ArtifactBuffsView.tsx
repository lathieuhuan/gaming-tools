import type { ArtifactSetBonus, ModifierCtrl, Party } from "@Src/types";
import type { GetModifierHanldersArgs, GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { $AppData } from "@Src/services";
import { findByIndex } from "@Src/utils";
import { GiModifierView } from "../GiModifierView";
import { renderModifiers, getArtifactDescription } from "./modifiers.utils";

interface RenderArtifactBuffsArgs {
  mutable?: boolean;
  fromSelf?: boolean;
  keyPrefix: string | number;
  code: number;
  ctrls: ModifierCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}
function renderArtifactModifiers({ fromSelf, keyPrefix, mutable, code, ctrls, getHanlders }: RenderArtifactBuffsArgs) {
  const data = $AppData.getArtifactSet(code);
  if (!data) return [];
  const { buffs = [] } = data;

  return ctrls.map((ctrl, index) => {
    const buff = findByIndex(buffs, ctrl.index);
    if (!buff) return null;

    const description = getArtifactDescription(data, buff);

    return (
      <GiModifierView
        key={`${keyPrefix}-${code}-${ctrl.index}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} ${fromSelf ? "(self)" : ""}`}
        description={description}
        inputs={ctrl.inputs}
        inputConfigs={buff.inputConfigs}
        {...getHanlders?.({ ctrl, ctrlIndex: index, ctrls })}
      />
    );
  });
}

interface ArtifactBuffsViewProps {
  mutable?: boolean;
  setBonuses: ArtifactSetBonus[];
  artBuffCtrls: ModifierCtrl[];
  party: Party;
  getSelfHandlers?: RenderArtifactBuffsArgs["getHanlders"];
  getTeammateHandlers?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}
export function ArtifactBuffsView({
  mutable,
  setBonuses,
  artBuffCtrls,
  party,
  getSelfHandlers,
  getTeammateHandlers,
}: ArtifactBuffsViewProps) {
  const content = [];
  const mainCode = setBonuses[0]?.code;

  if (mainCode) {
    content.push(
      ...renderArtifactModifiers({
        fromSelf: true,
        keyPrefix: "main",
        mutable,
        code: mainCode,
        ctrls: artBuffCtrls,
        getHanlders: getSelfHandlers,
      })
    );
  }

  party.forEach((teammate, teammateIndex) => {
    if (teammate) {
      content.push(
        ...renderArtifactModifiers({
          mutable,
          keyPrefix: teammate.name,
          code: teammate.artifact.code,
          ctrls: teammate.artifact.buffCtrls,
          getHanlders: (args) => getTeammateHandlers?.({ ...args, teammate, teammateIndex }) || {},
        })
      );
    }
  });

  return renderModifiers(content, "buffs", mutable);
}
