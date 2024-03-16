import type { ArtifactSetBonus, ModifierCtrl, Party } from "@Src/types";
import { ModifierTemplate, type ModifierTemplateProps } from "../ModifierTemplate";
import { $AppData } from "@Src/services";
import { findByIndex, getArtifactDescription } from "@Src/utils";
import { renderModifiers } from "./modifiers.utils";

interface RenderArtifactBuffsArgs {
  fromSelf?: boolean;
  keyPrefix: string | number;
  mutable?: boolean;
  code: number;
  ctrls: ModifierCtrl[];
  getHanlders?: (
    ctrl: ModifierCtrl,
    ctrlIndex: number
  ) => Pick<ModifierTemplateProps, "onToggle" | "onToggleCheck" | "onChangeText" | "onSelectOption">;
}
const renderArtifactModifiers = ({
  fromSelf,
  keyPrefix,
  mutable,
  code,
  ctrls,
  getHanlders,
}: RenderArtifactBuffsArgs) => {
  const data = $AppData.getArtifactSet(code);
  if (!data) return [];
  const { buffs = [] } = data;

  return ctrls.map((ctrl, index) => {
    const buff = findByIndex(buffs, ctrl.index);
    if (!buff) return null;

    const description = getArtifactDescription(data, buff);

    return (
      <ModifierTemplate
        key={`${keyPrefix}-${code}-${ctrl.index}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} ${fromSelf ? "(self)" : ""}`}
        description={description}
        inputs={ctrl.inputs}
        inputConfigs={buff.inputConfigs}
        {...getHanlders?.(ctrl, index)}
      />
    );
  });
};

interface ArtifactBuffsViewProps {
  setBonuses: ArtifactSetBonus[];
  artBuffCtrls: ModifierCtrl[];
  party: Party;
}
export function ArtifactBuffsView({ setBonuses, artBuffCtrls, party }: ArtifactBuffsViewProps) {
  const content = [];
  const mainCode = setBonuses[0]?.code;

  if (mainCode) {
    content.push(
      ...renderArtifactModifiers({
        fromSelf: true,
        keyPrefix: "main",
        mutable: false,
        code: mainCode,
        ctrls: artBuffCtrls,
      })
    );
  }

  party.forEach((teammate) => {
    if (teammate) {
      content.push(
        ...renderArtifactModifiers({
          mutable: false,
          keyPrefix: teammate.name,
          code: teammate.artifact.code,
          ctrls: teammate.artifact.buffCtrls,
        })
      );
    }
  });

  return renderModifiers(content, "buffs", false);
}
