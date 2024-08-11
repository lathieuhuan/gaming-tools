import { useState } from "react";
import { clsx, SwitchNode, type ClassValue } from "rond";

import { $AppWeapon } from "@Src/services";
import { ComplexSelect, ConstellationList } from "@Src/components";
import { useActiveMember, SimulationManager } from "@Simulator/ToolboxProvider";
import { AttributesTab, GrearsTab, TalentsTab } from "./detail-tabs";

interface MemberDetailProps {
  className?: ClassValue;
  simulation: SimulationManager;
}
export function MemberDetail({ className, simulation }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState("ATTRIBUTES");
  const activeMember = useActiveMember();

  if (!activeMember) {
    return null;
  }

  const { info, data } = activeMember;
  const appWeapon = $AppWeapon.get(info.weapon.code)!;
  const visionText = `text-${data.vision} font-bold`;

  return (
    <div className={clsx("p-4", className)}>
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
            { label: "Equipment", value: "EQUIPMENT" },
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
                value: "EQUIPMENT",
                element: (
                  <GrearsTab
                    weapon={activeMember.info.weapon}
                    appWeapon={appWeapon}
                    artifacts={activeMember.info.artifacts}
                  />
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
    </div>
  );
}
