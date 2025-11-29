import { MonsterInputConfig } from "@/types";
import { Checkbox, VersatileSelect } from "rond";

type InputControlProps = {
  config: MonsterInputConfig;
  input: number;
  onChange: (value: number) => void;
};

export function InputControl({ config, input, onChange }: InputControlProps) {
  const { type: configType = "CHECK" } = config;

  switch (configType) {
    case "CHECK": {
      const checked = input === 1;

      return (
        <Checkbox className="mr-1.5" checked={checked} onChange={() => onChange(checked ? 0 : 1)} />
      );
    }
    case "SELECT":
      if (config.options) {
        const options = config.options.map((option, optionIndex) => {
          return {
            label: typeof option === "string" ? option : option.label,
            value: `${optionIndex}`,
            className: "capitalize",
          };
        });

        return (
          <VersatileSelect
            title={`Select ${config.label}`}
            className="w-32 font-bold capitalize"
            options={[
              {
                label: "None",
                value: "-1",
              },
              ...options,
            ]}
            value={`${input}`}
            onChange={(value) => onChange(+value)}
          />
        );
      }
      return null;
    default:
      return null;
  }
}
