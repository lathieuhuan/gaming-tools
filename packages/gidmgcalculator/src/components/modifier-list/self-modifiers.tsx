import { AppCharacter, CharacterBuff, CharacterDebuff, EntityCalc } from "@Backend";

import type { Character, ModifierCtrl, PartyData } from "@Src/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import { findByIndex, parseAbilityDescription } from "@Src/utils";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface SelfModsViewProps {
  mutable?: boolean;
  char: Character;
  appChar: AppCharacter;
  partyData: PartyData;
  modCtrls: ModifierCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}

function getSelfModifierElmts(props: SelfModsViewProps, modifiers: Array<CharacterBuff | CharacterDebuff>) {
  return props.modCtrls.map((ctrl, ctrlIndex, ctrls) => {
    const modifier = findByIndex(modifiers, ctrl.index);

    if (modifier && EntityCalc.isGrantedEffect(modifier, props.char)) {
      const { inputs = [] } = ctrl;

      return (
        <GenshinModifierView
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
    if (EntityCalc.isGrantedEffect(buff, props.char)) {
      modifierElmts.push(
        <GenshinModifierView
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
