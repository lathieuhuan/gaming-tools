import { Fluent } from "ron-utils";

export function $(id: string) {
  return new Fluent(document.getElementById(id));
}
