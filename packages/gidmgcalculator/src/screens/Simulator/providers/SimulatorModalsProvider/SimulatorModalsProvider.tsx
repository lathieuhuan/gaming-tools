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
            // const members: SimulationMember[] = [
            //   {
            //     ...setup.char,
            //     weapon: setup.weapon,
            //     artifacts: setup.artifacts,
            //     attributeBonus: [],
            //     attackBonus: [],
            //   },
            // ];

            const members: SimulationMember[] = [
              {
                name: "Albedo",
                level: "90/90",
                NAs: 1,
                ES: 1,
                EB: 1,
                cons: 6,
                weapon: {
                  ID: 1717242701642,
                  type: "sword",
                  code: 108,
                  level: "70/70",
                  refi: 1,
                },
                artifacts: [null, null, null, null, null],
                attributeBonus: [],
                attackBonus: [],
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
