import { AppWeapon, WeaponBuff } from "@Backend";

import type { CalcWeapon, ModifierCtrl, Party, Weapon } from "@Src/types";
import type { GetModifierHanldersArgs, GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { $AppData } from "@Src/services";
import { findByIndex, parseWeaponDescription } from "@Src/utils";
import { GenshinModifierView } from "../GenshinModifierView";
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
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}
function renderWeaponModifiers({
  fromSelf,
  keyPrefix,
  mutable,
  weapon,
  ctrls,
  getHanlders,
}: RenderWeaponModifiersArgs) {
  const data = $AppData.getWeapon(weapon.code);
  if (!data) return [];
  const { buffs = [], descriptions = [] } = data;

  return ctrls.map((ctrl, ctrlIndex) => {
    const buff = findByIndex(buffs, ctrl.index);

    return buff ? (
      <GenshinModifierView
        key={`${keyPrefix}-${data.code}-${ctrl.index}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} R${weapon.refi} ${fromSelf ? "(self)" : ""}`}
        description={getWeaponDescription(descriptions, buff, weapon.refi)}
        inputs={ctrl.inputs}
        inputConfigs={buff.inputConfigs}
        {...getHanlders?.({ ctrl, ctrlIndex, ctrls })}
      />
    ) : null;
  });
}

interface WeaponBuffsViewProps {
  mutable?: boolean;
  weapon: CalcWeapon;
  wpBuffCtrls: ModifierCtrl[];
  party: Party;
  getSelfHandlers?: RenderWeaponModifiersArgs["getHanlders"];
  getTeammateHandlers?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}
export function WeaponBuffsView({
  mutable,
  weapon,
  wpBuffCtrls,
  party,
  getSelfHandlers,
  getTeammateHandlers,
}: WeaponBuffsViewProps) {
  const content = [];

  content.push(
    ...renderWeaponModifiers({
      mutable,
      fromSelf: true,
      keyPrefix: "main",
      weapon,
      ctrls: wpBuffCtrls,
      getHanlders: getSelfHandlers,
    })
  );

  party.forEach((teammate, teammateIndex) => {
    if (teammate) {
      content.push(
        ...renderWeaponModifiers({
          mutable,
          fromSelf: false,
          keyPrefix: teammate.name,
          weapon: teammate.weapon,
          ctrls: teammate.weapon.buffCtrls,
          getHanlders: (args) => getTeammateHandlers?.({ ...args, teammate, teammateIndex }) || {},
        })
      );
    }
  });

  return renderModifiers(content, "buffs", mutable);
}
