import { CalcTeamData, CharacterBuff, CharacterCalc, CharacterDebuff } from "@Calculation";

import type { Character, ModifierCtrl } from "@/types";
import type { GetModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import Array_ from "@/utils/Array";
import { parseSelfAbilityDesc } from "@/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface SelfModsViewProps {
  mutable?: boolean;
  character: Character;
  teamData: CalcTeamData;
  modCtrls: ModifierCtrl[];
  getHanlders?: (args: GetModifierHanldersArgs) => ModifierHanlders;
}

function getSelfModifierElmts(props: SelfModsViewProps, modifiers: Array<CharacterBuff | CharacterDebuff>) {
  //
  return props.modCtrls.map((ctrl, ctrlIndex, ctrls) => {
    const modifier = Array_.findByIndex(modifiers, ctrl.index);

    if (modifier && CharacterCalc.isGrantedMod(modifier, props.teamData)) {
      const { inputs = [] } = ctrl;

      return (
        <GenshinModifierView
          key={ctrl.index}
          mutable={props.mutable}
          heading={modifier.src}
          description={parseSelfAbilityDesc(modifier, inputs, props.teamData)}
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
  const { teamData } = props;
  const { innateBuffs = [], buffs = [] } = teamData.activeAppMember;
  const modifierElmts: (JSX.Element | null)[] = [];

  innateBuffs.forEach((buff, index) => {
    if (CharacterCalc.isGrantedMod(buff, teamData)) {
      modifierElmts.push(
        <GenshinModifierView
          key={"innate-" + index}
          mutable={false}
          heading={buff.src}
          description={parseSelfAbilityDesc(buff, [], teamData)}
        />
      );
    }
  });

  modifierElmts.push(...getSelfModifierElmts(props, buffs));

  return renderModifiers(modifierElmts, "buffs", props.mutable);
}

export function SelfDebuffsView(props: SelfModsViewProps) {
  const { debuffs = [] } = props.teamData.activeAppMember;
  const modifierElmts = getSelfModifierElmts(props, debuffs);

  return renderModifiers(modifierElmts, "debuffs", props.mutable);
}
