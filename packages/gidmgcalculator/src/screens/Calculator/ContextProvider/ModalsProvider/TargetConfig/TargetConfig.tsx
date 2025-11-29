import { clsx, InputNumber, Modal, VersatileSelect } from "rond";

import type { AttackElement, ElementType } from "@/types";

import { ATTACK_ELEMENTS, MAX_TARGET_LEVEL } from "@/constants";
import { useTranslation } from "@/hooks";
import Array_ from "@/utils/Array";
import { useCalcStore } from "@Store/calculator";
import { updateTarget } from "@Store/calculator/actions";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectTargetConfig, updateUI } from "@Store/ui-slice";

import { ComboBox } from "./ComboBox";
import { InputControl } from "./InputControl";

function TargetConfigCore() {
  const { t } = useTranslation();
  const target = useCalcStore((state) => state.target);

  const monster = target.data;
  const variantTypes = monster.variant?.types;
  const inputConfigs = monster.inputConfigs ? Array_.toArray(monster.inputConfigs) : [];

  const onChangeElementVariant = (value: string) => {
    updateTarget({ variantType: value as ElementType });
  };

  const onChangeTargetResistance = (attElmt: AttackElement) => {
    return (value: number) => {
      updateTarget({
        resistances: {
          ...target.resistances,
          [attElmt]: value,
        },
      });
    };
  };

  const onChangeInput = (value: number, index: number) => {
    const { inputs = [] } = target;
    inputs[index] = value;

    updateTarget({ inputs });
  };

  return (
    <div
      className="h-full px-2 flex gap-4 hide-scrollbar"
      onDoubleClick={() => console.log(target)}
    >
      <div className="w-76 flex flex-col shrink-0">
        <div className="grow overflow-auto flex flex-col">
          <div className="flex">
            <label className="ml-auto flex items-center">
              <span className="mr-4 text-lg text-primary-1">Level</span>
              <InputNumber
                className="w-16 font-semibold"
                size="medium"
                value={target.level}
                max={MAX_TARGET_LEVEL}
                maxDecimalDigits={0}
                onChange={(value) => updateTarget({ level: value })}
              />
            </label>
          </div>

          <ComboBox
            className="mt-3"
            targetCode={target.code}
            targetTitle={monster.title}
            onSelectMonster={({ monsterCode, inputs, variantType }) => {
              updateTarget({
                code: monsterCode,
                inputs,
                variantType,
              });
            }}
          />

          {variantTypes?.length && target.variantType ? (
            <div className="mt-4 flex justify-end items-center">
              <p className="mr-4 text-light-1">Variant</p>

              <VersatileSelect
                title="Select Variant"
                className="w-24 h-8 font-bold capitalize"
                options={variantTypes.map((variantType) => {
                  const item = typeof variantType === "string" ? variantType : variantType.value;
                  return {
                    label: item,
                    value: item,
                    className: "capitalize",
                  };
                })}
                value={target.variantType}
                onChange={onChangeElementVariant}
              />
            </div>
          ) : null}

          {inputConfigs.map((config, index) => {
            return (
              <div key={index} className="mt-4 flex justify-end items-center">
                <label className="mr-4">{config.label}</label>
                <InputControl
                  config={config}
                  input={target.inputs?.[index] || 0}
                  onChange={(value) => onChangeInput(value, index)}
                />
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
                <p
                  className={clsx(
                    "mr-4 text-base",
                    attElmt === "phys" ? "text-light-1" : `text-${attElmt}`
                  )}
                >
                  {t(attElmt, { ns: "resistance" })}
                </p>
                <InputNumber
                  className="w-20 font-semibold"
                  size="medium"
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

        <p className="mt-4 pr-1 text-sm text-right text-light-1">
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

export function TargetConfig() {
  const dispatch = useDispatch();
  const targetConfig = useSelector(selectTargetConfig);

  const updateTargetConfig = (active: boolean, overviewed = targetConfig.overviewed) => {
    dispatch(updateUI({ targetConfig: { active, overviewed } }));
  };

  const closeTargetConfig = () => {
    updateTargetConfig(false);
  };

  return (
    <Modal
      active={targetConfig.active}
      className={[Modal.LARGE_HEIGHT_CLS, "bg-dark-1"]}
      title="Target Configuration (live)"
      bodyCls="grow hide-scrollbar"
      withActions
      showCancel={false}
      confirmText="Close"
      confirmButtonProps={{ variant: "default" }}
      cancelText="Overview mode"
      moreActions={[
        {
          children: "Overview mode",
          className: targetConfig.overviewed && "invisible",
          onClick: () => {
            updateTargetConfig(false, true);
          },
        },
      ]}
      onConfirm={closeTargetConfig}
      onClose={closeTargetConfig}
    >
      <TargetConfigCore />
    </Modal>
  );
}
