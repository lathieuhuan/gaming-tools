import { ComponentType, useState } from "react";
import { RiTeamFill } from "react-icons/ri";
import { Button, ClassValue, clsx, cn } from "rond";

import { selectMember, switchIn } from "../actions/build";
import { selectActiveMember, selectProcessor, selectSimulation, useSimulatorStore } from "../store";

// Components
import { CharacterPortrait } from "@/components";
import { TabItem, Tabs } from "../components/Tabs";
import { AbilityEventMenu } from "./AbilityEventMenu";
import { BuffEventMenu } from "./BuffEventMenu";
import { TeamModifyEventMenu } from "./TeamModifyEventMenu";

type EventLauncherTabItem = TabItem & {
  component: ComponentType;
};

const TEAM_TABS: EventLauncherTabItem[] = [
  {
    label: "Modify",
    value: "MODIFY",
    component: TeamModifyEventMenu,
  },
];

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
  className?: ClassValue;
};

export function EventLauncher({ className }: EventLauncherProps) {
  const memberOrder = useSimulatorStore((state) => selectSimulation(state).memberOrder);
  const team = useSimulatorStore((state) => selectProcessor(state).team);
  const activeMember = useSimulatorStore(selectActiveMember);

  const [teamSelected, setTeamSelected] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const activeMemberIsOnField = activeMember.code === team.onFieldMember.code;

  const handleSelectTeam = () => {
    setTeamSelected(true);
    setActiveTab(TEAM_TABS[0]);
  };

  const handleSelectMember = (code: number) => {
    selectMember(code);
    setTeamSelected(false);

    if (teamSelected) {
      setActiveTab(TABS[0]);
    }
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex justify-center gap-2">
        <button
          className={clsx(
            "h-full p-3 aspect-square bg-dark-3 rounded-circle zoomin-on-hover",
            teamSelected && "shadow-hightlight-2 shadow-active cursor-default"
          )}
          onClick={handleSelectTeam}
        >
          <RiTeamFill className="size-full" />
        </button>

        {memberOrder.map((code) => {
          const member = team.getMember(code);
          const selected = !teamSelected && code === activeMember.code;

          return (
            <div key={code}>
              <CharacterPortrait
                className={clsx(
                  "size-14",
                  selected ? "shadow-hightlight-2 shadow-active" : "cursor-pointer"
                )}
                size="custom"
                info={member.data}
                onClick={() => handleSelectMember(code)}
              />
            </div>
          );
        })}
      </div>

      <div className="grow mt-4 flex flex-col custom-scrollbar">
        {!teamSelected && (
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
        )}

        <Tabs
          className="mt-3"
          tabs={teamSelected ? TEAM_TABS : TABS}
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
