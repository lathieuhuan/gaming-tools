import { useState } from "react";
import { clsx } from "rond";
import type { AppCharacter } from "@Calculation";
import type { OptimizedOutput } from "@OptimizeDept/hooks/useOptimizeManager";

import { NORMAL_ATTACKS, TRANSFORMATIVE_REACTIONS } from "@Calculation";
import { useTranslation } from "@Src/hooks";

interface OutputSelectProps {
  calcList?: AppCharacter["calcList"];
  initialValue?: OptimizedOutput;
  onChange?: (items: OptimizedOutput) => void;
  onChangeValid?: (valid: boolean) => void;
}
export function OutputSelect(props: OutputSelectProps) {
  const { calcList } = props;
  const { t } = useTranslation();
  const [selectedOutput, setSelectedOutput] = useState<OptimizedOutput | undefined>(props.initialValue);

  const onClickItem = (output: OptimizedOutput) => {
    setSelectedOutput(output);
    props.onChange?.(output);
    props.onChangeValid?.(true);
  };

  const renderGroup = (title: string, options: OptimizedOutput[] = []) => {
    return (
      <div key={title} className="p-3 text-sm bg-surface-1 cursor-default rounded">
        <p className="text-secondary-1 opacity-80">{t(title)}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.map((option, i) => {
            const name = option.item.name;
            const selected = option.type === selectedOutput?.type && name === selectedOutput.item.name;

            return (
              <span
                key={i}
                className={clsx(
                  "px-2 py-1 font-semibold rounded",
                  selected ? "bg-active-color text-black" : "hover:bg-surface-3"
                )}
                onClick={() => onClickItem(option)}
              >
                {option.type === "RXN" ? t(name) : name}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <p>Select an output to be optimized</p>

      <div className="mt-2 pr-2 grow space-y-2 custom-scrollbar">
        {renderGroup(
          "NAs",
          NORMAL_ATTACKS.map((type) => {
            const items = calcList?.[type] || [];
            return items.map<OptimizedOutput>((item) => ({ type, item }));
          }).flat()
        )}
        {renderGroup(
          "ES",
          calcList?.ES.map((item) => ({ type: "ES", item }))
        )}
        {renderGroup(
          "EB",
          calcList?.EB.map((item) => ({ type: "EB", item }))
        )}
        {renderGroup(
          "RXN_CALC",
          TRANSFORMATIVE_REACTIONS.map<OptimizedOutput>((reaction) => ({
            type: "RXN",
            item: { name: reaction },
          }))
        )}
      </div>
    </div>
  );
}
