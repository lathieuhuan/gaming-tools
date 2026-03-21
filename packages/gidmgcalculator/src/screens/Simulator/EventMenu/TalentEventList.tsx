import type { CharacterCalc } from "@/models";
import type { AttackPattern, TalentCalcItem } from "@/types";

import { talentCalc } from "../logic/talentCalc";
import { TalentEventItem } from "./TalentEventItem";
import { TargetCalc } from "@/models/TargetCalc";

type TalentEventListProps = {
  className?: string;
  character: CharacterCalc;
  target: TargetCalc;
  attPatt: AttackPattern;
  activeNames?: string[];
  onClickHeading?: (name: string) => void;
};

export function TalentEventList({
  className,
  character,
  target,
  attPatt,
  activeNames = [],
  onClickHeading,
}: TalentEventListProps) {
  const calcList = character.data.calcList[attPatt];
  const calculator = talentCalc(character, target, attPatt);

  return (
    <div className={className}>
      {calcList.map((item, index) => {
        const active = activeNames.includes(item.name);

        return (
          <TalentEventItem
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
