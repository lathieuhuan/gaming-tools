import { AttributeTable } from "@/components/AttributeTable";
import { selectActiveMember, useSimulatorStore } from "../store";

export function TabAttributes() {
  const attributes = useSimulatorStore((state) => selectActiveMember(state).attrsCtrl.finals);

  return <AttributeTable attributes={attributes} />;
}
