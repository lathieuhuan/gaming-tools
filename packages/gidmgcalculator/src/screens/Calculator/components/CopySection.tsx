import { FaCopy } from "react-icons/fa";
import { clsx, VersatileSelect } from "rond";

export type Option = {
  value: string | number;
  label: string;
};

type CopySectionProps<TOption> = {
  className?: string;
  options: TOption[];
  defaultIndex?: number;
  onClickCopy: (option: TOption) => void;
};

export function CopySection<TOption extends Option>({
  className,
  options,
  defaultIndex = 0,
  onClickCopy,
}: CopySectionProps<TOption>) {
  return (
    <div className={clsx("flex justify-end", className)}>
      <VersatileSelect
        title="Select Setup"
        className="w-30 h-8 font-semibold"
        defaultValue={options[defaultIndex]?.value}
        options={options}
        action={{
          variant: "primary",
          icon: <FaCopy className="text-base" />,
          onClick: (value) => {
            const chosen = options.find((option) => option.value === value);

            if (chosen) onClickCopy(chosen);
          },
        }}
      />
    </div>
  );
}
