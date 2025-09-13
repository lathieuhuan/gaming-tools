import { useState, useRef } from "react";
import { InputNumber, VersatileSelect } from "rond";
import { ATTACK_ELEMENTS } from "@Calculation";

import type { CustomDebuffCtrl, CustomDebuffCtrlType } from "@/types";
import { useTranslation } from "@/hooks";
import { useDispatch } from "@Store/hooks";
import { updateCustomDebuffCtrls } from "@Store/calculator-slice";

type DebuffCtrlFormProps = {
  id: string;
  onSubmit: () => void;
};

export function DebuffCtrlForm({ id, onSubmit }: DebuffCtrlFormProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<CustomDebuffCtrl>({
    type: "def",
    value: 0,
  });

  const handleTypeChange = (type: string) => {
    setConfig((prev) => ({
      ...prev,
      type: type as CustomDebuffCtrlType,
    }));

    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    dispatch(updateCustomDebuffCtrls({ actionType: "ADD", ctrls: config }));
    onSubmit();
  };

  return (
    <form
      id={id}
      className="mx-auto py-4 px-2 flex items-center"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <VersatileSelect
        title="Select"
        className="h-8"
        style={{ width: "12rem" }}
        arrowAt="start"
        transparent
        dropdownCls="z-50"
        options={["def", ...ATTACK_ELEMENTS].map((option) => ({
          label: `${t(option, { ns: "resistance" })} reduction`,
          value: option,
        }))}
        value={config.type}
        onChange={(value) => handleTypeChange(value as string)}
      />
      <InputNumber
        ref={inputRef}
        className="ml-4 w-16 font-semibold"
        size="medium"
        autoFocus
        max={200}
        maxDecimalDigits={1}
        step="0.1"
        onChange={(value) => {
          setConfig((prev) => ({ ...prev, value }));
        }}
        value={config.value}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />
      <span className="ml-2">%</span>
    </form>
  );
}
