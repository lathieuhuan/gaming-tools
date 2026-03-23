import type { CharacterCalc } from "@/models";
import type { TargetCalc } from "@/models/TargetCalc";
import type { AttackPattern } from "@/types";

import { talentCalc } from "../../logic/talentCalc";
import { AbilityEventItem } from "./AbilityEventItem";

type AbilityEventListProps = {
  className?: string;
  character: CharacterCalc;
  target: TargetCalc;
  attPatt: AttackPattern;
  activeNames?: string[];
  onClickHeading?: (name: string) => void;
};

export function AbilityEventList({
  className,
  character,
  target,
  attPatt,
  activeNames = [],
  onClickHeading,
}: AbilityEventListProps) {
  const calcList = character.data.calcList[attPatt];
  const calculator = talentCalc(character, target, attPatt);

  return (
    <div className={className}>
      {calcList.map((item, index) => {
        const active = activeNames.includes(item.name);

        return (
          <AbilityEventItem
            key={item.name}
            performer={character}
            item={item}
            active={active}
            calculator={calculator}
            onClickHeading={onClickHeading}
            // Temporary
            index={index}
          />
        );
      })}
    </div>
  );
}
