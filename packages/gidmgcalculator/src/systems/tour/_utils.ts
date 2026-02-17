import { Fluent } from "@/utils/Fluent";

export function $(id: string) {
  return new Fluent(document.getElementById(id));
}
