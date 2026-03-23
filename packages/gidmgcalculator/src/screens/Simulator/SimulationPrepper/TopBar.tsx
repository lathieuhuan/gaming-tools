import { FaCheck, FaPlus, FaTimes } from "react-icons/fa";
import { Button, Input } from "rond";

import { Team } from "@/models";
import { deleteSimulation, startNewSimulation } from "../actions/prepare";
import { SIMULATION_NAME_MAX_LENGTH } from "../configs";
import { selectSimulation, useSimulatorStore } from "../store";

// Components
import { ElementIcon } from "@/components";
import { SidebarButton } from "../components/SidebarButton";

const containerCls = "flex justify-center bg-dark-2";
const contentCls = "w-full h-16 px-4 flex items-center";

export function TopBarEmpty() {
  return (
    <div className={containerCls}>
      <div className={`${contentCls} gap-2`}>
        <SidebarButton />

        <div className="w-px h-6 bg-dark-line" />

        <Button boneOnly icon={<FaPlus />} onClick={() => startNewSimulation()}>
          New
        </Button>
      </div>
    </div>
  );
}

type TeamBonus = {
  image: string;
  label: string;
  value: number;
};

type TopBarProps = {
  onStart: () => void;
};

export function TopBar({ onStart }: TopBarProps) {
  const { id, memberOrder, members } = useSimulatorStore(selectSimulation);
  const manager = useSimulatorStore((state) =>
    state.managers.find((manager) => manager.id === state.activeId)
  );

  const team = new Team(memberOrder.map((code) => members[code]));
  const { resonances, moonsignLv, witchRiteLv } = team;

  const teamBonuses: TeamBonus[] = [
    {
      image: "https://static.wikia.nocookie.net/gensin-impact/images/5/5e/Icon_Moonsign.png",
      label: "Moonsign",
      value: moonsignLv,
    },
    {
      image: "https://static.wikia.nocookie.net/gensin-impact/images/6/66/Icon_Hexerei.png",
      label: "Hexerei",
      value: witchRiteLv,
    },
  ];

  const handleNameChange = (name: string) => {
    useSimulatorStore.setState((state) => {
      const manager = state.managers.find((manager) => manager.id === id);

      if (manager) {
        manager.name = name;
      }
    });
  };

  return (
    <div className={containerCls}>
      <div className={contentCls}>
        <SidebarButton />

        <div className="mx-2 w-px h-6 bg-dark-line" />

        <div>
          <Input
            value={manager?.name}
            maxLength={SIMULATION_NAME_MAX_LENGTH}
            onChange={handleNameChange}
          />
        </div>

        <div className="ml-6 flex divide-x divide-dark-line">
          {resonances.length > 0 && (
            <div className="px-3 flex items-center gap-1">
              <span className="text-light-4">Resonance</span>
              {resonances.map((resonance) => (
                <ElementIcon key={resonance} type={resonance} size="1.25em" />
              ))}
            </div>
          )}

          {teamBonuses.map((bonus) => {
            if (!bonus.value) {
              return null;
            }

            return (
              <div key={bonus.label} className="px-3 flex items-center gap-1">
                <p>
                  <span className="text-light-4">{bonus.label} Lv.</span>{" "}
                  <span className="font-bold">{bonus.value}</span>
                </p>
                <img src={bonus.image} alt={bonus.label} className="size-7" />
              </div>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button size="small" icon={<FaTimes />} onClick={() => deleteSimulation()}>
            Cancel
          </Button>

          <Button
            size="small"
            variant="primary"
            icon={<FaCheck />}
            disabled={!team.members.length}
            onClick={() => onStart()}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
