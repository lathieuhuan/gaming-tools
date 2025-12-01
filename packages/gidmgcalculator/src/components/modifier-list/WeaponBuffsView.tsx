import type { Weapon } from "@/models/base";
import type { CalcTeammate } from "@/models/calculator";
import type { IWeapon, IWeaponBuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { getWeaponBuffDesc } from "@/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type RenderWeaponModifiersArgs = {
  keyPrefix: string | number;
  headingSuffix?: string;
  mutable?: boolean;
  weapon: Pick<IWeapon, "code" | "type" | "refi" | "data">;
  ctrls: IWeaponBuffCtrl[];
  getHanlders?: (ctrl: IWeaponBuffCtrl, ctrls: IWeaponBuffCtrl[]) => ModifierHanlders;
};

function renderWeaponModifiers({
  keyPrefix,
  headingSuffix,
  mutable,
  weapon,
  ctrls,
  getHanlders,
}: RenderWeaponModifiersArgs) {
  const { data } = weapon;

  return ctrls.map((ctrl) => {
    const buff = ctrl.data;

    return (
      <GenshinModifierView
        key={`${keyPrefix}-${weapon.code}-${ctrl.id}`}
        mutable={mutable}
        checked={ctrl.activated}
        heading={`${data.name} R${weapon.refi} / ${headingSuffix}`}
        description={getWeaponBuffDesc(data.descriptions, buff, weapon.refi)}
        inputs={ctrl.inputs}
        inputConfigs={buff.inputConfigs}
        {...getHanlders?.(ctrl, ctrls)}
      />
    );
  });
}

type WeaponBuffsViewProps = {
  mutable?: boolean;
  weapon: Weapon;
  wpBuffCtrls: IWeaponBuffCtrl[];
  teammates: CalcTeammate[];
  getSelfHandlers?: RenderWeaponModifiersArgs["getHanlders"];
  getTeammateHandlers?: (teammate: CalcTeammate, ctrl: IWeaponBuffCtrl) => ModifierHanlders;
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
        weapon,
        ctrls: wpBuffCtrls,
        getHanlders: getSelfHandlers,
      })}

      {teammates
        .map((teammate) => {
          return renderWeaponModifiers({
            mutable,
            keyPrefix: teammate.name,
            headingSuffix: teammate.name,
            weapon: teammate.weapon,
            ctrls: teammate.weapon.buffCtrls,
            getHanlders: (ctrl) => getTeammateHandlers?.(teammate, ctrl) || {},
          });
        })
        .flat()}
    </ModifierContainer>
  );
}
