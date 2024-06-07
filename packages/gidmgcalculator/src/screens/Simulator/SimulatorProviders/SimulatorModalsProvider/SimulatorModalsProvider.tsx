import { useMemo, useState } from "react";
import { Modal } from "rond";
import type { SimulationMember } from "@Src/types";

import { useDispatch } from "@Store/hooks";
import { addSimulation } from "@Store/simulator-slice";

import { SimulatorModalsContext, SimulatorModalsControl } from "./simulator-modals-context";
import { CalcSetupSelect } from "./CalcSetupSelect";

type ModalType = "ADD_SIMULATION" | "";

interface SimulatorModalsProviderProps {
  children: React.ReactNode;
}
export function SimulatorModalsProvider(props: SimulatorModalsProviderProps) {
  const dispatch = useDispatch();
  const [modalType, setModalType] = useState<ModalType>("");

  const closeModal = () => setModalType("");

  const control = useMemo<SimulatorModalsControl>(
    () => ({
      requestAddSimulation: () => {
        setModalType("ADD_SIMULATION");
      },
    }),
    []
  );

  return (
    <SimulatorModalsContext.Provider value={control}>
      {props.children}

      <Modal.Core active={modalType === "ADD_SIMULATION"} preset="large" className="flex flex-col" onClose={closeModal}>
        <CalcSetupSelect
          onSelect={(setup) => {
            const members: SimulationMember[] = [
              {
                name: setup.char.name,
                info: {
                  ...setup.char,
                  weapon: setup.weapon,
                  artifacts: setup.artifacts,
                },
                bonus: {
                  attributeBonus: [],
                  attackBonus: [],
                },
              },
            ];

            dispatch(addSimulation({ members }));

            closeModal();
          }}
        />
      </Modal.Core>
    </SimulatorModalsContext.Provider>
  );
}
