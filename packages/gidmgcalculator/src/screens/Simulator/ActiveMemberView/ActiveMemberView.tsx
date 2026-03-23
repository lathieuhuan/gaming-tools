import { ComponentType, useState } from "react";
import { clsx } from "rond";

import { selectActiveMember, useSimulatorStore } from "../store";

// Components
import { TabItem, Tabs } from "../components/Tabs";
import { TabAttributes } from "./TabAttributes";
import { TabEffects } from "./TabEffects";

type ActiveMemberTabItem = TabItem & {
  component: ComponentType;
};

const TABS: ActiveMemberTabItem[] = [
  {
    label: "Attributes",
    value: "ATTRIBUTES",
    component: TabAttributes,
  },
  {
    label: "Effects",
    value: "EFFECTS",
    component: TabEffects,
  },
];

type ActiveMemberViewProps = {
  className?: string;
};

export function ActiveMemberView({ className }: ActiveMemberViewProps) {
  const data = useSimulatorStore((state) => selectActiveMember(state).data);

  const [activeTab, setActiveTab] = useState<ActiveMemberTabItem>(TABS[0]);

  return (
    <div
      className={clsx("flex flex-col", className)}
      onDoubleClick={() => {
        console.info(selectActiveMember(useSimulatorStore.getState()));
      }}
    >
      <div>
        <h3 className={`text-lg font-bold text-${data.vision}`}>{data.name}</h3>
      </div>

      <Tabs
        className="mt-3"
        tabs={TABS}
        value={activeTab.value}
        onChange={(_, tab) => setActiveTab(tab)}
      />

      <div className="mt-3 grow custom-scrollbar">
        <activeTab.component />
      </div>
    </div>
  );
}
