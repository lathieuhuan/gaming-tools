import { useRef } from "react";
import { Checkbox, InputNumber } from "rond";
import type { OptimizerExtraConfigs } from "@Calculation";

type ConfigKey<TKey extends keyof OptimizerExtraConfigs> = TKey;

type RenderCheck = {
  type: "CHECK";
  key: ConfigKey<"preferSet">;
};

type RenderInput = {
  type: "INPUT";
  key: ConfigKey<"minEr">;
};

type RenderItem = (RenderCheck | RenderInput) & {
  label: string;
};

type ExtraConfigsProps = {
  initialValue?: OptimizerExtraConfigs;
  onChange?: (value: OptimizerExtraConfigs) => void;
};

export function ExtraConfigs(props: ExtraConfigsProps) {
  const config = useRef<OptimizerExtraConfigs>(props.initialValue || { preferSet: true, minEr: 100 });

  const renderItems: RenderItem[] = [
    {
      label: "Prefer combination of same artifact sets",
      key: "preferSet",
      type: "CHECK",
    },
    {
      label: "Minimum Energy Recharge",
      key: "minEr",
      type: "INPUT",
    },
    // {
    //   label: "Minimum Elemental Mastery",
    //   key: "minEr",
    //   type: "INPUT",
    // },
  ];

  const onChange = <TKey extends keyof OptimizerExtraConfigs>(key: TKey, value: OptimizerExtraConfigs[TKey]) => {
    config.current[key] = value;
    props.onChange?.(config.current);
  };

  const renderControl = (item: RenderItem) => {
    switch (item.type) {
      case "CHECK":
        return (
          <Checkbox defaultChecked={config.current[item.key]} onChange={(checked) => onChange(item.key, checked)} />
        );
      case "INPUT":
        return (
          <InputNumber
            className="w-14 font-medium"
            defaultValue={config.current[item.key]}
            onChange={(value) => onChange(item.key, value)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full space-y-2">
      {renderItems.map((item, index) => {
        return (
          <div key={index} className="h-12 px-3 py-2 bg-dark-1 rounded flex justify-between items-center">
            <p className="text-sm">{item.label}</p>
            {renderControl(item)}
          </div>
        );
      })}
    </div>
  );
}
