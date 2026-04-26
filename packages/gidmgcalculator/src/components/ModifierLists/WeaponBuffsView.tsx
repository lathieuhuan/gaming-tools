import type { Teammate, Weapon } from "@/models";
import type { TeammateWeapon, WeaponBuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getWeaponBuffDesc } from "@/utils/descriptionParsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type RenderWeaponModifiersArgs = {
  keyPrefix: string | number;
  headingSuffix?: string;
  mutable?: boolean;
  forSelf?: boolean;
  weapon: Weapon | TeammateWeapon;
  ctrls: WeaponBuffCtrl[];
  getHanlders?: (ctrl: WeaponBuffCtrl, ctrls: WeaponBuffCtrl[]) => ModifierHanlders;
};

function renderWeaponModifiers({
  keyPrefix,
  headingSuffix,
  mutable,
  forSelf,
  weapon,
  ctrls,
  getHanlders,
}: RenderWeaponModifiersArgs) {
  const { data } = weapon;

  return ctrls.map((ctrl) => {
    const buff = ctrl.data;
    const undesiredFor = forSelf ? "FOR_TEAM" : "FOR_SELF";

    const inputConfigs = buff.inputConfigs?.filter((config) => config.for !== undesiredFor);

    return (
      <GenshinModifierView
        key={`${keyPrefix}-${weapon.code}-${ctrl.id}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} R${weapon.refi} / ${headingSuffix}`}
        description={getWeaponBuffDesc(data.descriptions, buff, weapon.refi)}
        inputs={ctrl.inputs}
        inputConfigs={inputConfigs}
        {...getHanlders?.(ctrl, ctrls)}
      />
    );
  });
}

type WeaponBuffsViewProps = {
  mutable?: boolean;
  weapon: Weapon;
  wpBuffCtrls: WeaponBuffCtrl[];
  teammates: Teammate[];
  getSelfHandlers?: RenderWeaponModifiersArgs["getHanlders"];
  getTeammateHandlers?: (teammate: Teammate, ctrl: WeaponBuffCtrl) => ModifierHanlders;
};

export function WeaponBuffsView({
  mutable,
  weapon,
  wpBuffCtrls,
  teammates,
  getSelfHandlers,
  getTeammateHandlers,
}: WeaponBuffsViewProps) {
  return (
    <ModifierContainer type="buffs" mutable={mutable}>
      {renderWeaponModifiers({
        mutable,
        keyPrefix: "main",
        headingSuffix: "self",
        forSelf: true,
        weapon,
        ctrls: wpBuffCtrls,
        getHanlders: getSelfHandlers,
      })}

      {teammates
        .map((teammate) => {
          return renderWeaponModifiers({
            mutable,
            keyPrefix: teammate.code,
            headingSuffix: teammate.data.name,
            weapon: teammate.weapon,
            ctrls: teammate.weapon.buffCtrls,
            getHanlders: (ctrl) => getTeammateHandlers?.(teammate, ctrl) || {},
          });
        })
        .flat()}
    </ModifierContainer>
  );
}
