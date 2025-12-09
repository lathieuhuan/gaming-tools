import type { AutoRsnElmtType, ElementType } from "@/types";

export function isAutoRsnElmt(elmt: ElementType): elmt is AutoRsnElmtType {
  return ["pyro", "geo", "hydro", "dendro"].includes(elmt);
}
