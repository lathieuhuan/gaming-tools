import { useState, useRef, FormEvent } from "react";
import { clsx, InputNumber, VersatileSelect } from "rond";
import { ATTACK_ELEMENTS, ATTACK_PATTERNS, REACTIONS } from "@Calculation";

import type { CustomBuffCtrl, CustomBuffCtrlCategory, CustomBuffCtrlType } from "@Src/types";
import { useTranslation } from "@Src/hooks";
import { suffixOf, toCustomBuffLabel } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { updateCustomBuffCtrls } from "@Store/calculator-slice";

const CATEGORIES: Record<
  CustomBuffCtrlCategory,
  { label: string; types: readonly CustomBuffCtrlType[]; subTypes?: readonly string[] }
> = {
  totalAttr: {
    label: "Attributes",
    types: ["hp", "hp_", "atk", "atk_", "def", "def_", "em", "er_", "cRate_", "cDmg_", "shieldS_", "healB_"],
  },
  attElmtBonus: {
    label: "Elements",
    types: ATTACK_ELEMENTS,
    subTypes: ["pct_", "flat", "cRate_", "cDmg_"],
  },
  attPattBonus: {
    label: "Talents",
    types: ["all", ...ATTACK_PATTERNS],
    subTypes: ["pct_", "flat", "cRate_", "cDmg_", "defIgn_"],
  },
  rxnBonus: {
    label: "Reactions",
    types: REACTIONS,
    subTypes: ["pct_", "cRate_", "cDmg_"],
  },
};

interface BuffCtrlCreatorProps {
  onClose: () => void;
}
export default function BuffCtrlCreator({ onClose }: BuffCtrlCreatorProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<CustomBuffCtrl>({
    category: "totalAttr",
    type: "atk_",
    value: 0,
  });

  const subTypes = CATEGORIES[config.category].subTypes;
  const sign = suffixOf(config.subType || config.type);

  const onChangeCategory = (category: CustomBuffCtrlCategory) => {
    const subType = CATEGORIES[category].subTypes?.[0] as CustomBuffCtrl["subType"];

    setConfig({
      category,
      type: CATEGORIES[category].types[0] as CustomBuffCtrlType,
      ...(subType ? { subType } : undefined),
      value: 0,
    });
  };

  const onChangeType = (type: string) => {
    let subType = config.subType;

    if (["melt", "vaporize"].includes(type)) {
      subType = "pct_";
    }

    setConfig({
      ...config,
      type: type as CustomBuffCtrlType,
      ...(subType ? { subType } : undefined),
    });

    inputRef.current?.focus();
  };

  const onChangeSubType = (subType: string) => {
    setConfig({
      ...config,
      subType: subType as CustomBuffCtrl["subType"],
      value: 0,
    });

    inputRef.current?.focus();
  };

  const onDone = () => {
    dispatch(updateCustomBuffCtrls({ actionType: "ADD", ctrls: config }));
    onClose();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onDone();
  };

  const widthByCategory: Record<CustomBuffCtrlCategory, string> = {
    totalAttr: "11rem",
    attElmtBonus: "5.5rem",
    attPattBonus: "9rem",
    rxnBonus: "9.5rem",
  };

  const categorySelect = (
    <VersatileSelect
      title="Select"
      className="h-8 capitalize"
      style={{ width: widthByCategory[config.category] }}
      arrowAt="start"
      transparent
      dropdownCls="z-50"
      options={CATEGORIES[config.category].types.map((option) => {
        return {
          label: toCustomBuffLabel(config.category, option, t),
          value: option,
          className: "capitalize",
        };
      })}
      value={config.type}
      onChange={(value) => onChangeType(value as string)}
    />
  );

  const valueInput = (
    <div className="flex items-center">
      <InputNumber
        ref={inputRef}
        className="w-16 font-semibold"
        size="medium"
        autoFocus
        min={sign ? -99 : -9999}
        max={sign ? 999 : 99_999}
        maxDecimalDigits={1}
        step="0.1"
        value={config.value}
        onChange={(value) => {
          setConfig((prev) => ({ ...prev, value }));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onDone();
          }
        }}
      />
      <span className="w-5 flex justify-end">{sign}</span>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row">
        {Object.entries(CATEGORIES).map(([category, { label }], index) => {
          const chosen = config.category === category;

          return (
            <button
              key={category}
              className={clsx(
                "px-4 py-1",
                !index && "rounded-t sm:rounded-tr-none sm:rounded-l",
                index === 3 && "rounded-b sm:rounded-bl-none sm:rounded-r",
                chosen ? "bg-light-default" : "bg-surface-3"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!chosen) {
                  onChangeCategory(category as CustomBuffCtrlCategory);
                }
              }}
            >
              <p className={clsx("font-semibold text-center", chosen && "text-black")}>{label}</p>
            </button>
          );
        })}
      </div>

      <form id="buff-creator" className="mt-6" onSubmit={onSubmit}>
        {subTypes ? (
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            {categorySelect}

            <div className="flex items-center justify-between gap-2">
              {["melt", "vaporize"].includes(config.type) ? (
                <span className="px-2">{t("pct_")}</span>
              ) : (
                <VersatileSelect
                  title="Select"
                  className="h-8"
                  style={{ width: "8.5rem" }}
                  arrowAt="start"
                  transparent
                  dropdownCls="z-50"
                  options={subTypes.map((subType) => ({ label: t(subType), value: subType }))}
                  value={config.subType}
                  onChange={(value) => onChangeSubType(value as string)}
                />
              )}

              {valueInput}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-end gap-2">
            {categorySelect}
            {valueInput}
          </div>
        )}
      </form>
    </div>
  );
}
