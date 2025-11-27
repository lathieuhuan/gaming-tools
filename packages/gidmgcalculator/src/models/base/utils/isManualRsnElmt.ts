import type { ElementType, ManualRsnElmType } from "@/types";

export function isManualRsnElmt(elmt: ElementType): elmt is ManualRsnElmType {
  return ["cryo", "geo", "dendro"].includes(elmt);
}
