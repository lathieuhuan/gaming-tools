import type { ModInputType } from "@Src/types";

const DEFAULT_INITIAL_VALUES: Record<ModInputType, number> = {
  check: 0,
  level: 1,
  text: 0,
  select: 1,
  stacks: 1,
  anemoable: 0,
  dendroable: 0,
};

export function getDefaultInitialValue(type: ModInputType) {
  return DEFAULT_INITIAL_VALUES[type] ?? 0;
}
