import type { CalcCharacter } from "@/models/base";
import type { IAbilityBuffCtrl, IAbilityDebuffCtrl } from "@/types";
import type { ModifierHanlders } from "./types";

import { GenshinModifierView } from "../GenshinModifierView";
import { ModifierContainer } from "./ModifierContainer";

type SelfModsViewProps<T extends IAbilityBuffCtrl | IAbilityDebuffCtrl> = {
  mutable?: boolean;
  character: CalcCharacter;
  modCtrls: T[];
  getHanlders?: (ctrl: T) => ModifierHanlders;
};

type RenderDescFn<T> = (ctrl: T) => string;

function getSelfModifierElmts<T extends IAbilityBuffCtrl | IAbilityDebuffCtrl>(
  props: SelfModsViewProps<T>,
  renderDesc: RenderDescFn<T>
) {
  //
  return props.modCtrls.map((ctrl) => {
    const modifier = ctrl.data;

    if (props.character.isPerformableEffect(modifier)) {
      return (
        <GenshinModifierView
          key={ctrl.id}
          mutable={props.mutable}
          heading={modifier.src}
          description={renderDesc(ctrl)}
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

export function SelfBuffsView(props: SelfModsViewProps<IAbilityBuffCtrl>) {
  const { character } = props;
  const { innateBuffs = [] } = character.data;

  const renderDesc: RenderDescFn<IAbilityBuffCtrl> = (ctrl) => {
    return character.parseBuffDesc(ctrl.data, ctrl.inputs);
  };

  return (
    <ModifierContainer type="buffs" mutable={props.mutable}>
      {innateBuffs.map((buff, index) => {
        if (character.isPerformableEffect(buff)) {
          return (
            <GenshinModifierView
              key={"innate-" + index}
              mutable={false}
              heading={buff.src}
              description={character.parseBuffDesc(buff)}
            />
          );
        }

        return null;
      })}
      {getSelfModifierElmts(props, renderDesc)}
    </ModifierContainer>
  );
}

export function SelfDebuffsView(props: SelfModsViewProps<IAbilityDebuffCtrl>) {
  const renderDesc: RenderDescFn<IAbilityDebuffCtrl> = (ctrl) => {
    return props.character.parseDebuffDesc(ctrl.data, ctrl.inputs);
  };

  return (
    <ModifierContainer type="debuffs" mutable={props.mutable}>
      {getSelfModifierElmts(props, renderDesc)}
    </ModifierContainer>
  );
}
