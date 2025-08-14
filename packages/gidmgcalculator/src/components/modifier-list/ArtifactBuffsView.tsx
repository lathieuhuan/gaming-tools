import { ArtifactSetBonus } from "@Calculation";

import type { ArtifactModCtrl, ModifierCtrl, Teammates } from "@Src/types";
import type { GetModifierHanldersArgs, GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { $AppArtifact } from "@Src/services";
import { getArtifactDesc } from "@Src/utils/description-parsers";
import Array_ from "@Src/utils/array-utils";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface RenderArtifactBuffsArgs<T extends ModifierCtrl = ModifierCtrl> {
  mutable?: boolean;
  fromSelf?: boolean;
  keyPrefix: string | number;
  code: number;
  bonusLv?: number;
  ctrls: T[];
  getHanlders?: (args: GetModifierHanldersArgs<T>) => ModifierHanlders;
}
function renderArtifactModifiers<T extends ModifierCtrl = ModifierCtrl>({
  fromSelf,
  keyPrefix,
  mutable,
  code,
  ctrls,
  getHanlders,
}: RenderArtifactBuffsArgs<T>) {
  const data = $AppArtifact.getSet(code);
  if (!data) return [];

  return ctrls.map((ctrl, index) => {
    const buff = Array_.findByIndex(data.buffs, ctrl.index);
    if (!buff) return null;

    const description = getArtifactDesc(data, buff);

    return (
      <GenshinModifierView
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
  artBuffCtrls: ArtifactModCtrl[];
  teammates: Teammates;
  getSelfHandlers?: RenderArtifactBuffsArgs<ArtifactModCtrl>["getHanlders"];
  getTeammateHandlers?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}
export function ArtifactBuffsView({
  mutable,
  setBonuses,
  artBuffCtrls,
  teammates,
  getSelfHandlers,
  getTeammateHandlers,
}: ArtifactBuffsViewProps) {
  const content = [];

  for (const setBonus of setBonuses) {
    const ctrls = artBuffCtrls.filter((ctrl) => ctrl.code === setBonus.code);

    content.push(
      ...renderArtifactModifiers({
        fromSelf: true,
        keyPrefix: "main",
        mutable,
        code: setBonus.code,
        bonusLv: setBonus.bonusLv,
        ctrls,
        getHanlders: getSelfHandlers,
      })
    );
  }

  teammates.forEach((teammate, teammateIndex) => {
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
