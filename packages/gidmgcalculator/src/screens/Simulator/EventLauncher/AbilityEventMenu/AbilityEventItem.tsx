import { useState } from "react";
import { Button, clsx, CollapseSpace, SelectOption, VersatileSelect } from "rond";

import type { Member } from "@/screens/Simulator/models/Member";
import type { AttackReaction, ElementType, TalentCalcItem } from "@/types";
import type { ForceAttackElement } from "../../types";

import { ELEMENT_TYPES } from "@/constants";
import { triggerAbilityHitEvent } from "../../actions/build";
import { TalentCalculator } from "../../logic/talentCalc";

type AlterState = {
  attElmt: ForceAttackElement;
  reaction: AttackReaction;
};

type AbilityEventItemProps = {
  performer: Member;
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

  const [alter, setAlter] = useState<AlterState>({
    attElmt: null,
    reaction: null,
  });

  const { defaultAttElmt, calculate } = calculator.attackCalc(item);
  const result = calculate(alter);
  const values = result.values.map((value) => Math.round(value));

  const handleTrigger = (item: TalentCalcItem) => {
    triggerAbilityHitEvent({
      performer: performer.data.code,
      talent: calculator.talent,
      index,
      forcedElmt: alter.attElmt,
      reaction: alter.reaction,
    });
  };

  const handleOverrideElementChange = (value: ElementType | "NONE") => {
    setAlter({
      ...alter,
      attElmt: value === "NONE" ? null : value,
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
        <div className="px-2 py-1" onDoubleClick={() => console.info(calculate(alter))}>
          <div>
            {type} {defaultAttElmt} {result.attElmt} {result.attPatt} {result.reaction}
          </div>

          <div className="flex items-center gap-2">
            <span>Override Element</span>
            <VersatileSelect
              title="Override Element"
              className="w-22"
              options={OVERRIDE_ELEMENT_OPTIONS}
              value={alter.attElmt ?? "NONE"}
              onChange={handleOverrideElementChange}
            />
          </div>

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

const OVERRIDE_ELEMENT_OPTIONS = ELEMENT_TYPES.reduce<SelectOption<ElementType | "NONE">[]>(
  (acc, element) => {
    acc.push({
      label: element.charAt(0).toUpperCase() + element.slice(1),
      value: element,
      className: "capitalize",
    });

    return acc;
  },
  [{ label: "None", value: "NONE" }]
);
