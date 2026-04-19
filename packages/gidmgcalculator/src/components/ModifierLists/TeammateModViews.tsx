import type { Teammate, Team } from "@/models";
import type { AbilityBuffCtrl, AbilityDebuffCtrl, ModifierCtrlState } from "@/types";
import type { ModifierHanlders } from "./types";

import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type TeamModsViewProps = {
  mutable?: boolean;
  teammates: Teammate[];
  team: Team;
  getHanlders?: (teammate: Teammate, ctrl: ModifierCtrlState) => ModifierHanlders;
};

function getTeammateModifierElmts<TModCtrl extends AbilityBuffCtrl | AbilityDebuffCtrl>(
  props: TeamModsViewProps,
  teammate: Teammate,
  modCtrls: TModCtrl[],
  renderDesc: (ctrl: TModCtrl) => string
) {
  const { vision } = teammate.data;
  const availableCtrls = modCtrls.filter(
    (ctrl) => props.team.isAvailableEffect(ctrl.data) && teammate.canPerformEffect(ctrl.data)
  );

  if (!availableCtrls.length) {
    return null;
  }

  return (
    <div key={teammate.code}>
      <p className={`text-lg text-${vision} font-bold text-center uppercase`}>
        {teammate.data.name}
      </p>
      <div className="space-y-3 peer">
        {availableCtrls.map((ctrl) => {
          const { data } = ctrl;

          return (
            <GenshinModifierView
              key={`${teammate.code}-${ctrl.id}`}
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
