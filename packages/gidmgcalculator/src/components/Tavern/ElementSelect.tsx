import { IconSelect, IconSelectProps } from "rond";

import type { ElementType } from "@/types";
import { ELEMENT_TYPES } from "@/constants";
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
