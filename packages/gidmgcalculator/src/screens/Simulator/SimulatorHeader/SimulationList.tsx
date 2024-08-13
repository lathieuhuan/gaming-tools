import { useRef, useState } from "react";
import { FaCaretDown, FaCopy, FaTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { ButtonGroup, ConfirmModal, Radio, clsx } from "rond";
import type { Simulation } from "@Src/types";
import type { RootState } from "@Store/store";

import { MAX_SIMULATION_NAME_LENGTH } from "@Src/constants";
import { $AppCharacter } from "@Src/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { selectActiveSimulationId, updateSimulator } from "@Store/simulator-slice";

const selectSimulationss = (state: RootState) => state.simulator.simulations;

type ModalType = "REMOVE_CONFIRM" | "";

interface SimulationListProps {
  closeContainer?: () => void;
}
export function SimulationList({ closeContainer }: SimulationListProps) {
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveSimulationId);
  const simulations = useSelector(selectSimulationss);
  const [expandedId, setExpandedId] = useState(activeId);
  const [modalType, setModalType] = useState<ModalType>("");
  const simulationName = useRef("");

  const closeModal = () => setModalType("");

  const onChangeActiveSimulation = (simulation: Simulation) => {
    const firstMemberData = $AppCharacter.get(simulation.members[0].name);

    dispatch(
      updateSimulator({
        activeId: simulation.id,
        activeMember: firstMemberData.code,
        stage: "RUNNING",
      })
    );
    closeContainer?.();
  };

  const onClickExpand = (id: number) => {
    setExpandedId(id === expandedId ? 0 : id);
  };

  const onRequestRemoveSimulation = (simulation: Simulation) => {
    setModalType("REMOVE_CONFIRM");
    simulationName.current = simulation.name;
  };
  const onConfirmRemoveSimulation = () => {
    const newSimulations = simulations.filter((simulation) => simulation.id !== expandedId);

    dispatch(
      updateSimulator({
        activeId: 0,
        activeMember: 0,
        stage: "WAITING",
        simulations: newSimulations,
      })
    );
  };

  const onRequestEditSimulation = (simulation: Simulation) => {
    dispatch(
      updateSimulator({
        stage: "ASSEMBLING",
        assembledSimulation: simulation,
      })
    );
    closeContainer?.();
  };

  const onRequestDuplicateSimulation = (simulation: Simulation) => {
    const addedString = "(Copy)";

    dispatch(
      updateSimulator({
        stage: "ASSEMBLING",
        assembledSimulation: {
          ...simulation,
          id: Date.now(),
          name: clsx(simulation.name.slice(0, MAX_SIMULATION_NAME_LENGTH - addedString.length - 1), addedString),
        },
      })
    );
    closeContainer?.();
  };

  return (
    <>
      <div>
        {simulations.map((simulation) => {
          const expanded = simulation.id === expandedId;

          return (
            <div key={simulation.id} className={`rounded overflow-hidden ${expanded ? "bg-surface-3" : ""}`}>
              <div
                className={`p-2 flex items-center justify-between ${expanded ? "bg-surface-2" : ""}`}
                onClick={() => onClickExpand(simulation.id)}
              >
                <label
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    // Clicking on label will fire click event on radio, results in 2 events bubbling
                    // to the div where onClickExpand is used to handle click
                    // -> stopPropagation here & radio
                    e.stopPropagation();
                  }}
                >
                  <Radio
                    checked={simulation.id === activeId}
                    onChange={() => onChangeActiveSimulation(simulation)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{simulation.name}</span>
                </label>

                <span className="shrink-0">
                  <FaCaretDown className={`text-xl ${expanded ? "rotate-180" : ""}`} />
                </span>
              </div>

              {expanded ? (
                <div className="py-2 pl-6 pr-4">
                  <ButtonGroup
                    className="w-fit pl-2"
                    buttons={[
                      {
                        title: "Remove",
                        icon: <FaTrashAlt />,
                        size: "custom",
                        className: "w-7 h-7",
                        onClick: () => onRequestRemoveSimulation(simulation),
                      },
                      {
                        title: "Edit",
                        icon: <MdEdit className="text-lg" />,
                        size: "custom",
                        className: "w-7 h-7",
                        onClick: () => onRequestEditSimulation(simulation),
                      },
                      {
                        title: "Duplicate",
                        icon: <FaCopy />,
                        size: "custom",
                        className: "w-7 h-7",
                        onClick: () => onRequestDuplicateSimulation(simulation),
                      },
                    ]}
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        active={modalType === "REMOVE_CONFIRM"}
        message={`Remove Simulation "${simulationName.current}"`}
        danger
        focusConfirm
        onConfirm={onConfirmRemoveSimulation}
        onClose={closeModal}
      />
    </>
  );
}
