import { useState } from "react";
import { Button, clsx, CollapseSpace } from "rond";

import type { AttackElement, AttackReaction, TalentCalcItem } from "@/types";

import { triggerAbilityHitEvent } from "../../actions/build";
import { MemberCalc } from "../../logic/MemberCalc";
import { TalentCalculator } from "../../logic/talentCalc";

type AlterState = {
  attElmt?: AttackElement;
  reaction?: AttackReaction;
};

type AbilityEventItemProps = {
  performer: MemberCalc;
  item: TalentCalcItem;
  active: boolean;
  calculator: TalentCalculator;
  onClickHeading?: (name: string) => void;

  // Temporary
  index: number;
};

export function AbilityEventItem({
  performer,
  item,
  active,
  calculator,
  onClickHeading,

  index,
}: AbilityEventItemProps) {
  const { type = "attack" } = item;

  const [alter, setAlter] = useState<AlterState>({});

  const values = calculator
    .calcAttackItem(item, alter)
    .values.map((value) => Math.round(value.average));

  const handleTrigger = (item: TalentCalcItem) => {
    triggerAbilityHitEvent({
      performer: performer.data.code,
      talent: calculator.talent,
      index,
      attElmt: alter.attElmt,
      reaction: alter.reaction,
    });
  };

  return (
    <div>
      <div
        className={clsx(
          "text-sm rounded-xs flex items-center",
          active ? "text-black bg-primary-2" : "text-light-2 bg-dark-2"
        )}
      >
        <button
          className="px-2 py-1 cursor-pointer grow flex justify-between gap-2 glow-on-hover"
          onClick={() => onClickHeading?.(item.name)}
        >
          <span className="text-left font-semibold">{item.name}</span>
          {!active && <span>{values.join(" + ")}</span>}
        </button>

        {/* <div className="w-px h-4 bg-dark-3" /> */}

        {/* <div className="w-8 pr-4 py-1">
          <button>T</button>
        </div> */}
      </div>

      <CollapseSpace active={active}>
        <div className="px-2 py-1">
          <div>{type}</div>
          <div className="flex justify-end">
            <Button
              size="small"
              hidden={type !== "attack"}
              variant="primary"
              onClick={() => handleTrigger(item)}
            >
              Trigger
            </Button>
          </div>
        </div>
      </CollapseSpace>
    </div>
  );
}
