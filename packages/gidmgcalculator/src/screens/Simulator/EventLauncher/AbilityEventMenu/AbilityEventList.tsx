import type { TargetCalc } from "@/models";
import type { Member } from "@/screens/Simulator/models/Member";
import type { AttackPattern } from "@/types";

import { talentCalc } from "../../logic/talentCalc";
import { AttackEventItem } from "./AttackEventItem";

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
        const { type = "attack" } = item;
        const active = activeNames.includes(item.name);

        switch (type) {
          case "attack":
            return (
              <AttackEventItem
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
          case "healing":
            return "healing";
          case "shield":
            return "shield";
          case "other":
            return "other";
          default:
            return null;
        }
      })}
    </div>
  );
}
