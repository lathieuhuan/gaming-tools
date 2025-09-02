import { Checkbox, InputNumber, SelectOption, VersatileSelect } from "rond";

export type SettingControlProps<T = unknown> = {
  type: "CHECK" | "SELECT" | "INPUT";
  label: string;
  description?: string[];
  defaultValue: T;
  options?: SelectOption<string | number>[];
  max?: number;
  onChange: (value: T) => void;
};

export function SettingControl<T>(props: SettingControlProps<T>) {
  const { label, description, defaultValue, onChange } = props;
  let control: React.ReactNode = null;

  switch (props.type) {
    case "CHECK":
      control = (
        <label className="flex items-center justify-between glow-on-hover">
          <span>{label}</span>
          <Checkbox
            className="ml-4"
            defaultChecked={Boolean(defaultValue)}
            onChange={(checked) => onChange(checked as T)}
          />
        </label>
      );
      break;
    case "SELECT":
      control = (
        <div className="flex gap-3 items-center justify-between" style={{ minHeight: "2.25rem" }}>
          <span>{label}</span>
          <div className="w-20 flex shrink-0">
            <VersatileSelect
              title={`Select ${label}`}
              className="font-semibold h-8"
              dropdownCls="font-medium"
              align="right"
              defaultValue={`${defaultValue}`}
              options={props.options}
              onChange={(value) => onChange(value as T)}
            />
          </div>
        </div>
      );
      break;
    case "INPUT":
      control = (
        <div className="flex gap-3 items-center justify-between" style={{ minHeight: "2.25rem" }}>
          <span>{label}</span>
          <div className="w-20 flex shrink-0">
            <InputNumber
              className="w-full font-semibold"
              size="medium"
              defaultValue={Number(defaultValue)}
              max={props.max}
              onChange={(newValue) => {
                onChange(newValue as T);
              }}
            />
          </div>
        </div>
      );
      break;
  }

  return (
    <div>
      {control}
      {description ? (
        <ul className="mt-1 pl-4 text-sm list-disc space-y-1">
          {description.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
