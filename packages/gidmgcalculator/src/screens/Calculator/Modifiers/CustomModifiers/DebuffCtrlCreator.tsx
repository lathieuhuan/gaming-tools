import { useState, useRef, FormEvent } from "react";
import { InputNumber } from "rond";

import type { CustomDebuffCtrl, CustomDebuffCtrlType } from "@Src/types";
import { ATTACK_ELEMENTS } from "@Src/constants";
import { useTranslation } from "@Src/hooks";
import { useDispatch } from "@Store/hooks";
import { updateCustomDebuffCtrls } from "@Store/calculator-slice";

interface DebuffCtrlCreatorProps {
  onClose: () => void;
}
export default function DebuffCtrlCreator({ onClose }: DebuffCtrlCreatorProps) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const inputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<CustomDebuffCtrl>({
    type: "def",
    value: 0,
  });

  const onChangeType = (type: string) => {
    setConfig((prev) => ({
      ...prev,
      type: type as CustomDebuffCtrlType,
    }));

    inputRef.current?.focus();
  };

  const onDone = () => {
    dispatch(updateCustomDebuffCtrls({ actionType: "ADD", ctrls: config }));
    onClose();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onDone();
  };

  return (
    <form id="debuff-creator" className="mx-auto py-4 px-2 flex items-center" onSubmit={onSubmit}>
      <select
        className="pr-2 text-light-default text-right text-last-right"
        value={config.type}
        onChange={(e) => onChangeType(e.target.value)}
      >
        {["def", ...ATTACK_ELEMENTS].map((option) => (
          <option key={option} value={option}>
            {t(option, { ns: "resistance" })} reduction
          </option>
        ))}
      </select>
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
            onDone();
          }
        }}
      />
      <span className="ml-2">%</span>
    </form>
  );
}
