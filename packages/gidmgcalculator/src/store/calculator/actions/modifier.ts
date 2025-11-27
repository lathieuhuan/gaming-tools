import type { ElementalEvent } from "@/types";

import { useCalcStore } from "../calculator-store";
import { onActiveSetup } from "../utils";

export const updateElementalEvent = (data: Partial<ElementalEvent>) => {
  useCalcStore.setState(
    onActiveSetup((setup) => {
      setup.elmtEvent = {
        ...setup.elmtEvent,
        ...data,
      };
    })
  );
};
