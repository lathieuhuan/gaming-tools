import type { MemberOps, Team } from "@/logic/calculator";
import type { Character } from "@/models";
import type { AbilityBuffCtrl, AbilityDebuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type SelfModsViewProps<T extends AbilityBuffCtrl | AbilityDebuffCtrl> = {
  mutable?: boolean;
  character: Character;
  team: Team;
  modCtrls: T[];
  getHanlders?: (ctrl: T) => ModifierHanlders;
};

function getSelfModifierElmts<T extends AbilityBuffCtrl | AbilityDebuffCtrl>(
  props: Pick<SelfModsViewProps<T>, "mutable" | "modCtrls" | "getHanlders">,
  ops: MemberOps,
  type: "buff" | "debuff",
) {
  return props.modCtrls.map((ctrl) => {
    const modifier = ctrl.data;

    if (ops.canPerformEffect(modifier)) {
      let description = "";

      switch (type) {
        case "buff":
          description = ops.bonusCalc({ inputs: ctrl.inputs }).parseAbilityDesc(ctrl.data);
          break;
        case "debuff":
          description = ops.penaltyCalc(ctrl.inputs).parseAbilityDesc(ctrl.data);
          break;
      }

      return (
        <GenshinModifierView
          key={ctrl.id}
          mutable={props.mutable}
          heading={modifier.src}
          description={description}
          checked={ctrl.activated}
          inputs={ctrl.inputs}
          inputConfigs={modifier.inputConfigs?.filter((config) => config.for !== "FOR_TEAM")}
          {...props.getHanlders?.(ctrl)}
        />
      );
    }

    return null;
  });
}

export function SelfBuffsView(props: SelfModsViewProps<AbilityBuffCtrl>) {
  const { character, team } = props;
  const { innateBuffs = [] } = character.data;

  const mainOps = team.member(character);

  return (
    <ModifierContainer type="buffs" mutable={props.mutable}>
      {innateBuffs.map((buff, index) => {
        if (mainOps.canPerformEffect(buff)) {
          return (
            <GenshinModifierView
              key={"innate-" + index}
              mutable={false}
              heading={buff.src}
              description={mainOps.bonusCalc().parseAbilityDesc(buff)}
            />
          );
        }

        return null;
      })}
      {getSelfModifierElmts(props, mainOps, "buff")}
    </ModifierContainer>
  );
}

export function SelfDebuffsView(props: SelfModsViewProps<AbilityDebuffCtrl>) {
  const mainOps = props.team.member(props.character);

  return (
    <ModifierContainer type="debuffs" mutable={props.mutable}>
      {getSelfModifierElmts(props, mainOps, "debuff")}
    </ModifierContainer>
  );
}
