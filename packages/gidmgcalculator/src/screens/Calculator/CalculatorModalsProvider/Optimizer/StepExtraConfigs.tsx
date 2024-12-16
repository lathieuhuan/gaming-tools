import { useRef } from "react";
import { Checkbox, InputNumber } from "rond";

export type OptimizerExtraConfig = {
  useOwnedPiece: boolean;
  minEr?: number;
  // minEm?: number;
};

type ConfigKey<TKey extends keyof OptimizerExtraConfig> = TKey;

type RenderCheck = {
  type: "CHECK";
  key: ConfigKey<"useOwnedPiece">;
};

type RenderInput = {
  type: "INPUT";
  key: ConfigKey<"minEr">;
};

type RenderItem = (RenderCheck | RenderInput) & {
  label: string;
};

interface StepExtraConfigsProps {
  id: string;
  initialValue?: OptimizerExtraConfig;
  onChangeValid?: (valid: boolean) => void;
  onSubmit: (config: OptimizerExtraConfig) => void;
}
export function StepExtraConfigs(props: StepExtraConfigsProps) {
  const config = useRef<OptimizerExtraConfig>(props.initialValue || { useOwnedPiece: true, minEr: 100 });

  const renderItems: RenderItem[] = [
    {
      label: "Use artifacts equipped by characters",
      key: "useOwnedPiece",
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

  const onChange = <TKey extends keyof OptimizerExtraConfig>(key: TKey, value: OptimizerExtraConfig[TKey]) => {
    config.current[key] = value;
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
    <form
      id={props.id}
      className="h-full flex flex-col"
      onSubmit={(e) => {
        e.preventDefault();
        props.onSubmit(config.current);
      }}
    >
      <p>Extra Configuration</p>

      <div className="mt-2 space-y-2">
        {renderItems.map((item, index) => {
          return (
            <div key={index} className="h-12 px-3 py-2 bg-surface-1 rounded flex justify-between items-center">
              <p className="text-sm">{item.label}</p>
              {renderControl(item)}
            </div>
          );
        })}
      </div>
    </form>
  );
}
