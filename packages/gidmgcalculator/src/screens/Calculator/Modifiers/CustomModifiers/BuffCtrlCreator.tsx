import { useState, useRef, FormEvent } from "react";
import { FaChevronDown } from "react-icons/fa";
import { clsx, InputNumber } from "rond";

import type { CustomBuffCtrl, CustomBuffCtrlType } from "@Src/types";
import {
  ATTACK_ELEMENTS,
  ATTACK_ELEMENT_INFO_KEYS,
  ATTACK_PATTERNS,
  REACTION_BONUS_INFO_KEYS,
  REACTIONS,
} from "@Src/constants";
import { useTranslation } from "@Src/hooks";
import { suffixOf, toCustomBuffLabel } from "@Src/utils";
import { useDispatch } from "@Store/hooks";
import { updateCustomBuffCtrls } from "@Store/calculator-slice";

type CustomBuffCategory = CustomBuffCtrl["category"];

const CATEGORIES: Record<
  CustomBuffCategory,
  { label: string; types: readonly CustomBuffCtrlType[]; subTypes?: readonly string[] }
> = {
  totalAttr: {
    label: "Attributes",
    types: ["hp", "hp_", "atk", "atk_", "def", "def_", "em", "er_", "cRate_", "cDmg_", "shieldS_", "healB_"],
  },
  attElmtBonus: {
    label: "Elements",
    types: ATTACK_ELEMENTS,
    subTypes: ["pct_", ...ATTACK_ELEMENT_INFO_KEYS],
  },
  attPattBonus: {
    label: "Talents",
    types: ["all", ...ATTACK_PATTERNS],
    subTypes: ["pct_", "flat", "cRate_", "cDmg_", "defIgn_"],
  },
  rxnBonus: {
    label: "Reactions",
    types: REACTIONS,
    subTypes: REACTION_BONUS_INFO_KEYS,
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

  const onChangeCategory = (category: CustomBuffCategory) => {
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

  const categorySelect = (
    <div className="flex items-center relative">
      <FaChevronDown className="absolute -z-10" />
      <select
        className="pl-6 pr-2 text-light-400 appearance-none capitalize"
        value={config.type}
        onChange={(e) => onChangeType(e.target.value)}
      >
        {CATEGORIES[config.category].types.map((option) => (
          <option key={option} className="pr-2" value={option}>
            {toCustomBuffLabel(config.category, option, t)}
          </option>
        ))}
      </select>
    </div>
  );

  const valueInput = (
    <div className="flex items-center">
      <InputNumber
        ref={inputRef}
        className="w-16 px-2 py-1 text-lg text-right font-semibold"
        autoFocus
        value={config.value}
        min={sign ? -99 : -9999}
        max={sign ? 999 : 99_999}
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
                chosen ? "bg-light-400" : "bg-dark-500"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (!chosen) {
                  onChangeCategory(category as CustomBuffCategory);
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
                <div className="flex items-center relative">
                  <FaChevronDown className="absolute -z-10" />
                  <select
                    className="pl-6 pr-2 text-light-400 appearance-none"
                    value={config.subType}
                    onChange={(e) => onChangeSubType(e.target.value)}
                  >
                    {subTypes.map((subType, i) => (
                      <option key={i} className="disabled:bg-light-800" value={subType}>
                        {t(subType)}
                      </option>
                    ))}
                  </select>
                </div>
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
