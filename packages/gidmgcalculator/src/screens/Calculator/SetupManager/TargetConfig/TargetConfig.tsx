import { Checkbox, InputNumber } from "rond";

import type { AttackElement, ElementType } from "@Src/types";
import { ATTACK_ELEMENTS } from "@Src/constants";
import { useTranslation } from "@Src/hooks";
import { $AppData } from "@Src/services";
import { toArray } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectTarget, updateTarget } from "@Store/calculator-slice";
import { ComboBox } from "./ComboBox";

export function TargetConfig() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const target = useSelector(selectTarget);
  const monster = $AppData.getMonster(target);

  if (!monster) {
    return null;
  }

  const { variant } = monster;
  const inputConfigs = monster.inputConfigs ? toArray(monster.inputConfigs) : [];

  const onChangeElementVariant = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(updateTarget({ variantType: e.target.value as ElementType }));
  };

  const onChangeTargetResistance = (attElmt: AttackElement) => {
    return (value: number) => {
      const newResistances = { ...target.resistances };
      newResistances[attElmt] = value;

      dispatch(updateTarget({ resistances: newResistances }));
    };
  };

  const onChangeTargetInputs = (value: number, index: number) => {
    if (target.inputs) {
      const newInputs = [...target.inputs];

      newInputs[index] = value;
      dispatch(updateTarget({ inputs: newInputs }));
    }
  };

  return (
    <div className="h-full px-2 flex gap-4 hide-scrollbar" onDoubleClick={() => console.log(target)}>
      <div className="w-76 flex flex-col shrink-0">
        <div className="grow overflow-auto flex flex-col">
          <div className="flex">
            <label className="ml-auto flex items-center">
              <span className="mr-4 text-lg text-primary-1">Level</span>
              <InputNumber
                className="w-16 p-2 text-right font-bold"
                value={target.level}
                max={100}
                maxDecimalDigits={0}
                onChange={(value) => dispatch(updateTarget({ level: value }))}
              />
            </label>
          </div>

          <ComboBox
            className="mt-3"
            targetCode={target.code}
            targetTitle={monster.title}
            onSelectMonster={({ monsterCode, inputs, variantType }) => {
              dispatch(
                updateTarget({
                  code: monsterCode,
                  inputs,
                  variantType,
                })
              );
            }}
          />

          {variant?.types.length && target.variantType ? (
            <div className="mt-4 flex justify-end items-center">
              <p className="mr-4 text-light-default">Variant</p>

              <select className="styled-select capitalize" value={target.variantType} onChange={onChangeElementVariant}>
                {variant.types.map((variantType, i) => {
                  return (
                    <option key={i} value={typeof variantType === "string" ? variantType : variantType.value}>
                      {typeof variantType === "string" ? variantType : variantType.label}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : null}

          {inputConfigs.map((config, index) => {
            let inputElement;
            const { type: configType = "CHECK" } = config;

            switch (configType) {
              case "CHECK": {
                const checked = target.inputs?.[index] === 1;

                inputElement = (
                  <Checkbox
                    className="mr-1.5"
                    checked={checked}
                    onChange={() => onChangeTargetInputs(checked ? 0 : 1, index)}
                  />
                );
                break;
              }
              case "SELECT":
                inputElement = (
                  <select
                    className="styled-select capitalize"
                    value={`${target.inputs?.[index] || 0}`}
                    onChange={(e) => onChangeTargetInputs(+e.target.value, index)}
                  >
                    <option value={-1}>None</option>
                    {config.options?.map((option, optionIndex) => {
                      return (
                        <option key={optionIndex} value={optionIndex}>
                          {typeof option === "string" ? option : option.label}
                        </option>
                      );
                    })}
                  </select>
                );
                break;
            }

            return (
              <div key={index} className="mt-4 flex justify-end items-center">
                <label className="mr-4">{config.label}</label>
                {inputElement}
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-76 shrink-0 flex flex-col">
        <div className="space-y-3 grow custom-scrollbar">
          {ATTACK_ELEMENTS.map((attElmt) => {
            return (
              <div key={attElmt} className="flex justify-end items-center">
                <p className={"mr-4 text-base " + (attElmt === "phys" ? "text-light-default" : `text-${attElmt}`)}>
                  {t(attElmt, { ns: "resistance" })}
                </p>
                <InputNumber
                  className="w-20 p-2 text-right font-bold disabled:bg-light-disabled"
                  disabled={target.code !== 0}
                  value={target.resistances[attElmt]}
                  maxDecimalDigits={0}
                  max={100}
                  min={-100}
                  onChange={onChangeTargetResistance(attElmt)}
                />
              </div>
            );
          })}
        </div>

        <p className="mt-4 pr-1 text-sm text-right text-light-default">
          You can search for your target's Resistances on{" "}
          <a
            href="https://genshin-impact.fandom.com/wiki/Resistance#Base_Enemy_Resistances"
            rel="noreferrer"
            target="_blank"
          >
            this page of the Genshin Impact Wiki
          </a>
          .
        </p>
      </div>
    </div>
  );
}
