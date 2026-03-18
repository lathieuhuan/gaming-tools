import { useRef } from "react";
import { InputNumber, VersatileSelect } from "rond";

import type { ArtifactSubStat, AttributeStat } from "@/types";
import { useTranslation } from "@/hooks";
import { suffixOf } from "@/utils/pure.utils";

// Constant
import { ARTIFACT_SUBSTAT_TYPES } from "@/constants/global";
import VALID_SUBSTAT_VALUES from "./valid-substat-values";

const SUBSTAT_BASE_VALUES: Record<number, Record<string, number>> = {
  5: {
    hp_: 4.96,
    hp: 253.94,
    atk_: 4.96,
    atk: 16.54,
    def_: 6.2,
    def: 19.68,
    em: 19.82,
    cRate_: 3.31,
    cDmg_: 6.62,
    er_: 5.51,
  },
  4: {
    hp_: 3.97,
    hp: 203.15,
    atk_: 3.97,
    atk: 13.23,
    def_: 4.96,
    def: 15.74,
    em: 15.86,
    cRate_: 2.65,
    cDmg_: 5.3,
    er_: 4.41,
  },
};

type ArtifactSubstatsControlProps = {
  className?: string;
  mutable?: boolean;
  rarity: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
  onChangeSubStat?: (index: number, changes: Partial<ArtifactSubStat>) => void;
};

export function ArtifactSubstatsControl({
  className = "",
  mutable,
  mainStatType,
  subStats,
  rarity,
  onChangeSubStat,
}: ArtifactSubstatsControlProps) {
  const { t } = useTranslation();
  const wrapper = useRef<HTMLDivElement>(null);

  const statTypeCount = { [mainStatType]: 1 };

  for (const { type } of subStats) {
    statTypeCount[type] = (statTypeCount[type] || 0) + 1;
  }

  const onKeyDownValue = (index: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && wrapper.current) {
      const inputs = wrapper.current.querySelectorAll<HTMLInputElement>(".ron-input-number");
      const nextInput = inputs[index + (e.shiftKey ? -1 : 1)];

      if (nextInput) nextInput.focus?.();
    }
  };

  return (
    <div ref={wrapper} className={"space-y-2 " + className}>
      {subStats.map(({ type, value }, i) => {
        const isValid = value === 0 || VALID_SUBSTAT_VALUES[type][rarity].includes(value);

        return mutable ? (
          <div key={i} className="h-9 flex items-center bg-dark-2 relative">
            <VersatileSelect
              title="Select Sub-stat"
              className={[
                "w-40 h-full",
                statTypeCount[type] === 1 ? "text-light-1" : "text-danger-2",
              ]}
              transparent
              arrowAt="start"
              options={ARTIFACT_SUBSTAT_TYPES.map((type) => ({ label: t(type), value: type }))}
              value={type}
              onChange={(value) => onChangeSubStat?.(i, { type: value })}
            />
            <span>+</span>
            <InputNumber
              transparent
              className={`w-14 h-full pt-1.5 ${isValid ? "text-light-1" : "text-danger-2"}`}
              maxDecimalDigits={1}
              value={value}
              onChange={(value) => onChangeSubStat?.(i, { value })}
              onKeyDown={onKeyDownValue(i)}
            />
            <span className="w-4 pt-2 pb-1">{suffixOf(type)}</span>

            <div className="mx-1 h-1/2 w-px bg-dark-1" />

            <input
              key={value}
              type="text"
              defaultValue={(() => {
                const base = SUBSTAT_BASE_VALUES[rarity]?.[type];
                if (base && value > 0) {
                  const multiplier = Math.round(value / base);
                  return multiplier || "";
                }
                return "";
              })()}
              placeholder={`${SUBSTAT_BASE_VALUES[rarity]?.[type] || ""}`}
              className="w-16 h-full bg-transparent text-sm text-center outline-none border-none placeholder:text-light-1/20"
              onChange={(e) => {
                const input = e.target.value.trim();
                const formulaMatch = input.match(/^(\d+)x([\d.]+)%?$/);

                if (formulaMatch) {
                  const multiplier = parseInt(formulaMatch[1]);
                  const base = parseFloat(formulaMatch[2]);
                  if (!isNaN(multiplier) && !isNaN(base)) {
                    onChangeSubStat?.(i, { value: multiplier * base });
                  }
                } else if (/^\d+$/.test(input)) {
                  const multiplier = parseInt(input);
                  const base = SUBSTAT_BASE_VALUES[rarity]?.[type];
                  if (!isNaN(multiplier) && base) {
                    onChangeSubStat?.(i, { value: multiplier * base });
                  }
                }
              }}
            />
          </div>
        ) : (
          <div key={i} className="mt-2 pt-2 pb-1 flex items-center bg-dark-2">
            <span className="mx-3">•</span>
            <p>
              <span
                className={`mr-1 ${statTypeCount[type] === 1 ? "text-light-1" : "text-danger-2"}`}
              >
                {t(type)}
              </span>{" "}
              <span className={isValid ? "text-bonus" : "text-danger-2"}>
                +{value}
                {suffixOf(type)}
              </span>
            </p>
          </div>
        );
      })}

      {mutable && (
        <div className="flex justify-end pr-2 text-sm text-light-1/50">
          <span>
            {subStats.reduce((acc, { type, value }) => {
              const base = SUBSTAT_BASE_VALUES[rarity]?.[type];
              return acc + (base && value > 0 ? Math.round(value / base) : 0);
            }, 0)}{" "}
            substats
          </span>
        </div>
      )}
    </div>
  );
}
