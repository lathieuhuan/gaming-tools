import { AttributeTable } from "@/components/AttributeTable";
import { selectActiveMember, useSimulatorStore } from "../store";

export function TabAttributes() {
  const allAttrsCtrl = useSimulatorStore((state) => selectActiveMember(state).allAttrsCtrl);

  return <AttributeTable attributes={allAttrsCtrl.finalize()} />;
}
