import { useState } from "react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";
import { Button, Checkbox, CloseButton, Drawer, Input, Modal, SwitchNode } from "rond";

import type { SimulationMember } from "@Src/types";
import type { RootState } from "@Store/store";

import { MAX_SIMULATION_NAME_LENGTH } from "@Src/constants";
import { useStoreSnapshot } from "@Src/features";
import { Utils_ } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  cancelAssembledSimulation,
  completeAssembledSimulation,
  getSimulation,
  startAssembledSimulation,
  updateAssembledSimulation,
  type SimulatorStage,
} from "@Store/simulator-slice";

// Component
import { SimulationList } from "./SimulationList";
import { CalcSetupSelect, UserSetupSelect, type CalcSetupOption, type UserSetupOption } from "./setup-selects";

const select = (state: RootState) => {
  const { name, timeOn } = state.simulator.assembledSimulation;
  return { name, timeOn };
};

type ModalType = "SELECT_CALC_SETUP" | "SELECT_USER_SETUP" | "";

type CreateSimulationSource = "NONE" | "CALCULATOR" | "MY_SETUPS";

const SimulationName = () => {
  const simulationName = useStoreSnapshot((state) => getSimulation(state.simulator)?.name);
  return <span>{simulationName}</span>;
};

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

  const createSimulationOptions: Array<{ label: string; value: CreateSimulationSource }> = [
    { label: "Empty", value: "NONE" },
    { label: "With Calculator Setup", value: "CALCULATOR" },
    { label: "With My Setup", value: "MY_SETUPS" },
  ];

  const onRequestAssembleSimulation = (source: CreateSimulationSource) => {
    switch (source) {
      case "NONE":
        dispatch(startAssembledSimulation());
        closeDrawer();
        break;
      case "CALCULATOR":
        setModalType("SELECT_CALC_SETUP");
        break;
      case "MY_SETUPS":
        setModalType("SELECT_USER_SETUP");
        break;
    }
  };

  const onSelectSetup = (setup: CalcSetupOption | UserSetupOption) => {
    const members = setup.members.map<SimulationMember>((member) => {
      return {
        ...Utils_.createCharacter(member.name, member),
        weapon: Utils_.createWeapon(member.weapon),
        artifacts: member.artifacts.map((artifact) => (artifact ? Utils_.createArtifact(artifact) : null)),
      };
    });

    dispatch(
      startAssembledSimulation({
        name: setup.name,
        members,
      })
    );
    closeModal();
    closeDrawer();
  };

  return (
    <>
      <div className="px-4 py-3 bg-surface-2">
        <div className="h-7 flex items-center">
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
                element: <SimulationName />,
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

              <div className="mt-2 flex flex-wrap gap-x-2 gap-y-3">
                {createSimulationOptions.map((option) => {
                  return (
                    <Button key={option.value} size="small" onClick={() => onRequestAssembleSimulation(option.value)}>
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-heading-color font-medium">My Simulations</p>
            </div>

            <div className="mt-2">
              <SimulationList closeContainer={closeDrawer} />
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
        <CloseButton boneOnly className={Modal.CLOSE_BTN_CLS} onClick={closeModal} />
        <Modal.Header withDivider>Select Setup</Modal.Header>
        <CalcSetupSelect onSelect={onSelectSetup} />
      </Modal.Core>

      <Modal.Core
        active={modalType === "SELECT_USER_SETUP"}
        preset="large"
        className="flex flex-col"
        onClose={closeModal}
      >
        <CloseButton boneOnly className={Modal.CLOSE_BTN_CLS} onClick={closeModal} />
        <Modal.Header withDivider>Select Setup</Modal.Header>
        <UserSetupSelect onSelect={onSelectSetup} />
      </Modal.Core>
    </>
  );
}