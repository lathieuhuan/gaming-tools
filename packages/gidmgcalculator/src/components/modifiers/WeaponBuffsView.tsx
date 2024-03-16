import type { AppWeapon, CalcWeapon, ModifierCtrl, Party, Weapon, WeaponBuff } from "@Src/types";
import { $AppData } from "@Src/services";
import { ModifierTemplate, type ModifierTemplateProps } from "../ModifierTemplate";
import { findByIndex, parseWeaponDescription } from "@Src/utils";
import { renderModifiers } from "./modifiers.utils";

const getWeaponDescription = (descriptions: AppWeapon["descriptions"], buff: WeaponBuff, refi: number) => {
  if (descriptions?.length) {
    let { description = 0 } = buff;
    description = typeof description === "number" ? descriptions[description] : description;
    return parseWeaponDescription(description || "", refi);
  }
  return "";
};

interface RenderWeaponModifiersArgs {
  fromSelf?: boolean;
  keyPrefix: string | number;
  mutable?: boolean;
  weapon: Pick<Weapon, "code" | "type" | "refi">;
  ctrls: ModifierCtrl[];
  getHanlders?: (
    ctrl: ModifierCtrl,
    ctrlIndex: number
  ) => Pick<ModifierTemplateProps, "onToggle" | "onChangeText" | "onSelectOption" | "onToggleCheck">;
}
const renderWeaponModifiers = ({
  fromSelf,
  keyPrefix,
  mutable,
  weapon,
  ctrls,
  getHanlders,
}: RenderWeaponModifiersArgs) => {
  const data = $AppData.getWeapon(weapon.code);
  if (!data) return [];
  const { buffs = [], descriptions = [] } = data;

  return ctrls.map((ctrl, index) => {
    const buff = findByIndex(buffs, ctrl.index);

    return buff ? (
      <ModifierTemplate
        key={`${keyPrefix}-${data.code}-${ctrl.index}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} R${weapon.refi} ${fromSelf ? "(self)" : ""}`}
        description={getWeaponDescription(descriptions, buff, weapon.refi)}
        inputs={ctrl.inputs}
        inputConfigs={buff.inputConfigs}
        {...getHanlders?.(ctrl, index)}
      />
    ) : null;
  });
};

interface WeaponBuffsViewProps {
  weapon: CalcWeapon;
  wpBuffCtrls: ModifierCtrl[];
  party: Party;
}
export function WeaponBuffsView({ weapon, wpBuffCtrls, party }: WeaponBuffsViewProps) {
  const content = [];

  content.push(
    ...renderWeaponModifiers({
      fromSelf: true,
      keyPrefix: "main",
      mutable: false,
      weapon,
      ctrls: wpBuffCtrls,
    })
  );

  party.forEach((teammate) => {
    if (teammate) {
      content.push(
        ...renderWeaponModifiers({
          keyPrefix: teammate.name,
          fromSelf: false,
          weapon: teammate.weapon,
          ctrls: teammate.weapon.buffCtrls,
        })
      );
    }
  });

  return renderModifiers(content, "buffs", false);
}
