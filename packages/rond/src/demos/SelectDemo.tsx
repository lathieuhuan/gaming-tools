import { useState } from "react";
import { Button, Select, SelectProps, SelectOption, VersatileSelect, FilterSvg } from "@lib/components";

function genOptions(count: number): SelectOption[] {
  return Array.from({ length: count }, (_, i) => {
    const num = i + 1;
    return {
      label: `Option ${num}`,
      value: num,
    };
  });
}

export function SelectDemo() {
  const [transparent, setTransparent] = useState(false);
  const [withAction, setWithAction] = useState(false);
  const [align, setAlign] = useState<SelectProps["align"]>("left");
  const [arrowAt, setArrowAt] = useState<SelectProps["arrowAt"]>("end");

  const cls = {
    row: "grid grid-cols-2 gap-4",
  };

  const selectProps: SelectProps = {
    defaultValue: 2,
    options: genOptions(3),
    transparent,
    align,
    arrowAt,
    action: withAction
      ? {
          icon: <FilterSvg />,
          onClick: console.log,
        }
      : undefined,
  };

  return (
    <div className="max-w-[368px] space-y-6">
      <div className={cls.row}>
        <Button onClick={() => setTransparent(!transparent)}>Transparent: {transparent ? "on" : "off"}</Button>
        <Button onClick={() => setWithAction(!withAction)}>With Action: {withAction ? "on" : "off"}</Button>
        <Button onClick={() => setAlign(align === "right" ? "left" : "right")}>Align: {align}</Button>
        <Button onClick={() => setArrowAt(arrowAt === "end" ? "start" : "end")}>Arrow at: {arrowAt}</Button>
      </div>

      <div className="space-y-4">
        <div className={`font-semibold ${cls.row}`}>
          <span>Select</span>
          <span>VersatileSelect</span>
        </div>

        <div className={cls.row}>
          <Select {...selectProps} />
          <VersatileSelect title="Select" {...selectProps} />
        </div>

        <div className={cls.row}>
          <Select {...selectProps} size="medium" />
          <VersatileSelect title="Select" {...selectProps} size="medium" />
        </div>

        <div>Custom height</div>

        <div className={cls.row}>
          <Select {...selectProps} style={{ height: "2.5rem" }} />
          <VersatileSelect title="Select" {...selectProps} style={{ height: "2.5rem" }} />
        </div>

        <div className={cls.row}>
          <span>Overflow list</span>
          <span>Overflow label</span>
        </div>

        <div className={cls.row}>
          <Select {...selectProps} size="medium" options={genOptions(10)} />
          <VersatileSelect
            title="Select"
            {...selectProps}
            size="medium"
            options={selectProps.options?.concat([{ label: "Reallllly loooong option", value: "unknown" }])}
          />
        </div>
      </div>
    </div>
  );
}
