import { useState } from "react";
import { Button, CollapseSpace } from "rond";

import type { AttackElement, AttackReaction, TalentCalcItem } from "@/types";

import { CharacterCalc } from "@/models";
import { triggerTalentHitEvent } from "../actions/build";
import { TalentCalculator } from "../logic/talentCalc";
import { smoothValues } from "../utils";

type AlterState = {
  attElmt?: AttackElement;
  reaction?: AttackReaction;
};

type TalentEventItemProps = {
  performer: CharacterCalc;
  item: TalentCalcItem;
  active: boolean;
  calculator: TalentCalculator;
  onClickHeading?: (name: string) => void;

  // Temporary
  index: number;
};

export function TalentEventItem({
  performer,
  item,
  active,
  calculator,
  onClickHeading,

  index,
}: TalentEventItemProps) {
  const { type = "attack" } = item;

  const [alter, setAlter] = useState<AlterState>({});

  const values = calculator.calcAttackItem(item, alter).values.map((value) => value.average);

  const handleTrigger = (item: TalentCalcItem) => {
    triggerTalentHitEvent({
      performer: performer.data.code,
      talent: calculator.talent,
      index,
      attElmt: alter.attElmt,
      reaction: alter.reaction,
    });
  };

  return (
    <div>
      <div className="text-sm bg-dark-2 rounded-sm flex items-center">
        <button
          className="px-2 py-1 cursor-pointer grow flex justify-between gap-2 glow-on-hover"
          onClick={() => onClickHeading?.(item.name)}
        >
          <span className="text-left font-semibold">{item.name}</span>
          <span className="text-light-4">{smoothValues(values)}</span>
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
