import { useState } from "react";
import { Button, Checkbox, Drawer, Input, Modal, SwitchNode } from "rond";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import type { SimulationMember } from "@Src/types";
import type { RootState } from "@Store/store";

import { MAX_SIMULATION_NAME_LENGTH } from "@Src/constants";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  cancelAssembledSimulation,
  completeAssembledSimulation,
  startAssembledSimulation,
  updateAssembledSimulation,
  type SimulatorStage,
} from "@Store/simulator-slice";

import { SimulationList } from "./SimulationList";
import { CalcSetupSelect } from "./CalcSetupSelect";
import { MemberPortraits } from "./MemberPortraits";

const select = (state: RootState) => {
  const { name, timeOn } = state.simulator.assembledSimulation;
  return { name, timeOn };
};

type ModalType = "SELECT_CALC_SETUP" | "";

interface SimulatorHeaderProps {
  stage: SimulatorStage;
}
export function SimulatorHeader({ stage }: SimulatorHeaderProps) {
  const dispatch = useDispatch();
  const { name, timeOn } = useSelector(select);

  const [drawerActive, setDrawerActive] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("");

  const closeDrawer = () => setDrawerActive(false);

  const closeModal = () => setModalType("");

  const onRequestAssembleSimulation = (source: "NONE" | "CALCULATOR") => {
    switch (source) {
      case "NONE":
        dispatch(startAssembledSimulation());
        closeDrawer();
        break;
      case "CALCULATOR":
        setModalType("SELECT_CALC_SETUP");
        break;
    }
  };

  return (
    <>
      <div className="px-4 py-3 bg-surface-2">
        <div className="h-10 flex items-center">
          <Button
            className="mr-4"
            shape="square"
            size="small"
            icon={<FaCaretRight className="text-xl" />}
            onClick={() => setDrawerActive(true)}
          />

          <SwitchNode
            value={stage}
            cases={[
              {
                value: "ASSEMBLING",
                element: (
                  <div className="flex items-center gap-2">
                    <Input
                      value={name}
                      maxLength={MAX_SIMULATION_NAME_LENGTH}
                      onChange={(value) => dispatch(updateAssembledSimulation({ name: value }))}
                    />
                    <Checkbox
                      checked={timeOn}
                      onChange={(checked) => dispatch(updateAssembledSimulation({ timeOn: checked }))}
                    >
                      With time
                    </Checkbox>
                    <Button
                      className="h-7"
                      size="small"
                      shape="square"
                      onClick={() => dispatch(cancelAssembledSimulation())}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-7"
                      size="small"
                      shape="square"
                      disabled={!name.length}
                      onClick={() => dispatch(completeAssembledSimulation())}
                    >
                      Done
                    </Button>
                  </div>
                ),
              },
              {
                value: "RUNNING",
                element: <MemberPortraits />,
              },
            ]}
          />
        </div>
      </div>

      <Drawer
        active={drawerActive}
        position="left"
        style={{
          boxShadow: "0 0 1px #b8b8b8",
        }}
        onClose={() => setDrawerActive(false)}
      >
        <div className="h-full p-4 bg-surface-1 flex flex-col">
          <div className="flex justify-end">
            <Button
              shape="square"
              size="small"
              icon={<FaCaretDown className="text-xl rotate-90" />}
              onClick={closeDrawer}
            />
          </div>

          <div className="grow hide-scrollbar">
            <div>
              <p className="text-sm text-heading-color font-medium">Create Simulation</p>

              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="small" onClick={() => onRequestAssembleSimulation("NONE")}>
                  Empty
                </Button>
                <Button size="small" onClick={() => onRequestAssembleSimulation("CALCULATOR")}>
                  With Calculator Setup
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-heading-color font-medium">My Simulations</p>
            </div>

            <div className="mt-2 pl-2">
              <SimulationList onRequestEditSimulation={closeDrawer} onRequestDuplicateSimulation={closeDrawer} />
            </div>
          </div>
        </div>
      </Drawer>

      <Modal.Core
        active={modalType === "SELECT_CALC_SETUP"}
        preset="large"
        className="flex flex-col"
        onClose={closeModal}
      >
        <CalcSetupSelect
          onSelect={(setup) => {
            const members: SimulationMember[] = [
              {
                ...setup.char,
                weapon: setup.weapon,
                artifacts: setup.artifacts,
              },
            ];

            dispatch(
              startAssembledSimulation({
                name: setup.name,
                members,
              })
            );
            closeModal();
            closeDrawer();
          }}
        />
      </Modal.Core>
    </>
  );
}
