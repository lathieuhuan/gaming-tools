import { useState } from "react";
import { SwitchNode } from "rond";

import type { ActiveMember, SimulationManager } from "@Simulator/simulation-control";
import { $AppWeapon } from "@Src/services";
import { ComplexSelect, ConstellationList } from "@Src/components";
import { useActiveMember, useActiveSimulation } from "../ToolboxProvider";
import { AttributesTab, GrearsTab, TalentsTab } from "./detail-tabs";

interface MemberDetailProps {
  simulation: SimulationManager;
  member: ActiveMember;
}
function MemberDetailCore({ simulation, member }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState("ATTRIBUTES");
  const { info, data } = member;
  const appWeapon = $AppWeapon.get(info.weapon.code)!;
  const visionText = `text-${data.vision} font-bold`;

  return (
    <div className="h-full flex flex-col space-y-3 hide-scrollbar">
      <div className="flex justify-between items-end">
        <h3 className={`text-xl ${visionText}`}>{info.name}</h3>
        <p className="text-surface-border">
          <span className={visionText}>{info.level}</span> | <span className={visionText}>C{info.cons}</span>
        </p>
      </div>

      <ComplexSelect
        selectId="member-detail-select"
        value={activeTab}
        options={[
          { label: "Attributes", value: "ATTRIBUTES" },
          { label: "Gears", value: "GEARS" },
          { label: "Constellation", value: "CONSTELLATION" },
          { label: "Talents", value: "TALENTS" },
        ]}
        onChange={(newTab) => setActiveTab(newTab.toString())}
      />

      <div className="grow hide-scrollbar">
        <SwitchNode
          value={activeTab}
          cases={[
            {
              value: "ATTRIBUTES",
              element: <AttributesTab simulation={simulation} />,
            },
            {
              value: "GEARS",
              element: (
                <GrearsTab weapon={member.info.weapon} appWeapon={appWeapon} artifacts={member.info.artifacts} />
              ),
            },
            {
              value: "CONSTELLATION",
              element: <ConstellationList char={info} />,
            },
            {
              value: "TALENTS",
              element: <TalentsTab char={info} />,
            },
          ]}
        />
      </div>
    </div>
  );
}

export function MemberDetail(props: { className?: string }) {
  const activeSimulation = useActiveSimulation();
  const activeMember = useActiveMember();

  if (!activeSimulation || !activeMember) {
    return null;
  }

  return (
    <div className={props.className}>
      <MemberDetailCore simulation={activeSimulation} member={activeMember} />
    </div>
  );
}
