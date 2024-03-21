import type { AppCharacter, Character, ModInputConfig, ModifierCtrl, Modifier_Character, PartyData } from "@Src/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { CharacterCal } from "@Src/calculation";
import { ParsedAbilityEffect, findByIndex, parseAbilityDescription } from "@Src/utils";
import { GiModifierView } from "../GiModifierView";
import { renderModifiers } from "./modifiers.utils";

interface SelfModsViewProps {
  mutable?: boolean;
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  modCtrls: ModifierCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}

type Modifier = Modifier_Character & {
  inputConfigs?: ModInputConfig[];
  effects?: ParsedAbilityEffect | ParsedAbilityEffect[];
};

function getSelfModifierElmts(props: SelfModsViewProps, modifiers: Modifier[]) {
  return props.modCtrls.map((ctrl, ctrlIndex, ctrls) => {
    const modifier = findByIndex(modifiers, ctrl.index);

    if (modifier && CharacterCal.isGranted(modifier, props.char)) {
      const { inputs = [] } = ctrl;

      return (
        <GiModifierView
          key={ctrl.index}
          mutable={props.mutable}
          heading={modifier.src}
          description={parseAbilityDescription(modifier, props, inputs, true)}
          checked={ctrl.activated}
          inputs={inputs}
          inputConfigs={modifier.inputConfigs?.filter((config) => config.for !== "FOR_TEAM")}
          {...props.getHanlders?.({ ctrl, ctrlIndex, ctrls })}
        />
      );
    }
    return null;
  });
}

export function SelfBuffsView(props: SelfModsViewProps) {
  const { innateBuffs = [], buffs = [] } = props.appChar;
  const modifierElmts: (JSX.Element | null)[] = [];

  innateBuffs.forEach((buff, index) => {
    if (CharacterCal.isGranted(buff, props.char)) {
      modifierElmts.push(
        <GiModifierView
          key={"innate-" + index}
          mutable={false}
          heading={buff.src}
          description={parseAbilityDescription(buff, props, [], true)}
        />
      );
    }
  });

  modifierElmts.push(...getSelfModifierElmts(props, buffs));

  return renderModifiers(modifierElmts, "buffs", props.mutable);
}

export function SelfDebuffsView(props: SelfModsViewProps) {
  const { debuffs = [] } = props.appChar;
  const modifierElmts = getSelfModifierElmts(props, debuffs);

  return renderModifiers(modifierElmts, "debuffs", props.mutable);
}
