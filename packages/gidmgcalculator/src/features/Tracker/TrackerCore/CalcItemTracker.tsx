import { Fragment, ReactNode } from "react";
import { round } from "rond";

import type { CalculationFinalResultGroup, Infusion, TrackerCalcItemRecord } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { suffixOf } from "@Src/utils";
import { Green } from "@Src/components";

interface RenderPartArgs {
  label: ReactNode;
  value?: number;
  sign?: string;
  nullValue?: number | null;
  processor?: (value: number) => string | number;
}

interface CalcItemTrackerProps {
  inHealB_?: number;
  records?: Record<string, TrackerCalcItemRecord>;
  result: CalculationFinalResultGroup;
  defMultDisplay?: ReactNode;
  infusion?: Infusion;
}
export function CalcItemTracker({ inHealB_, records = {}, result, defMultDisplay, infusion }: CalcItemTrackerProps) {
  const { t } = useTranslation();

  function renderPart({ label, value, sign = "*", nullValue = 0, processor }: RenderPartArgs) {
    return value !== undefined && value !== nullValue ? (
      <>
        {" "}
        <Green>{sign}</Green> {label} <Green>{processor ? processor(value) : value}</Green>
      </>
    ) : null;
  }

  function renderValue(value: number | number[], callback: (value: number) => string | number = Math.round) {
    return Array.isArray(value) ? callback(value.reduce((total, num) => total + num, 0)) : callback(value);
  }

  return (
    <div className="space-y-1">
      {defMultDisplay}

      {infusion && infusion.element !== "phys" && (
        <div>
          <p className="text-primary-1">Infusion:</p>
          <ul className="pl-4 list-disc">
            <li className="capitalize">
              Element: <span className={`text-${infusion.element}`}>{infusion.element}</span>
            </li>
            {infusion.range?.length ? (
              <li>Infused attack types: {infusion.range.map((att) => t(att)).join(", ")}</li>
            ) : null}
          </ul>
        </div>
      )}

      {Object.entries(records).map(([itemName, record], i) => {
        const { nonCrit = 0, crit = 0, average = 0 } = result[itemName] || {};
        if (!nonCrit) return null;

        const nonCritDmg = renderValue(nonCrit);
        const cDmg_ = record.cDmg_ ? round(record.cDmg_, 3) : 0;

        return (
          <div key={i}>
            <p className="font-medium">{t(itemName)}</p>
            <ul className="pl-4 text-hint-color text-sm leading-6 list-disc">
              {record.exclusives?.length ? (
                <li>
                  <p className="text-primary-1">Exclusive</p>
                  {record.exclusives.map((bonus, i) => {
                    return Object.entries(bonus).map(([key, record]) => {
                      return (
                        <p key={i}>
                          + {t(key)}: {record.desc}{" "}
                          <Green>
                            {record.value}
                            {suffixOf(key)}
                          </Green>
                        </p>
                      );
                    });
                  })}
                </li>
              ) : null}

              <li>
                Non-crit <span className="text-heading-color font-semibold">{nonCritDmg}</span> = (
                {record.multFactors.map((factor, i) => {
                  return (
                    <Fragment key={i}>
                      {factor.desc ? t(factor.desc) + " " : null}
                      <Green>{Math.round(factor.value)}</Green>
                      {factor.talentMult ? (
                        <>
                          {" "}
                          <Green>*</Green> Talent Mult.{" "}
                          <Green>{renderValue(factor.talentMult, (value) => `${round(value, 2)}%`)}</Green>
                        </>
                      ) : null}
                      {record.multFactors[i + 1] ? " + " : ""}
                    </Fragment>
                  );
                })}
                {renderPart({
                  label: "Flat Bonus",
                  value: record.totalFlat,
                  sign: "+",
                  processor: Math.round,
                })}
                )
                {renderPart({
                  label: record.itemType === "healing" ? "Heal Mult." : "Percent Mult.",
                  value: record.normalMult,
                  processor: (value) => `${round(value * 100, 2)}%`,
                })}
                {record.itemType === "healing"
                  ? renderPart({
                      label: "Incoming Heal Mult.",
                      value: inHealB_,
                      processor: (value) => `${100 + round(value, 2)}%`,
                    })
                  : null}
                {renderPart({
                  label: "Special Mult.",
                  value: record.specialMult,
                  nullValue: 1,
                  processor: (value) => round(value, 3),
                })}
                {renderPart({
                  label: "Reaction Mult.",
                  value: record.rxnMult,
                  nullValue: 1,
                  processor: (value) => round(value, 3),
                })}
                {renderPart({
                  label: "DEF Mult.",
                  value: record.defMult,
                  processor: (value) => round(value, 3),
                })}
                {renderPart({
                  label: "RES Mult.",
                  value: record.resMult,
                })}
                {record.note}
              </li>

              {cDmg_ ? (
                <li>
                  Crit <span className="text-heading-color font-semibold">{renderValue(crit)}</span> = {nonCritDmg}{" "}
                  <Green>*</Green> (<Green>1 +</Green> Crit DMG <Green>{cDmg_}</Green>)
                </li>
              ) : null}

              {cDmg_ && record.cRate_ ? (
                <li>
                  Average <span className="text-heading-color font-semibold">{renderValue(average)}</span> = {nonCritDmg}{" "}
                  <Green>*</Green> (<Green>1 +</Green> Crit DMG <Green>{cDmg_}</Green>
                  {renderPart({
                    label: "Crit Rate",
                    value: record.cRate_,
                    nullValue: null,
                    processor: (value) => round(value, 3),
                  })}
                  )
                </li>
              ) : null}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
