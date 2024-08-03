import { useState } from "react";
import { Button, Drawer, Input, Modal } from "rond";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

import { RootState } from "@Store/store";
import type { SimulationMember } from "@Src/types";
import { useStore } from "@Src/features";
import { useDispatch, useSelector } from "@Store/hooks";
import {
  SimulatorStage,
  cancelPendingSimulation,
  createSimulation,
  prepareSimulation,
  updatePendingSimulationName,
} from "@Store/simulator-slice";

import { SimulatorControlCenter } from "../SimulatorControlCenter";
import { CalcSetupSelect } from "./CalcSetupSelect";

const selectPendingName = (state: RootState) => state.simulator.pendingSimulation.name;

type ModalType = "SELECT_CALC_SETUP" | "";

interface SimulatorHeaderProps {
  stage: SimulatorStage;
}
export function SimulatorHeader({ stage }: SimulatorHeaderProps) {
  const dispatch = useDispatch();
  const store = useStore();
  const pendingName = useSelector(selectPendingName);

  const [drawerActive, setDrawerActive] = useState(false);
  const [modalType, setModalType] = useState<ModalType>("");

  const closeDrawer = () => setDrawerActive(false);

  const closeModal = () => setModalType("");

  const onChangePendingName = (value: string) => {
    dispatch(updatePendingSimulationName(value));
  };

  const createEmptyPendingSimulation = () => {
    dispatch(prepareSimulation());
  };

  const onClickCancelPendingSimulation = () => {
    dispatch(cancelPendingSimulation());
  };

  const onClickCreateSimulation = () => {
    const pending = store.select((state) => state.simulator.pendingSimulation);
    const members: SimulationMember[] = [];

    for (const member of pending.members) {
      if (member) members.push(member);
    }
    if (members.length) {
      dispatch(
        createSimulation({
          name: pending.name,
          members,
        })
      );
    }
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

          {stage === "PREPARING" ? (
            <div className="flex items-center gap-2">
              <Input value={pendingName} maxLength={24} onChange={onChangePendingName} />
              <Button className="h-7" size="small" shape="square" onClick={onClickCancelPendingSimulation}>
                Cancel
              </Button>
              <Button
                className="h-7"
                size="small"
                shape="square"
                disabled={!pendingName.length}
                onClick={onClickCreateSimulation}
              >
                Create
              </Button>
            </div>
          ) : null}
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

          <SimulatorControlCenter
            className="grow hide-scrollbar"
            onClickCreateSimulation={(source) => {
              switch (source) {
                case "NONE":
                  createEmptyPendingSimulation();
                  break;
              }
              closeDrawer();
            }}
          />
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

            dispatch(createSimulation({ name: "[missing]", members }));
            closeModal();
          }}
        />
      </Modal.Core>
    </>
  );
}
