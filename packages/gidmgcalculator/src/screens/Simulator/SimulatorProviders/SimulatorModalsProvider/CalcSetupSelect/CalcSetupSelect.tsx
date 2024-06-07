import { useMemo } from "react";
import { Modal } from "rond";
import { useStore } from "@Src/features";
import { CalcSetup } from "@Src/types";

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

interface CalcSetupSelectProps {
  onSelect: (setup: CalcSetup) => void;
}
export function CalcSetupSelect(props: CalcSetupSelectProps) {
  const store = useStore();

  const setups = useMemo(() => {
    const { setupManageInfos, setupsById } = store.select((state) => state.calculator);
    return setupManageInfos.map((info) => ({
      id: info.ID,
      name: info.name,
      ...setupsById[info.ID],
    }));
  }, []);

  const onClickSetup = (setup: CalcSetup) => {
    props.onSelect(setup);
  };

  return (
    <>
      <Modal.Header withDivider>Select Setup</Modal.Header>

      <div>
        <p onClick={() => onClickSetup(mockSetup)}>Shortcut</p>
        {setups.map((setup) => {
          return (
            <div key={setup.id} className="px-2 py-1 rounded w-fit bg-surface-3" onClick={() => onClickSetup(setup)}>
              {setup.name}
            </div>
          );
        })}
      </div>
    </>
  );
}
