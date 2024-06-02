import { useMemo, useState } from "react";
import { Button, Modal } from "rond";
import type { CalcSetup } from "@Src/types";

import { useStore } from "@Src/features";
import { $AppSettings } from "@Src/services";
import { useDispatch } from "@Store/hooks";
import { addSimulation } from "@Store/simulator-slice";
import { Setup_ } from "@Src/utils";

import { MemberDetail } from "../simulator-sections";

const mockSetup: CalcSetup = {
  char: {
    name: "Albedo",
    level: "90/90",
    NAs: 1,
    ES: 1,
    EB: 1,
    cons: 0,
  },
  selfBuffCtrls: [
    {
      index: 0,
      activated: false,
    },
    {
      index: 1,
      activated: false,
    },
    {
      index: 2,
      activated: false,
      inputs: [1],
    },
    {
      index: 3,
      activated: false,
    },
    {
      index: 4,
      activated: false,
    },
  ],
  selfDebuffCtrls: [],
  weapon: {
    ID: 1717242701642,
    type: "sword",
    code: 108,
    level: "70/70",
    refi: 1,
  },
  wpBuffCtrls: [],
  artifacts: [null, null, null, null, null],
  artBuffCtrls: [],
  artDebuffCtrls: [
    {
      code: 15,
      activated: false,
      index: 0,
      inputs: [0],
    },
    {
      code: 33,
      activated: false,
      index: 0,
    },
  ],
  party: [null, null, null],
  elmtModCtrls: {
    infuse_reaction: null,
    reaction: null,
    superconduct: false,
    resonances: [],
    absorption: null,
  },
  customBuffCtrls: [],
  customDebuffCtrls: [],
  customInfusion: {
    element: "phys",
  },
};

export function SimulatorLarge() {
  const dispatch = useDispatch();

  const [on, setOn] = useState(false);

  const onClickAddSimulation = () => {
    // setOn(true);
    onSelect(mockSetup);
  };

  const onSelect = (setup: CalcSetup) => {
    dispatch(
      addSimulation({
        members: [
          {
            ...setup.char,
            weapon: setup.weapon,
            artifacts: setup.artifacts,
          },
        ],
        target: Setup_.createTarget({ level: $AppSettings.get("targetLevel") }),
        actions: [],
      })
    );

    setOn(false);
  };

  return (
    <div className="h-full bg-surface-2">
      <Button onClick={onClickAddSimulation}>Add setup</Button>

      <div className="w-76">
        <MemberDetail />
      </div>

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
