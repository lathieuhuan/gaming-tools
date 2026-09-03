import { useRef, useState } from "react";
import { clsx, InputNumber, VersatileSelect } from "rond";

import type { CustomBuffCtrl, CustomBuffCtrlCategory, CustomBuffCtrlType } from "@/types";

import { CUSTOM_BUFF_CTRL_SPECS } from "@/constants/global";
import { useTranslation } from "@/hooks";
import { suffixOf, toCustomBuffLabel } from "@/utils/ui.utils";

function typesByCategory(category: CustomBuffCtrlCategory) {
  const { types } = CUSTOM_BUFF_CTRL_SPECS[category];
  // new reaction types must be added at the end but we want to show them at the beginning
  return category === "rxnBonus" ? types.toReversed() : types;
}

type BuffCtrlFormProps = {
  id: string;
  onSubmit: (config: CustomBuffCtrl) => void;
};

export function BuffCtrlForm({ id, onSubmit }: BuffCtrlFormProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<CustomBuffCtrl>({
    category: "totalAttr",
    type: CUSTOM_BUFF_CTRL_SPECS.totalAttr.types[0],
    value: 0,
  });

  const categorySpec = CUSTOM_BUFF_CTRL_SPECS[config.category];
  const sign = suffixOf(config.subType || config.type);

  const subTypeOptions = categorySpec.subTypes?.map((subType) => ({
    label: t(subType),
    value: subType,
  }));

  const handleCategoryChange = (category: CustomBuffCtrlCategory) => {
    setConfig({
      category,
      type: typesByCategory(category)[0],
      subType: CUSTOM_BUFF_CTRL_SPECS[category].subTypes?.at(0),
      value: 0,
    });
  };

  const handleTypeChange = (type: string) => {
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

  const handleSubTypeChange = (subType: string) => {
    setConfig({
      ...config,
      subType: subType as CustomBuffCtrl["subType"],
      value: 0,
    });

    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    onSubmit(config);
  };

  const widthByCategory: Record<CustomBuffCtrlCategory, string> = {
    totalAttr: "11rem",
    attElmtBonus: "5.5rem",
    attPattBonus: "9rem",
    rxnBonus: "9.5rem",
  };

  const typeOptions = typesByCategory(config.category).map((option) => ({
    label: toCustomBuffLabel(config.category, option, t),
    value: option,
    className: "capitalize",
  }));

  const typeSelect = (
    <VersatileSelect
      title="Select"
      className="h-8 capitalize"
      style={{ width: widthByCategory[config.category] }}
      arrowAt="start"
      transparent
      dropdownCls="z-50"
      options={typeOptions}
      value={config.type}
      onChange={(value) => handleTypeChange(value as string)}
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
            handleSubmit();
          }
        }}
      />
      <span className="w-5 flex justify-end">{sign}</span>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="flex flex-col sm:flex-row">
        {Object.entries(CUSTOM_BUFF_CTRL_SPECS).map(([category, { label }], index) => {
          const selected = config.category === category;

          return (
            <button
              key={category}
              className={clsx(
                "px-4 py-1",
                !index && "rounded-t sm:rounded-tr-none sm:rounded-l",
                index === 3 && "rounded-b sm:rounded-bl-none sm:rounded-r",
                selected ? "bg-light-1" : "bg-dark-3",
              )}
              // This will prevent the current input from being blurred
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!selected) {
                  handleCategoryChange(category as CustomBuffCtrlCategory);
                }
              }}
            >
              <p className={clsx("font-semibold text-center", selected && "text-black")}>{label}</p>
            </button>
          );
        })}
      </div>

      <form
        id={id}
        className="mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {subTypeOptions ? (
          <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
            {typeSelect}

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
                  options={subTypeOptions}
                  value={config.subType}
                  onChange={(value) => handleSubTypeChange(value)}
                />
              )}

              {valueInput}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center sm:justify-end gap-2">
            {typeSelect}
            {valueInput}
          </div>
        )}
      </form>
    </div>
  );
}
