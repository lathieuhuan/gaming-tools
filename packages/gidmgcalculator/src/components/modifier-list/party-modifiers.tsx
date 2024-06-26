import { AppCharacter, CharacterBuff, CharacterDebuff } from "@Backend";

import type { Character, ModifierCtrl, Party, PartyData, Teammate } from "@Src/types";
import type { GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";
import { $AppCharacter } from "@Src/services";
import { Setup_, findByIndex, parseAbilityDescription } from "@Src/utils";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

function getTeammateModifierElmts(
  props: Omit<PartyModsViewProps, "party">,
  teammate: Teammate,
  teammateIndex: number,
  teammateData: AppCharacter,
  modCtrls: ModifierCtrl[],
  modifiers: Array<CharacterBuff | CharacterDebuff>
) {
  return modCtrls.map((ctrl, ctrlIndex, ctrls) => {
    const modifier = findByIndex(modifiers, ctrl.index);

    if (modifier) {
      const { inputs = [] } = ctrl;

      return (
        <GenshinModifierView
          key={`${teammate.name}-${ctrl.index}`}
          mutable={props.mutable}
          heading={modifier.src}
          description={parseAbilityDescription(
            modifier,
            { char: props.char, appChar: teammateData, partyData: props.partyData },
            inputs,
            false
          )}
          checked={ctrl.activated}
          inputs={inputs}
          inputConfigs={modifier.inputConfigs}
          {...props.getHanlders?.({
            ctrl,
            ctrlIndex,
            ctrls,
            teammate,
            teammateIndex,
          })}
        />
      );
    }
    return null;
  });
}

interface PartyModsViewProps {
  mutable?: boolean;
  char: Character;
  party: Party;
  partyData: PartyData;
  getHanlders?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}

function getPartyModifierElmts(props: PartyModsViewProps, type: "buffs" | "debuffs") {
  return Setup_.teammatesOf(props.party).map((teammate, teammateIndex) => {
    const teammateData = $AppCharacter.get(teammate.name);
    const modCtrls = type === "buffs" ? teammate?.buffCtrls : teammate?.debuffCtrls;
    const modifiers = type === "buffs" ? teammateData?.buffs : teammateData?.debuffs;

    if (!modCtrls?.length || !modifiers?.some((modifier) => modifier.affect !== "SELF")) {
      return null;
    }

    return (
      <div key={teammateData.name}>
        <p className={`text-lg text-${teammateData.vision} font-bold text-center uppercase`}>{teammate.name}</p>
        <div className="space-y-3">
          {getTeammateModifierElmts(props, teammate, teammateIndex, teammateData, modCtrls, modifiers)}
        </div>
      </div>
    );
  });
}

export function PartyBuffsView(props: PartyModsViewProps) {
  const content = getPartyModifierElmts(props, "buffs");
  return renderModifiers(content, "buffs", props.mutable);
}

export function PartyDebuffsView(props: PartyModsViewProps) {
  const content = getPartyModifierElmts(props, "debuffs");
  return renderModifiers(content, "debuffs", props.mutable);
}
