import { useState } from "react";
import { clsx, SwitchNode, type ClassValue } from "rond";

import { $AppWeapon } from "@Src/services";
import { ComplexSelect, ConstellationList, TalentList } from "@Src/components";
import { useActiveMember, SimulationManager } from "@Simulator/ToolboxProvider";
import { AttributesTab, BonusesTab, EquipmentTab } from "./detail-tabs";

interface MemberDetailProps {
  className?: ClassValue;
  simulation: SimulationManager;
}
export function MemberDetail({ className, simulation }: MemberDetailProps) {
  const [activeTab, setActiveTab] = useState("BONUSES");
  const activeMember = useActiveMember();

  if (!activeMember) {
    return null;
  }

  const { info } = activeMember;
  const appWeapon = $AppWeapon.get(info.weapon.code)!;

  return (
    <div className={clsx("p-4", className)}>
      <div className="h-full flex flex-col space-y-3 hide-scrollbar">
        <ComplexSelect
          selectId="member-detail-select"
          size="small"
          value={activeTab}
          options={[
            { label: "Attributes", value: "ATTRIBUTES" },
            { label: "Bonuses", value: "BONUSES" },
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
                value: "BONUSES",
                element: <BonusesTab simulation={simulation} />,
              },
              {
                value: "EQUIPMENT",
                element: (
                  <EquipmentTab
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
                element: <TalentList char={info} />,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
