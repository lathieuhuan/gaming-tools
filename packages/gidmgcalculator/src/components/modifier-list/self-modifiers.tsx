import { CharacterBuff, CharacterCalc, CharacterDebuff, CharacterReadData } from "@Calculation";

import type { Character, ModifierCtrl } from "@Src/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import Array_ from "@Src/utils/array-utils";
import { parseAbilityDescription } from "@Src/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface SelfModsViewProps {
  mutable?: boolean;
  character: Character;
  characterData: CharacterReadData;
  modCtrls: ModifierCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}

function getSelfModifierElmts(props: SelfModsViewProps, modifiers: Array<CharacterBuff | CharacterDebuff>) {
  //
  return props.modCtrls.map((ctrl, ctrlIndex, ctrls) => {
    const modifier = Array_.findByIndex(modifiers, ctrl.index);

    if (modifier && CharacterCalc.isGrantedEffect(modifier, props.character)) {
      const { inputs = [] } = ctrl;

      return (
        <GenshinModifierView
          key={ctrl.index}
          mutable={props.mutable}
          heading={modifier.src}
          description={parseAbilityDescription(modifier, inputs, true, props.characterData)}
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
  const { characterData } = props;
  const { innateBuffs = [], buffs = [] } = characterData.appCharacter;
  const modifierElmts: (JSX.Element | null)[] = [];

  innateBuffs.forEach((buff, index) => {
    if (CharacterCalc.isGrantedEffect(buff, props.character)) {
      modifierElmts.push(
        <GenshinModifierView
          key={"innate-" + index}
          mutable={false}
          heading={buff.src}
          description={parseAbilityDescription(buff, [], true, characterData)}
        />
      );
    }
  });

  modifierElmts.push(...getSelfModifierElmts(props, buffs));

  return renderModifiers(modifierElmts, "buffs", props.mutable);
}

export function SelfDebuffsView(props: SelfModsViewProps) {
  const { debuffs = [] } = props.characterData.appCharacter;
  const modifierElmts = getSelfModifierElmts(props, debuffs);

  return renderModifiers(modifierElmts, "debuffs", props.mutable);
}
