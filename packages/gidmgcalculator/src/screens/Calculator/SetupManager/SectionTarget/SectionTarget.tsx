import { useEffect, useState } from "react";
import { FaEdit, FaMinus } from "react-icons/fa";
import { Button, InputNumber, VersatileSelect } from "rond";

import { $AppData } from "@Src/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectTarget, updateTarget } from "@Store/calculator-slice";

import styles from "../SetupManager.styles.module.scss";

interface SectionTargetProps {
  onMinimize: () => void;
  onEdit: () => void;
}
export default function SectionTarget({ onMinimize, onEdit }: SectionTargetProps) {
  const dispatch = useDispatch();
  const target = useSelector(selectTarget);
  const [name, setName] = useState<string>();
  const { title, names, variant, statuses } = $AppData.getTargetInfo(target);

  useEffect(() => {
    setName(names?.[0]);
  }, [target.code]);

  return (
    <div className={"px-4 py-3 bg-surface-1 cursor-default relative " + styles.section}>
      <div className="absolute top-2 bottom-0 right-2 flex flex-col text-xl text-hint-color space-y-1">
        <Button icon={<FaMinus />} boneOnly onClick={onMinimize} />
        <Button icon={<FaEdit />} boneOnly onClick={onEdit} />
      </div>
      <p className="text-sm text-danger-3">Target</p>

      <div className="mt-2 pr-6 flex flex-col items-start">
        {names ? (
          <VersatileSelect
            title="Select Target"
            className="w-52"
            transparent
            arrowAt="start"
            options={names.map((name) => ({ label: name, value: name }))}
            value={name}
            onChange={(value) => setName(value as string)}
          />
        ) : (
          <p className="text-lg">{title}</p>
        )}

        {variant && <p className="mt-1">{variant}</p>}

        {statuses.length ? (
          <ul className="mt-1 pl-4 list-disc">
            {statuses.map((status, i) => {
              return <li key={i}>{status}</li>;
            })}
          </ul>
        ) : null}

        <label className="mt-3 flex items-center gap-4">
          <span>Level</span>
          <InputNumber
            className="w-14 font-semibold"
            value={target.level}
            max={100}
            onChange={(value) => dispatch(updateTarget({ level: value }))}
          />
        </label>
      </div>
    </div>
  );
}
