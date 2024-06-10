import { Fragment } from "react";
import { round } from "rond";
import { CalculationFinalResultGroup, CalcItemRecord } from "@Backend";

import { useTranslation } from "@Src/hooks";
import { Utils_ } from "@Src/utils";
import { Green } from "@Src/components";

interface PartConfig {
  label: React.ReactNode;
  value?: number;
  /** Default to '*' */
  sign?: string | null;
  /** Default to 0 */
  nullValue?: number | null;
  processor?: (value: number) => string | number;
}
function renderParts(parts: PartConfig[]) {
  return (
    <>
      {parts.map((part, i) => {
        const { value, sign = "*", nullValue = 0 } = part;

        if (value !== undefined && value !== nullValue) {
          return (
            <Fragment key={i}>
              {sign ? (
                <>
                  {" "}
                  <Green>{sign}</Green>{" "}
                </>
              ) : null}
              {part.label} <Green>{part.processor ? part.processor(value) : value}</Green>
            </Fragment>
          );
        }
        return null;
      })}
    </>
  );
}

function renderDmg(value: number | number[], callback: (value: number) => string | number = Math.round) {
  return Array.isArray(value) ? callback(value.reduce((total, num) => total + (num ?? 0), 0)) : callback(value);
}

interface CalcItemTrackerProps {
  /** Default to 'Talent Mult.' */
  coreMultLabel?: string;
  records?: Record<string, CalcItemRecord>;
  resultGroup: CalculationFinalResultGroup;
  defMultDisplay?: React.ReactNode;
  inHealB_?: number;
}
export function CalcItemTracker({
  coreMultLabel = "Talent Mult.",
  inHealB_,
  records = {},
  resultGroup,
  defMultDisplay,
}: CalcItemTrackerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1">
      {defMultDisplay}

      {Object.entries(records).map(([itemName, record], i) => {
        const result = resultGroup[itemName] || {};
        if (!result.nonCrit) return null;

        const nonCritDmg = renderDmg(result.nonCrit);
        const cDmg_ = record.cDmg_ ? round(record.cDmg_, 0) : 0;
        let text = "";

        if (result.type === "attack") {
          const parts = [];
          if (result.attElmt !== "absorb") parts.push(t(`${result.attElmt}_attElmt`));
          if (result.attPatt !== "none") parts.push(t(result.attPatt));
          if (parts.length) text = `${parts.join(" / ")} DMG`;
        }

        return (
          <div key={i}>
            <p className="font-medium">{t(itemName)}</p>
            {text ? <div className="text-sm text-secondary-1">{text}</div> : null}

            <ul className="pl-4 text-hint-color text-sm leading-6 list-disc">
              {record.exclusives?.length ? (
                <li>
                  <p className="text-primary-1">Exclusive Bonus</p>
                  {record.exclusives.map((bonus, i) => {
                    const percent = Utils_.suffixOf(bonus.type);

                    return bonus.records.map((record, j) => {
                      return (
                        <p key={i + j}>
                          + {t(bonus.type)}: {record.desc}{" "}
                          <Green>
                            {round(record.value, percent ? 2 : 0)}
                            {percent}
                          </Green>
                        </p>
                      );
                    });
                  })}
                </li>
              ) : null}

              <li className="mt-1">
                Non-crit <span className="text-heading-color font-semibold">{nonCritDmg}</span> = (
                {record.multFactors.map((factor, i) => {
                  return (
                    <Fragment key={i}>
                      {renderParts([
                        {
                          sign: i ? "+" : null,
                          label: t(factor.desc),
                          value: factor.value,
                          processor: Math.round,
                        },
                        {
                          label: coreMultLabel,
                          value: factor.talentMult,
                          processor: (value) => `${round(value, 2)}%`,
                        },
                      ])}
                    </Fragment>
                  );
                })}
                {renderParts([
                  {
                    label: "Flat Bonus",
                    value: record.totalFlat,
                    sign: "+",
                    processor: Math.round,
                  },
                ])}
                )
                {renderParts([
                  {
                    label: record.itemType === "healing" ? "Heal Mult." : "Percent Mult.",
                    value: record.normalMult,
                    processor: (value) => `${round(value * 100, 2)}%`,
                  },
                  {
                    label: "Incoming Heal Mult.",
                    value: record.itemType === "healing" ? inHealB_ : 0,
                    processor: (value) => `${100 + round(value, 2)}%`,
                  },
                  {
                    label: "Special Mult.",
                    value: record.specialMult,
                    nullValue: 1,
                    processor: (value) => round(value, 3),
                  },
                  {
                    label: "Reaction Mult.",
                    value: record.rxnMult,
                    nullValue: 1,
                    processor: (value) => round(value, 3),
                  },
                  {
                    label: "DEF Mult.",
                    value: record.defMult,
                    processor: (value) => round(value, 3),
                  },
                  {
                    label: "RES Mult.",
                    value: record.resMult,
                  },
                ])}
                {record.note}
              </li>

              {cDmg_ ? (
                <li>
                  Crit <span className="text-heading-color font-semibold">{renderDmg(result.crit)}</span> = {nonCritDmg}{" "}
                  <Green>*</Green> (<Green>1 +</Green> Crit DMG <Green>{cDmg_}</Green>)
                </li>
              ) : null}

              {cDmg_ && record.cRate_ ? (
                <li>
                  Average <span className="text-heading-color font-semibold">{renderDmg(result.average)}</span> ={" "}
                  {nonCritDmg} <Green>*</Green> (<Green>1</Green>
                  {renderParts([
                    {
                      sign: "+",
                      label: "Crit DMG",
                      value: cDmg_,
                    },
                    {
                      label: "Crit Rate",
                      value: record.cRate_,
                      nullValue: null,
                      processor: (value) => round(value, 3),
                    },
                  ])}
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
