import type { CalcSetup } from "@/models/calculator";
import { useCalcStore } from "../calculator-store";

export function updateSetup(setup: CalcSetup, setupId?: number) {
  const { activeId, setupsById } = useCalcStore.getState();
  const id = setupId ?? activeId;

  useCalcStore.setState({
    setupsById: {
      ...setupsById,
      [id]: setup.calculate(),
    },
  });
}
