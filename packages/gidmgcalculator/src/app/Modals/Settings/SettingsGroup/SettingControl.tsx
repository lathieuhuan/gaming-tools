import { Checkbox, InputNumber, VersatileSelect } from "rond";
import { SettingControlProps } from "./types";

export function SettingControl(props: SettingControlProps) {
  const { type, label, description, ...rest } = props;
  let control: React.ReactNode = null;

  switch (type) {
    case "CHECK":
      control = <Checkbox {...(rest as any)}>{label}</Checkbox>;
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
              {...(rest as any)}
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
            <InputNumber className="w-full font-semibold" size="medium" {...(rest as any)} />
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
