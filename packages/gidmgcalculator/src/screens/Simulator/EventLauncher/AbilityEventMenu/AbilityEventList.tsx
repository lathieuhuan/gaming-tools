import type { TargetCalc } from "@/models";
import type { Member } from "@/models/Member";
import type { AttackPattern } from "@/types";

import { talentCalc } from "../../logic/talentCalc";
import { AbilityEventItem } from "./AbilityEventItem";

type AbilityEventListProps = {
  className?: string;
  member: Member;
  target: TargetCalc;
  attPatt: AttackPattern;
  activeNames?: string[];
  onClickHeading?: (name: string) => void;
};

export function AbilityEventList({
  className,
  member,
  target,
  attPatt,
  activeNames = [],
  onClickHeading,
}: AbilityEventListProps) {
  const calcList = member.data.calcList[attPatt];
  const calculator = talentCalc(member, target, attPatt);

  return (
    <div className={className}>
      {calcList.map((item, index) => {
        const active = activeNames.includes(item.name);

        return (
          <AbilityEventItem
            key={item.name}
            performer={member}
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
