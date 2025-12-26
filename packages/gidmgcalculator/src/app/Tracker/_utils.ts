import { round } from "@/utils";

export function getTotalRecordValue(list: Array<{ value: number }>) {
  return round(
    list.reduce((accumulator, record) => accumulator + record.value, 0),
    2
  );
}
