import { Checkbox, clsx, InputNumber, VersatileSelect } from "rond";
import { SettingControlProps } from "./types";

export function SettingControl(props: SettingControlProps) {
  const { label, description, align } = props;
  let control: React.ReactNode = null;

  if (props.type === "CUSTOM") {
    control = (
      <div className="min-h-9 flex gap-3 items-center justify-between">
        <span>{label}</span>
        {props.control}
      </div>
    );
  } else {
    const { type, controlProps } = props;

    switch (type) {
      case "CHECK":
        control = (
          <div className="min-h-9 flex items-center">
            <Checkbox
              {...controlProps}
              className={clsx(
                controlProps.className,
                align === "right" && "w-full flex-row-reverse justify-between"
              )}
            >
              {label}
            </Checkbox>
          </div>
        );
        break;
      case "SELECT":
        control = (
          <div className="min-h-9 flex gap-3 items-center justify-between">
            <span>{label}</span>
            <div className="w-16 flex shrink-0">
              <VersatileSelect
                title={typeof label === "string" ? `Select ${label}` : <span>Select {label}</span>}
                className="font-semibold h-8"
                dropdownCls="font-medium"
                align="right"
                {...controlProps}
              />
            </div>
          </div>
        );
        break;
      case "INPUT":
        control = (
          <div className="min-h-9 flex gap-3 items-center justify-between">
            <span>{label}</span>
            <div className="w-16 flex shrink-0">
              <InputNumber className="w-full font-semibold" size="medium" {...controlProps} />
            </div>
          </div>
        );
        break;
      default:
        props satisfies never;
        break;
    }
  }

  return (
    <div>
      {control}
      {description && (
        <ul className="mt-1 pl-4 text-sm list-disc space-y-1">
          {description.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
