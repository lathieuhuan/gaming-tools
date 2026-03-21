import { AttributeTable } from "@/components/AttributeTable";

import { selectActiveMember, useSimulatorStore } from "../store";
import { clsx } from "rond";

type ActiveMemberViewProps = {
  className?: string;
};

export function ActiveMemberView({ className }: ActiveMemberViewProps) {
  const activeMember = useSimulatorStore(selectActiveMember);

  const data = activeMember.data;
  const allAttrs = activeMember.allAttrsCtrl.finalize();

  return (
    <div className={clsx("flex flex-col", className)}>
      <div>
        <h3 className={`text-lg font-bold text-${data.vision}`}>{data.name}</h3>
      </div>

      <div className="mt-4 grow custom-scrollbar">
        <AttributeTable attributes={allAttrs} />
      </div>
    </div>
  );
}
