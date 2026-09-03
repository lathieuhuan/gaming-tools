import type { AutoRsnElmtType, ElementType, ManualRsnElmType } from "@/types";

export function isAutoRsnElmt(elmt: ElementType): elmt is AutoRsnElmtType {
  return elmt === "pyro" || elmt === "geo" || elmt === "hydro" || elmt === "dendro";
}

export function isManualRsnElmt(elmt: ElementType): elmt is ManualRsnElmType {
  return elmt === "cryo" || elmt === "geo" || elmt === "dendro";
}
