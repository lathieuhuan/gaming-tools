import { SelectCoreProps } from "./types";

export function getSelectVariantCls(
  props: Pick<SelectCoreProps, "size" | "align" | "arrowAt" | "transparent">
) {
  return [
    `ron-select--${props.size} ron-select--${props.align} ron-select--arrow-${props.arrowAt}`,
    props.transparent && "ron-select--transparent",
  ];
}
