import { CharacterBuff, CharacterDebuff, CharacterReadData } from "@Backend";

import type { Party, Teammate } from "@Src/types";
import type { GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";
import Array_ from "@Src/utils/array-utils";
import { parseAbilityDescription } from "@Src/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface PartyModsViewProps {
  mutable?: boolean;
  party: Party;
  characterData: CharacterReadData;
  getHanlders?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}

function getTeammateModifierElmts(
  props: PartyModsViewProps,
  teammate: Teammate,
  teammateIndex: number,
  type: "buffs" | "debuffs"
) {
  const appTeammate = props.characterData.getAppCharacter(teammate.name);
  const modCtrls = type === "buffs" ? teammate?.buffCtrls : teammate?.debuffCtrls;
  const modifiers = type === "buffs" ? appTeammate?.buffs : appTeammate?.debuffs;

  if (!modCtrls?.length || !modifiers?.some((modifier) => modifier.affect !== "SELF")) {
    return null;
  }

  return (
    <div key={teammate.name}>
      <p className={`text-lg text-${appTeammate.vision} font-bold text-center uppercase`}>{teammate.name}</p>
      <div className="space-y-3">
        {modCtrls.map((ctrl, ctrlIndex, ctrls) => {
          const modifier = Array_.findByIndex<CharacterBuff | CharacterDebuff>(modifiers, ctrl.index);

          if (modifier) {
            const { inputs = [] } = ctrl;

            return (
              <GenshinModifierView
                key={`${teammate.name}-${ctrl.index}`}
                mutable={props.mutable}
                heading={modifier.src}
                description={parseAbilityDescription(modifier, inputs, false)}
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
        })}
      </div>
    </div>
  );
}

export function PartyBuffsView(props: PartyModsViewProps) {
  const content = props.party.map((teammate, teammateIndex) => {
    return teammate ? getTeammateModifierElmts(props, teammate, teammateIndex, "buffs") : null;
  });
  return renderModifiers(content, "buffs", props.mutable);
}

export function PartyDebuffsView(props: PartyModsViewProps) {
  const content = props.party.map((teammate, teammateIndex) => {
    return teammate ? getTeammateModifierElmts(props, teammate, teammateIndex, "debuffs") : null;
  });
  return renderModifiers(content, "debuffs", props.mutable);
}
