import { useRef } from "react";
import { FaChevronDown } from "react-icons/fa";
import { InputNumber } from "rond";

import type { AttributeStat, ArtifactSubStat } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { suffixOf } from "@Src/utils";

// Constant
import { ARTIFACT_SUBSTAT_TYPES } from "@Src/constants";
import VALID_SUBSTAT_VALUES from "./valid-substat-values";

interface ArtifactSubstatsControlProps {
  className?: string;
  mutable?: boolean;
  rarity: number;
  mainStatType: AttributeStat;
  subStats: ArtifactSubStat[];
  onChangeSubStat?: (index: number, changes: Partial<ArtifactSubStat>) => void;
}
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
      const inputs = wrapper.current.querySelectorAll("input");
      const nextInput = inputs[index + (e.shiftKey ? -1 : 1)];

      if (nextInput) nextInput.focus();
    }
  };

  return (
    <div ref={wrapper} className={"space-y-2 " + className}>
      {subStats.map(({ type, value }, i) => {
        const isValid = value === 0 || VALID_SUBSTAT_VALUES[type][rarity].includes(value);

        return mutable ? (
          <div key={i} className="h-9 flex-center bg-surface-2 relative">
            <div className="relative">
              <FaChevronDown className="absolute top-2.5 left-1 text-sm" />

              <select
                className={
                  "pt-1.5 pb-1 pr-3 pl-6 leading-base relative z-10 appearance-none " +
                  (statTypeCount[type] === 1 ? "text-light-default" : "text-danger-2")
                }
                value={type}
                onChange={(e) => {
                  onChangeSubStat?.(i, { type: e.target.value as AttributeStat });
                }}
              >
                {ARTIFACT_SUBSTAT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {t(type)}
                  </option>
                ))}
              </select>
            </div>

            <span>+</span>

            <InputNumber
              transparent
              className={`w-14 h-full pt-1.5 ${isValid ? "text-light-default" : "text-danger-2"}`}
              maxDecimalDigits={1}
              value={value}
              onChange={(value) => onChangeSubStat?.(i, { value })}
              onKeyDown={onKeyDownValue(i)}
            />
            <span className="w-4 pt-2 pb-1">{suffixOf(type)}</span>
          </div>
        ) : (
          <div key={i} className="mt-2 pt-2 pb-1 flex items-center bg-surface-2">
            <span className="mx-3">•</span>
            <p>
              <span className={`mr-1 ${statTypeCount[type] === 1 ? "text-light-default" : "text-danger-2"}`}>
                {t(type)}
              </span>{" "}
              <span className={isValid ? "text-bonus-color" : "text-danger-2"}>
                +{value}
                {suffixOf(type)}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
