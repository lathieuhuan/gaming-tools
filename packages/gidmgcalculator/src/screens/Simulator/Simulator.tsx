import { useState } from "react";
import { Button, Drawer, Input } from "rond";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

import type { SimulationMember } from "@Src/types";
import { useStore } from "@Src/features";
import { useDispatch } from "@Store/hooks";
import { createSimulation, updatePendingMembers } from "@Store/simulator-slice";

// Component
import { SimulationMaker } from "./SimulationMaker";
import { SimulatorControlCenter } from "./SimulatorControlCenter";
import { ToolboxProvider } from "./ToolboxProvider";
import { BonusDisplayer } from "./BonusDisplayer";
import { HitEventHost } from "./HitEventHost";
import { MemberDetail } from "./MemberDetail";
import { ModifyEventHost } from "./ModifyEventHost";
import { Timeline } from "./Timeline";

const DEFAULT_SIMULATION_NAME = "New Simulation";

export function Simulator() {
  const dispatch = useDispatch();
  const store = useStore();

  const [drawerActive, setDrawerActive] = useState(false);
  const [makerActive, setMakerActive] = useState(store.select((state) => state.simulator.pendingMembers.length > 0));
  const [newSimulationName, setNewSimulationName] = useState("");

  const closeDrawer = () => setDrawerActive(false);

  const createEmptyPendingSimulation = () => {
    setMakerActive(true);
    setNewSimulationName(DEFAULT_SIMULATION_NAME);
    dispatch(updatePendingMembers([null, null, null, null]));
  };

  const onClickCancelPendingSimulation = () => {
    setMakerActive(false);
    dispatch(updatePendingMembers([]));
  };

  const onClickCreateSimulation = () => {
    const members: SimulationMember[] = [];

    for (const member of store.select((state) => state.simulator.pendingMembers)) {
      if (member) members.push(member);
    }
    if (members.length) {
      dispatch(
        createSimulation({
          name: newSimulationName,
          members,
        })
      );
      setMakerActive(false);
    }
  };

  return (
    <>
      <div className="h-full bg-surface-3 flex flex-col">
        <div className="px-4 py-3 bg-surface-2">
          <div className="h-7 flex items-center">
            <Button
              className="mr-4"
              shape="square"
              size="small"
              icon={<FaCaretRight className="text-xl" />}
              onClick={() => setDrawerActive(true)}
            />

            {makerActive ? (
              <div className="flex items-center gap-2">
                <Input value={newSimulationName} maxLength={24} onChange={setNewSimulationName} />
                <Button className="h-7" size="small" shape="square" onClick={onClickCancelPendingSimulation}>
                  Cancel
                </Button>
                <Button
                  className="h-7"
                  size="small"
                  shape="square"
                  disabled={!newSimulationName.length}
                  onClick={onClickCreateSimulation}
                >
                  Create
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="grow overflow-hidden">{makerActive ? <SimulationMaker /> : <SimulationManager />}</div>
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
    </>
  );
}

function SimulationManager() {
  return (
    <ToolboxProvider>
      <div className="px-4 py-3 h-full overflow-hidden">
        <div className="h-full flex space-x-2 custom-scrollbar">
          <ModifyEventHost className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
          <HitEventHost className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />

          <div className="h-full grow overflow-auto shrink-0">
            <Timeline className="px-3 py-4 rounded-md bg-surface-1" />
          </div>

          <BonusDisplayer className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
          <MemberDetail className="w-76 p-4 h-full rounded-md bg-surface-1 overflow-auto shrink-0" />
        </div>
      </div>
    </ToolboxProvider>
  );
}
