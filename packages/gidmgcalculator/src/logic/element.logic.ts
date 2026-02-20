import type { AutoRsnElmtType, ElementType, ManualRsnElmType } from "@/types";

export function isAutoRsnElmt(elmt: ElementType): elmt is AutoRsnElmtType {
  return ["pyro", "geo", "hydro", "dendro"].includes(elmt);
}

export function isManualRsnElmt(elmt: ElementType): elmt is ManualRsnElmType {
  return ["cryo", "geo", "dendro"].includes(elmt);
}
