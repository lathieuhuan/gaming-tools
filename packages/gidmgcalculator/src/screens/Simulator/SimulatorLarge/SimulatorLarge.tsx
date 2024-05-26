import { Level } from "@Backend";
import { useStore } from "@Src/features";
import { CalcArtifact, CalcSetup, CalcWeapon } from "@Src/types";
import { useMemo, useState } from "react";
import { Button, Modal } from "rond";

type Simulation = {
  name: string;
  id: number;
  actions: unknown[];
  members: Array<{
    name: string;
    level: Level;
    cons: number;
    NAs: number;
    ES: number;
    EB: number;
    weapon: CalcWeapon;
    artifacts: Array<CalcArtifact | null>;
  }>;
};

export function SimulatorLarge() {
  const [on, setOn] = useState(false);
  const [simulation, setSimulation] = useState<Simulation>();

  const onSelect = (setup: CalcSetup) => {
    setSimulation({
      id: Date.now(),
      name: "Simulation 1",
      members: [
        {
          ...setup.char,
          weapon: setup.weapon,
          artifacts: setup.artifacts,
        },
      ],
      actions: [],
    });

    setOn(false);
  };

  return (
    <div className="h-full bg-surface-2">
      <Button onClick={() => setOn(true)}>Add setup</Button>

      <p>
        Simulation: {simulation?.name} ({simulation?.id})
      </p>

      <Modal.Core active={on} preset="large" className="flex flex-col" onClose={() => setOn(false)}>
        <SelectSetup onSelect={onSelect} />
      </Modal.Core>
    </div>
  );
}

interface SelectSetupProps {
  onSelect: (setup: CalcSetup) => void;
}
function SelectSetup(props: SelectSetupProps) {
  const store = useStore();

  const setups = useMemo(() => {
    const { setupManageInfos, setupsById } = store.select((state) => state.calculator);
    return setupManageInfos.map((info) => ({
      id: info.ID,
      name: info.name,
      ...setupsById[info.ID],
    }));
  }, []);

  return (
    <>
      <Modal.Header withDivider>Select Setup</Modal.Header>

      <div>
        {setups.map((setup) => {
          return (
            <div key={setup.id} className="px-2 py-1 rounded w-fit bg-surface-3" onClick={() => props.onSelect(setup)}>
              {setup.name}
            </div>
          );
        })}
      </div>
    </>
  );
}