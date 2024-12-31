import { CharacterRecord, CharacterBuff, CharacterDebuff, isGrantedEffect } from "@Backend";

import type { ModifierCtrl } from "@Src/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import Array_ from "@Src/utils/array-utils";
import { parseAbilityDescription } from "@Src/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface SelfModsViewProps {
  mutable?: boolean;
  characterRecord: CharacterRecord;
  modCtrls: ModifierCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}

// #TO-DO: improve this and the same

function getSelfModifierElmts(props: SelfModsViewProps, modifiers: Array<CharacterBuff | CharacterDebuff>) {
  const { characterRecord } = props;

  return props.modCtrls.map((ctrl, ctrlIndex, ctrls) => {
    const modifier = Array_.findByIndex(modifiers, ctrl.index);

    if (modifier && isGrantedEffect(modifier, characterRecord.character)) {
      const { inputs = [] } = ctrl;

      return (
        <GenshinModifierView
          key={ctrl.index}
          mutable={props.mutable}
          heading={modifier.src}
          description={parseAbilityDescription(modifier, characterRecord, inputs, true)}
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
  const { characterRecord } = props;
  const { innateBuffs = [], buffs = [] } = characterRecord.appCharacter;
  const modifierElmts: (JSX.Element | null)[] = [];

  innateBuffs.forEach((buff, index) => {
    if (isGrantedEffect(buff, characterRecord.character)) {
      modifierElmts.push(
        <GenshinModifierView
          key={"innate-" + index}
          mutable={false}
          heading={buff.src}
          description={parseAbilityDescription(buff, characterRecord, [], true)}
        />
      );
    }
  });

  modifierElmts.push(...getSelfModifierElmts(props, buffs));

  return renderModifiers(modifierElmts, "buffs", props.mutable);
}

export function SelfDebuffsView(props: SelfModsViewProps) {
  const { debuffs = [] } = props.characterRecord.appCharacter;
  const modifierElmts = getSelfModifierElmts(props, debuffs);

  return renderModifiers(modifierElmts, "debuffs", props.mutable);
}
