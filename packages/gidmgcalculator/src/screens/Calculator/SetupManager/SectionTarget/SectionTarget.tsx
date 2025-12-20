import { FaMinus } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Button, InputNumber, VersatileSelect } from "rond";

import { MAX_TARGET_LEVEL } from "@/constants/config";
import { $AppData } from "@/services";
import { useCalcStore } from "@Store/calculator";
import { updateTarget } from "@Store/calculator/actions";
import { Section } from "../_components/Section";

type SectionTargetProps = {
  onMinimize: () => void;
  onEdit: () => void;
};

export default function SectionTarget({ onMinimize, onEdit }: SectionTargetProps) {
  const target = useCalcStore((state) => state.target);
  const { title, names, variant, statuses } = $AppData.getTargetInfo(target);

  return (
    <Section className="px-4 py-3 bg-dark-1 cursor-default relative">
      <div className="absolute top-2 bottom-0 right-2 flex flex-col text-xl text-light-hint">
        <Button
          icon={<FaMinus className="text-lg" />}
          boneOnly
          title="Minimize"
          onClick={onMinimize}
        />
        <Button icon={<MdEdit className="text-lg" />} boneOnly title="Edit" onClick={onEdit} />
      </div>
      <p className="text-sm text-danger-2">Target</p>

      <div className="mt-2 pr-6 flex flex-col items-start">
        {names ? (
          <VersatileSelect
            key={target.code}
            title="Select Target"
            className="w-52"
            transparent
            arrowAt="start"
            options={names.map((name) => ({ label: name, value: name }))}
            defaultValue={names?.[0]}
          />
        ) : (
          <p className="text-lg">{title}</p>
        )}

        {variant && <p className="mt-1">{variant}</p>}

        {statuses.length ? (
          <ul className="pl-4 list-disc text-sm">
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
            max={MAX_TARGET_LEVEL}
            onChange={(value) => updateTarget({ level: value })}
          />
        </label>
      </div>
    </Section>
  );
}
