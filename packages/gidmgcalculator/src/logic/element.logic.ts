import type { AutoRsnElmtType, ElementType, ManualRsnElmtType } from "@/types";

export function isAutoRsnElmt(elmt: ElementType): elmt is AutoRsnElmtType {
  return ["pyro", "geo", "hydro", "dendro"].includes(elmt);
}

export function isManualRsnElmt(elmt: ElementType): elmt is ManualRsnElmtType {
  return ["cryo", "geo", "dendro"].includes(elmt);
}
