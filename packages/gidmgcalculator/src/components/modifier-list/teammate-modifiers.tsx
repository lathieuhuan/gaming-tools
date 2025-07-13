import { CharacterBuff, CharacterDebuff, TeamData } from "@Calculation";
import type { Teammate, Teammates } from "@Src/types";
import type { GetTeammateModifierHanldersArgs, ModifierHanlders } from "./modifiers.types";

import Array_ from "@Src/utils/array-utils";
import { parseTeammateAbilityDescription } from "@Src/utils/description-parsers";
import { GenshinModifierView } from "../GenshinModifierView";
import { renderModifiers } from "./modifiers.utils";

interface TeamModsViewProps {
  mutable?: boolean;
  teammates: Teammates;
  teamData: TeamData;
  getHanlders?: (args: GetTeammateModifierHanldersArgs) => ModifierHanlders;
}

function getTeammateModifierElmts(
  props: TeamModsViewProps,
  teammate: Teammate,
  teammateIndex: number,
  type: "buffs" | "debuffs"
) {
  const appTeammate = props.teamData.getAppMember(teammate.name);
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
                description={parseTeammateAbilityDescription(modifier, inputs)}
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

export function TeammateBuffsView(props: TeamModsViewProps) {
  const content = props.teammates.map((teammate, teammateIndex) => {
    return teammate ? getTeammateModifierElmts(props, teammate, teammateIndex, "buffs") : null;
  });
  return renderModifiers(content, "buffs", props.mutable);
}

export function TeammateDebuffsView(props: TeamModsViewProps) {
  const content = props.teammates.map((teammate, teammateIndex) => {
    return teammate ? getTeammateModifierElmts(props, teammate, teammateIndex, "debuffs") : null;
  });
  return renderModifiers(content, "debuffs", props.mutable);
}
