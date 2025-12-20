import type { CalcTeammate } from "@/models/calculator";
import type { IAbilityBuffCtrl, IAbilityDebuffCtrl, IModifierCtrlBasic, ITeam } from "@/types";
import type { ModifierHanlders } from "./types";

import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type TeamModsViewProps = {
  mutable?: boolean;
  teammates: CalcTeammate[];
  team: ITeam;
  getHanlders?: (teammate: CalcTeammate, ctrl: IModifierCtrlBasic) => ModifierHanlders;
};

function getTeammateModifierElmts<TModCtrl extends IAbilityBuffCtrl | IAbilityDebuffCtrl>(
  props: TeamModsViewProps,
  teammate: CalcTeammate,
  modCtrls: TModCtrl[],
  renderDesc: (ctrl: TModCtrl) => string
) {
  const { vision } = teammate.data;
  const availableCtrls = modCtrls.filter(
    (ctrl) => props.team.isAvailableEffect(ctrl.data) && teammate.isPerformableEffect(ctrl.data)
  );

  if (!availableCtrls.length) {
    return null;
  }

  return (
    <div key={teammate.name}>
      <p className={`text-lg text-${vision} font-bold text-center uppercase`}>{teammate.name}</p>
      <div className="space-y-3 peer">
        {availableCtrls.map((ctrl) => {
          const { data } = ctrl;

          return (
            <GenshinModifierView
              key={`${teammate.name}-${ctrl.id}`}
              mutable={props.mutable}
              heading={data.src}
              description={renderDesc(ctrl)}
              checked={ctrl.activated}
              inputs={ctrl.inputs}
              inputConfigs={data.inputConfigs}
              {...props.getHanlders?.(teammate, ctrl)}
            />
          );
        })}
      </div>
    </div>
  );
}

export function TeammateBuffsView(props: TeamModsViewProps) {
  return (
    <ModifierContainer type="buffs" mutable={props.mutable}>
      {props.teammates.map((teammate) => {
        return getTeammateModifierElmts(props, teammate, teammate.buffCtrls, (ctrl) =>
          teammate.parseBuffDesc(ctrl)
        );
      })}
    </ModifierContainer>
  );
}

export function TeammateDebuffsView(props: TeamModsViewProps) {
  return (
    <ModifierContainer type="debuffs" mutable={props.mutable}>
      {props.teammates.map((teammate) => {
        return getTeammateModifierElmts(props, teammate, teammate.debuffCtrls, (ctrl) =>
          teammate.parseDebuffDesc(ctrl)
        );
      })}
    </ModifierContainer>
  );
}
