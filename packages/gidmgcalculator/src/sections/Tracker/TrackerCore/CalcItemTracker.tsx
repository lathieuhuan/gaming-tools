import { Fragment } from "react";
import { round } from "rond";
import { CalculationFinalResultGroup, CalcItemRecord } from "@Calculation";

import { useTranslation } from "@Src/hooks";
import { suffixOf } from "@Src/utils";
import { markGreen } from "@Src/components";
import Array_ from "@Src/utils/array-utils";

function renderDmg(value: number | number[], callback: (value: number) => string | number = Math.round) {
  return Array.isArray(value) ? callback(value.reduce((total, num) => total + (num ?? 0), 0)) : callback(value);
}

interface PartConfig {
  label: React.ReactNode;
  value?: number;
  /** Default to '*' */
  sign?: string | null;
  /** Default to 0 */
  nullValue?: number | null;
  processor?: (value: number) => string | number;
}

interface CalcItemTrackerProps {
  /** Default to 'Talent Mult.' */
  coreMultLabel?: string;
  records?: Record<string, CalcItemRecord>;
  resultGroup: CalculationFinalResultGroup;
  defMultDisplay?: React.ReactNode;
  inHealB_?: number;
  forReactions?: boolean;
}
export function CalcItemTracker({
  coreMultLabel = "Talent Mult.",
  inHealB_,
  records = {},
  resultGroup,
  defMultDisplay,
  forReactions,
}: CalcItemTrackerProps) {
  const { t } = useTranslation();

  const renderPart = (part: PartConfig, key?: string | number) => {
    const { value, sign = "*", nullValue = 0 } = part;

    if (value !== undefined && value !== nullValue) {
      return (
        <Fragment key={key}>
          {sign ? <> {markGreen(sign)} </> : null}
          {part.label} {markGreen(part.processor ? part.processor(value) : value)}
        </Fragment>
      );
    }
    return null;
  };

  const renderParts = (parts: PartConfig[], key?: string | number) => {
    return <Fragment key={key}>{Array_.toArray(parts).map(renderPart)}</Fragment>;
  };

  const renderFactor = (factor: CalcItemRecord["multFactors"][number], sign?: string | null, key?: string | number) => {
    return renderParts(
      [
        {
          sign,
          label: t(factor.desc),
          value: factor.value,
          nullValue: -1,
          processor: Math.round,
        },
        {
          label: coreMultLabel,
          value: factor.talentMult,
          processor: (value) => `${round(value, 2)}%`,
        },
      ],
      key
    );
  };

  const renderFirstRecordParts = (record: CalcItemRecord) => {
    const flatRender = renderPart({
      sign: "+",
      label: "Flat Bonus",
      value: record.totalFlat,
      processor: Math.round,
    });
    const bonusMultRender = renderPart({
      label: "Bonus Mult.",
      value: record.bonusMult,
      processor: (value) => `${round(value * 100, 2)}%`,
    });
    const baseMultRender = renderPart({
      label: "Base DMG Mult.",
      value: record.baseMult,
      nullValue: 1,
      processor: (value) => `${round(value * 100, 2)}%`,
    });

    return forReactions ? (
      <>
        {"("}
        {renderFactor(record.multFactors[0], null)}
        {baseMultRender}
        {bonusMultRender}
        {flatRender}
        {")"}
      </>
    ) : record.specialPatt ? (
      <>
        {"("}
        {record.multFactors.map((factor, index) => renderFactor(factor, index ? "+" : null, index))}
        {baseMultRender}
        {renderPart({
          label: "Coefficient",
          value: record.coefficient,
          nullValue: 1,
        })}
        {bonusMultRender}
        {flatRender}
        {")"}
      </>
    ) : (
      <>
        {"("}
        {record.multFactors.map((factor, index) => renderFactor(factor, index ? "+" : null, index))}
        {baseMultRender}
        {flatRender}
        {")"}
        {bonusMultRender}
      </>
    );
  };

  const renderLastRecordParts = (record: CalcItemRecord) => {
    return renderParts([
      {
        label: "Incoming Heal Mult.",
        value: record.itemType === "healing" ? inHealB_ : 0,
        processor: (value) => `${100 + round(value, 2)}%`,
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
    ]);
  };

  const renderRecord = ([name, record]: [string, CalcItemRecord]) => {
    const result = resultGroup[name] || {};
    if (!result.nonCrit) return null;

    const nonCritDmg = renderDmg(result.nonCrit);
    const cDmg_ = record.cDmg_ ? round(record.cDmg_, 3) : 0;
    let text = "";

    if (result.type === "attack") {
      const parts = [];
      if (result.attElmt !== "absorb") parts.push(t(`${result.attElmt}_attElmt`));
      if (result.attPatt !== "none") parts.push(t(result.attPatt));
      if (parts.length) text = `${parts.join(" / ")} DMG`;
    }

    return (
      <div key={name}>
        <p className="font-medium">{t(name)}</p>
        {text ? <div className="text-sm text-secondary-1">{text}</div> : null}

        <ul className="pl-4 text-hint-color text-sm leading-6 list-disc">
          {record.exclusives?.length ? (
            <li>
              <p className="text-primary-1">Exclusive Bonus</p>
              {record.exclusives.map((bonus, i) => {
                const percent = suffixOf(bonus.type);

                return bonus.records.map((record, j) => (
                  <p key={i + j}>
                    + {t(bonus.type)}: {record.description} {markGreen(round(record.value, percent ? 2 : 0) + percent)}
                  </p>
                ));
              })}
            </li>
          ) : null}

          <li className="mt-1">
            Non-crit <span className="text-heading-color font-semibold">{nonCritDmg}</span> ={" "}
            {renderFirstRecordParts(record)}
            {renderLastRecordParts(record)}
            {record.note}
          </li>

          {cDmg_ ? (
            <li>
              Crit <span className="text-heading-color font-semibold">{renderDmg(result.crit)}</span> = {nonCritDmg}{" "}
              {markGreen("*")} ({markGreen("1 +")} Crit DMG {markGreen(cDmg_)})
            </li>
          ) : null}

          {cDmg_ && record.cRate_ ? (
            <li>
              Average <span className="text-heading-color font-semibold">{renderDmg(result.average)}</span> ={" "}
              {nonCritDmg} {markGreen("*")} ({markGreen("1")}
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
  };

  return (
    <div className="space-y-1">
      {defMultDisplay}
      {Object.entries(records).map(renderRecord)}
    </div>
  );
}
