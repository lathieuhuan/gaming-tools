import { useRef, useState } from "react";
import { FaCaretDown, FaCopy, FaTrashAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { Button, ButtonGroup, ConfirmModal, Radio } from "rond";

import { Simulation } from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";
import { selectActiveSimulationId, updateSimulator } from "@Store/simulator-slice";

const selectSimulationss = (state: RootState) => state.simulator.simulations;

type ModalType = "REMOVE_CONFIRM" | "";

export interface SimulatorManagerProps {
  className?: string;
  onClickCreateSimulation: (source: "NONE" | "CALCULATOR" | "USER_SETUPS") => void;
}
export function SimulatorControlCenter(props: SimulatorManagerProps) {
  const dispatch = useDispatch();
  const activeId = useSelector(selectActiveSimulationId);
  const simulations = useSelector(selectSimulationss);
  const [expandedId, setExpandedId] = useState(0);
  const [modalType, setModalType] = useState<ModalType>("");
  const simulationName = useRef("");

  const headingCls = "text-sm text-heading-color font-medium";

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
  };

  const onClickExpand = (id: number) => {
    setExpandedId(id === expandedId ? 0 : id);
  };

  const onRequestRemoveSimulation = (simulation: Simulation) => {
    setModalType("REMOVE_CONFIRM");
    simulationName.current = simulation.name;
  };
  const onConfirmRemoveSimulation = () => {
    let removeIndex = 0;
    const newSimulations: Simulation[] = [];

    for (let i = 0; i < simulations.length; i++) {
      if (simulations[i].id !== expandedId) {
        newSimulations.push(simulations[i]);
      } else {
        removeIndex = i;
      }
    }

    if (newSimulations.length) {
      if (expandedId === activeId) {
        const newActiveIndex = Math.min(removeIndex + 1, newSimulations.length - 1);
        const newSimulation = newSimulations[newActiveIndex];
        const firstMemberData = $AppCharacter.get(newSimulation.members[0].name);

        dispatch(
          updateSimulator({
            activeId: newSimulation.id,
            activeMember: firstMemberData.code,
            simulations: newSimulations,
          })
        );
        return;
      }

      dispatch(
        updateSimulator({
          simulations: newSimulations,
        })
      );
      return;
    }
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
        stage: "PREPARING",
        pendingSimulation: {
          name: simulation.name,
          members: Array.from({ length: 4 }, (_, i) => simulation.members[i] ?? null),
        },
      })
    );
  };

  const onRequestDuplicateSimulation = (simulation: Simulation) => {
    dispatch(
      updateSimulator({
        stage: "PREPARING",
        pendingSimulation: {
          name: simulation.name,
          members: simulation.members,
        },
      })
    );
  };

  return (
    <>
      <div className={props.className}>
        <div>
          <p className={headingCls}>Create Simulation</p>

          <div className="mt-2 pl-4 flex">
            <Button size="small" onClick={() => props.onClickCreateSimulation("NONE")}>
              Empty
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <p className={headingCls}>My Simulations</p>

          <div className="mt-2 pl-2">
            {simulations.map((simulation) => {
              const expanded = simulation.id === expandedId;

              return (
                <div key={simulation.id} className={`rounded overflow-hidden ${expanded ? "bg-surface-3" : ""}`}>
                  <div
                    className={`p-2 flex items-center justify-between ${expanded ? "bg-surface-2" : ""}`}
                    onClick={() => onClickExpand(simulation.id)}
                  >
                    <label className="flex items-center gap-2">
                      <Radio
                        checked={simulation.id === activeId}
                        onChange={() => onChangeActiveSimulation(simulation)}
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
        </div>
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
