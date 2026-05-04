import { ComponentType, useState } from "react";
import { Button, clsx, cn } from "rond";

import { selectMember, switchIn } from "../actions/build";
import { selectActiveMember, selectProcessor, selectSimulation, useSimulatorStore } from "../store";

// Components
import { CharacterPortrait } from "@/components";
import { TabItem, Tabs } from "../components/Tabs";
import { AbilityEventMenu } from "./AbilityEventMenu";
import { BuffEventMenu } from "./BuffEventMenu";

type EventLauncherTabItem = TabItem & {
  component: ComponentType;
};

const TABS: EventLauncherTabItem[] = [
  {
    label: "Ability",
    value: "ABILITY",
    component: AbilityEventMenu,
  },
  {
    label: "Buff",
    value: "BUFF",
    component: BuffEventMenu,
  },
];

type EventLauncherProps = {
  className?: string;
};

export function EventLauncher({ className }: EventLauncherProps) {
  const memberOrder = useSimulatorStore((state) => selectSimulation(state).memberOrder);
  // const onFieldCode = useSimulatorStore((state) => selectProcessor(state).onFieldCode);
  const team = useSimulatorStore((state) => selectProcessor(state).team);
  const activeMember = useSimulatorStore(selectActiveMember);

  const [activeTab, setActiveTab] = useState(TABS[0]);

  const activeMemberIsOnField = activeMember.code === team.onFieldMember.code;

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex gap-2">
        {memberOrder.map((code) => {
          const member = team.getMember(code);
          const selected = code === activeMember.code;

          return (
            <div key={code}>
              <CharacterPortrait
                className={clsx(selected ? "shadow-hightlight-2 shadow-active" : "cursor-pointer")}
                size="small"
                info={member.data}
                onClick={() => selectMember(code)}
              />
            </div>
          );
        })}
      </div>

      <div className="grow mt-4 flex flex-col custom-scrollbar">
        <div className="flex items-center">
          <Button
            size="small"
            className="ml-auto"
            disabled={activeMemberIsOnField}
            onClick={() => switchIn(activeMember.code)}
          >
            {activeMemberIsOnField ? "On-field" : "Take the field"}
          </Button>
        </div>

        <Tabs
          className="mt-3"
          tabs={TABS}
          value={activeTab.value}
          onChange={(_, tab) => setActiveTab(tab)}
        />

        <div className="mt-4 grow custom-scrollbar">
          <activeTab.component />
        </div>
      </div>
    </div>
  );
}
