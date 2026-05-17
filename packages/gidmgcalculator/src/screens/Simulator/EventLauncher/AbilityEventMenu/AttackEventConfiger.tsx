import { useEffect } from "react";
import { clsx, SelectOption, VersatileSelect } from "rond";

import type { ForceAttackElement } from "@/screens/Simulator/types";
import type { AttackElement, AttackReaction, ElementType, LunarType } from "@/types";

import { ELEMENT_TYPES } from "@/constants/global";

type ElementSelectValueType = ElementType | "none";

type ReactionSelectValueType = NonNullable<AttackReaction> | "none";

type AttackEventConfigerProps = {
  className?: string;
  forcedAttElmt: ForceAttackElement;
  attElmt: AttackElement | LunarType;
  reaction: AttackReaction;
  onChangeForcedAttElmt: (value: ForceAttackElement) => void;
  onChangeReaction: (value: AttackReaction) => void;
};

export function AttackEventConfiger({
  className,
  forcedAttElmt,
  attElmt,
  reaction,
  onChangeForcedAttElmt,
  onChangeReaction,
}: AttackEventConfigerProps) {
  const reactionOptions = getReactionOptions(attElmt);

  useEffect(() => {
    if (reaction !== null && !reactionOptions.some((option) => option.value === reaction)) {
      onChangeReaction(null);
    }
  }, [attElmt]);

  const handleOverrideElementChange = (value: ElementSelectValueType) => {
    onChangeForcedAttElmt(value === "none" ? null : value);
  };

  const handleReactionChange = (value: ReactionSelectValueType) => {
    onChangeReaction(value === "none" ? null : value);
  };

  return (
    <div className={clsx("space-y-2", className)}>
      <div className="flex justify-end items-center gap-2">
        <span className="text-light-hint">Override Element</span>
        <VersatileSelect
          title="Override Element"
          className="w-28 capitalize font-medium"
          options={OVERRIDE_ELEMENT_OPTIONS}
          value={forcedAttElmt ?? "none"}
          onChange={handleOverrideElementChange}
        />
      </div>

      <div className="flex justify-end items-center gap-2">
        <span className="text-light-hint">Reaction</span>
        <VersatileSelect
          title="Reaction"
          className="w-28 capitalize font-medium"
          options={reactionOptions}
          value={reaction ?? "none"}
          onChange={handleReactionChange}
        />
      </div>
    </div>
  );
}

const OVERRIDE_ELEMENT_OPTIONS = ELEMENT_TYPES.reduce<SelectOption<ElementSelectValueType>[]>(
  (acc, element) => {
    acc.push({
      label: element,
      value: element,
      className: "capitalize",
    });

    return acc;
  },
  [{ label: "None", value: "none" }],
);

const POSSIBLE_REACTIONS: Partial<Record<AttackElement | LunarType, ReactionSelectValueType[]>> = {
  pyro: ["melt", "vaporize"],
  cryo: ["melt"],
  hydro: ["vaporize"],
  electro: ["aggravate"],
  dendro: ["spread"],
};

const getReactionOptions = (attElmt: AttackElement | LunarType) => {
  const possibleReactions = POSSIBLE_REACTIONS[attElmt] || [];

  return possibleReactions.reduce<SelectOption<ReactionSelectValueType>[]>(
    (acc, reaction) => {
      acc.push({
        label: reaction,
        value: reaction,
        className: "capitalize",
      });

      return acc;
    },
    [{ label: "None", value: "none" }],
  );
};
