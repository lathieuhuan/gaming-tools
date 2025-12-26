import type {
  CalcAspect,
  CalcResultAttackItem,
  CalcResultItemValue,
  CalcResultOtherItem,
  CalcResultReactionItem,
  ResultItemRecord,
} from "@/calculation/types";
import type { LunarType } from "@/types";

import { LUNAR_TYPES } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { AttackBonusControl } from "@/models/base";
import { round, suffixOf } from "@/utils";
import Object_ from "@/utils/Object";

import { markGreen } from "@/components";
import { PartConfig, Parts, PartsConfig } from "./Parts";

type CalcResultItem = CalcResultAttackItem | CalcResultOtherItem | CalcResultReactionItem;

function renderDmg(values: CalcResultItemValue[], aspect: CalcAspect) {
  return Math.round(values.reduce((total, value) => total + (value[aspect] ?? 0), 0));
}

type CalcItemTrackerProps = {
  /** Default 'Talent Mult.' */
  coreMultLabel?: string;
  resultGroup: Record<string, CalcResultItem>;
  attkBonusCtrl: AttackBonusControl;
  defMultDisplay?: React.ReactNode;
  inHealB_?: number;
  forReactions?: boolean;
};

export function CalcItemTracker({
  coreMultLabel = "Talent Mult.",
  inHealB_,
  resultGroup,
  attkBonusCtrl,
  defMultDisplay,
  forReactions,
}: CalcItemTrackerProps) {
  const { t } = useTranslation();

  const makeFactorParts = (
    factor: ResultItemRecord["factors"][number],
    sign?: string | null
  ): PartConfig[] => {
    return [
      {
        sign,
        label: t(factor.label),
        value: factor.value,
        nullValue: -1,
        process: Math.round,
      },
      {
        label: coreMultLabel,
        value: factor.mult,
        process: (value) => `${round(value, 2)}%`,
      },
    ];
  };

  const getFirstPartConfigs = (data: ResultItemRecord): PartsConfig[] => {
    const baseMult: PartConfig = {
      label: "Base DMG Mult.",
      value: data.baseMult,
      nullValue: 1,
      process: (value) => `${round(value * 100, 2)}%`,
    };
    const bonusMult: PartConfig = {
      label: "Bonus Mult.",
      value: data.bonusMult,
      process: (value) => `${round(value * 100, 2)}%`,
    };
    const elvMult: PartConfig = {
      label: "Elevate Mult.",
      value: data.elvMult,
      nullValue: 1,
      process: (value) => `${round(value * 100, 2)}%`,
    };
    const flat: PartConfig = {
      sign: "+",
      label: "Flat Bonus",
      value: data.flat,
      process: Math.round,
    };

    if (forReactions) {
      if (!data.factors.length) {
        return [];
      }

      return [
        {
          containers: ["(", ")"],
          parts: [...makeFactorParts(data.factors[0], null), baseMult, bonusMult, elvMult, flat],
        },
      ];
    }

    const specMult: PartConfig = {
      label: "Special Mult.",
      value: data.specMult,
      nullValue: 1,
    };

    const factorParts = data.factors
      .map((factor, index) => makeFactorParts(factor, index ? "+" : null))
      .flat();

    if (data.specPatt) {
      return [
        {
          containers: ["(", ")"],
          parts: [
            ...factorParts,
            baseMult,
            {
              label: "Coefficient",
              value: data.coefficient,
              nullValue: 1,
            },
            bonusMult,
            {
              label: "Veil Mult.",
              value: data.veilMult,
              nullValue: 1,
              process: (value) => `${round(value * 100, 2)}%`,
            },
            flat,
          ],
        },
        specMult,
        elvMult,
      ];
    }

    return [
      {
        containers: ["(", ")"],
        parts: [...factorParts, baseMult, flat],
      },
      bonusMult,
      specMult,
      elvMult,
    ];
  };

  const getLastPartConfigs = (
    data: ResultItemRecord,
    type?: CalcResultItem["type"]
  ): PartsConfig[] => {
    return [
      {
        label: "Incoming Heal Mult.",
        value: type === "attack" ? inHealB_ : 0,
        process: (value) => `${100 + round(value, 2)}%`,
      },
      {
        label: "Reaction Mult.",
        value: data.rxnMult,
        nullValue: 1,
        process: (value) => round(value, 3),
      },
      {
        label: "DEF Mult.",
        value: data.defMult,
        process: (value) => round(value, 3),
      },
      {
        label: "RES Mult.",
        value: data.resMult,
      },
    ];
  };

  const renderRecord = (name: string, item: CalcResultItem) => {
    if (!item.values[0].base) {
      return null;
    }

    const recordData = item.recorder.data;
    const baseValue = renderDmg(item.values, "base");
    const cDmg_ = recordData.cDmg_ ? round(recordData.cDmg_, 3) : 0;
    const exclusiveBonuses = attkBonusCtrl.collectExclusiveBonuses(item.exclusiveBonusId);

    let text = "";

    if (item.type === "attack") {
      // TODO improve this
      const parts = [
        item.attElmt !== "absorb"
          ? LUNAR_TYPES.includes(item.attElmt as LunarType)
            ? t(item.attElmt)
            : t(`${item.attElmt}_attElmt`)
          : "",
        item.attPatt !== "none" && t(item.attPatt),
      ].filter(Boolean);

      text = parts.length ? `${parts.join(" / ")} DMG` : "";
    }

    return (
      <div key={name}>
        <p className="font-medium">{t(name)}</p>
        {text ? <div className="text-sm text-secondary-1">{text}</div> : null}

        <ul className="pl-4 text-light-hint text-sm leading-6 list-disc">
          {exclusiveBonuses.length !== 0 && (
            <li>
              <p className="text-primary-1">Exclusive Bonus</p>
              {exclusiveBonuses.map((bonus, i) => {
                const percent = suffixOf(bonus.type);

                return bonus.items.map((bonusItem, j) => (
                  <p key={i + j}>
                    + {t(bonus.type)}: {bonusItem.label}{" "}
                    {markGreen(round(bonusItem.value, percent ? 2 : 0) + percent)}
                  </p>
                ));
              })}
            </li>
          )}

          <li className="mt-1">
            Non-crit <span className="text-heading font-semibold">{baseValue}</span> ={" "}
            <Parts
              configs={[
                ...getFirstPartConfigs(recordData),
                ...getLastPartConfigs(recordData, item.type),
              ]}
            />
            {recordData.note}
          </li>

          {cDmg_ !== 0 && (
            <li>
              Crit{" "}
              <span className="text-heading font-semibold">{renderDmg(item.values, "crit")}</span> ={" "}
              {baseValue} {markGreen("*")} ({markGreen("1 +")} Crit DMG {markGreen(cDmg_)})
            </li>
          )}

          {Boolean(cDmg_ && recordData.cRate_) && (
            <li>
              Average{" "}
              <span className="text-heading font-semibold">
                {renderDmg(item.values, "average")}
              </span>{" "}
              = {baseValue} {markGreen("*")} ({markGreen("1")}
              <Parts
                configs={[
                  {
                    sign: "+",
                    label: "Crit DMG",
                    value: cDmg_,
                  },
                  {
                    label: "Crit Rate",
                    value: recordData.cRate_,
                    nullValue: null,
                    process: (value) => round(value, 3),
                  },
                ]}
              />
              )
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {defMultDisplay}
      {Object_.keys(resultGroup).map((name) => renderRecord(name, resultGroup[name]))}
    </div>
  );
}
