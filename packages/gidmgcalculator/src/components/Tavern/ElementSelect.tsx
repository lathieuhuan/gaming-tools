import { ELEMENT_TYPES, ElementType } from "@Calculation";
import { IconSelect, IconSelectProps } from "rond";
import { ElementIcon } from "../ElementIcon";

const OPTIONS = ELEMENT_TYPES.map((value) => {
  return {
    value,
    icon: <ElementIcon type={value} />,
  };
});

type ElementSelectProps = Omit<
  IconSelectProps<ElementType>,
  "className" | "iconCls" | "selectedCls" | "options"
>;

export function ElementSelect(props: ElementSelectProps) {
  return (
    <IconSelect
      {...props}
      className="p-1"
      iconCls="text-2xl"
      selectedCls="shadow-hightlight-2 shadow-active"
      options={OPTIONS}
    />
  );
}
