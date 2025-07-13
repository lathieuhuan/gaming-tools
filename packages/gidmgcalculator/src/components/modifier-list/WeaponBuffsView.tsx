import type { CalcWeapon, ModifierCtrl, Teammates, Weapon } from "@Src/types";
import type { GetModifierHanldersArgs, GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { $AppWeapon } from "@Src/services";
import Array_ from "@Src/utils/array-utils";
import { getWeaponBuffDescription } from "@Src/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

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
  const data = $AppWeapon.get(weapon.code);
  if (!data) return [];
  const { descriptions = [] } = data;

  return ctrls.map((ctrl, ctrlIndex) => {
    const buff = Array_.findByIndex(data.buffs, ctrl.index);

    return buff ? (
      <GenshinModifierView
        key={`${keyPrefix}-${data.code}-${ctrl.index}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} R${weapon.refi} ${fromSelf ? "(self)" : ""}`}
        description={getWeaponBuffDescription(descriptions, buff, weapon.refi)}
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
  teammates: Teammates;
  getSelfHandlers?: RenderWeaponModifiersArgs["getHanlders"];
  getTeammateHandlers?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}
export function WeaponBuffsView({
  mutable,
  weapon,
  wpBuffCtrls,
  teammates,
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

  teammates.forEach((teammate, teammateIndex) => {
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
