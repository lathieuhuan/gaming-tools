import { useState } from "react";
import { IoDice } from "react-icons/io5";
import { AttackIcon, Button, CollapseSpace, CritDamageIcon } from "rond";

import type { Member } from "@/screens/Simulator/models/Member";
import type { AttackReaction, TalentCalcItem } from "@/types";
import type { ForceAttackElement } from "../../types";

import { useTranslation } from "@/hooks/useTranslation";
import { triggerAbilityHitEvent } from "../../actions/build";
import { TalentCalculator } from "../../logic/talentCalc";
import { AttackEventConfiger } from "./AttackEventConfiger";
import { EventHeading } from "./EventHeading";
import { formatNumber } from "ron-utils";

type AlterState = {
  attElmt: ForceAttackElement;
  reaction: AttackReaction;
};

type AttackEventItemProps = {
  performer: Member;
  item: TalentCalcItem;
  active: boolean;
  calculator: TalentCalculator;
  onClickHeading?: (name: string) => void;

  // Temporary
  index: number;
};

export function AttackEventItem({
  performer,
  item,
  active,
  calculator,
  onClickHeading,

  index,
}: AttackEventItemProps) {
  const { t } = useTranslation();

  const [alter, setAlter] = useState<AlterState>({
    attElmt: null,
    reaction: null,
  });

  const { defaultAttElmt, calculate } = calculator.attackCalc(item);
  const result = calculate(alter);
  const values = result.values.map((value) => Math.round(value));
  const critMult = 1 + result.cDmg;

  const formattedValues: string[] = [];
  const formattedCrits: string[] = [];

  for (const value of values) {
    formattedValues.push(formatNumber(Math.round(value)));
    formattedCrits.push(formatNumber(Math.round(value * critMult)));
  }

  const handleTrigger = (isCrit = Math.random() < result.cRate) => {
    triggerAbilityHitEvent({
      performer: performer.data.code,
      talent: calculator.talent,
      index,
      forcedElmt: alter.attElmt,
      reaction: alter.reaction,
      isCrit,
    });
  };

  return (
    <div>
      <EventHeading
        active={active}
        text={item.name}
        onClickHeading={() => onClickHeading?.(item.name)}
      />

      <CollapseSpace active={active}>
        <div className="px-2 py-1" onDoubleClick={() => console.info(calculate(alter))}>
          <div className="mt-2 text-sm">
            <p>
              <span className="text-light-hint">Type:</span> {t(result.attPatt)}
            </p>
            <p className="capitalize">
              <span className="text-light-hint">Element:</span>{" "}
              <span className={`text-${defaultAttElmt}`}>
                {defaultAttElmt === "phys" ? "none" : defaultAttElmt}
              </span>{" "}
              {alter.attElmt !== null && alter.attElmt !== defaultAttElmt && (
                <>
                  → <span className={`text-${alter.attElmt}`}>{alter.attElmt}</span>
                </>
              )}
            </p>
          </div>

          <AttackEventConfiger
            className="mt-2"
            forcedAttElmt={alter.attElmt}
            attElmt={result.attElmt}
            reaction={alter.reaction}
            onChangeForcedAttElmt={(value) => setAlter({ ...alter, attElmt: value })}
            onChangeReaction={(value) => setAlter({ ...alter, reaction: value })}
          />

          <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-x-2 gap-y-3">
            <Button
              size="small"
              className="justify-self-end"
              icon={<AttackIcon />}
              iconPosition="end"
              onClick={() => handleTrigger(false)}
            >
              Non-crit
            </Button>
            <span className="text-right tabular-nums">{formattedValues.join(" + ")}</span>

            <Button
              size="small"
              className="justify-self-end"
              icon={<CritDamageIcon />}
              iconPosition="end"
              onClick={() => handleTrigger(true)}
            >
              Crit
            </Button>
            <span className="text-right tabular-nums">{formattedCrits.join(" + ")}</span>

            <Button
              size="small"
              className="justify-self-end"
              icon={<IoDice className="text-lg" />}
              iconPosition="end"
              onClick={() => handleTrigger()}
            >
              Auto
            </Button>
          </div>
        </div>
      </CollapseSpace>
    </div>
  );
}
