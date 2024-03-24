import { FaMinus } from "react-icons/fa";
import { Button, CloseButton, Modal } from "rond";

import type { TrackerState } from "@Src/types";
import { findById } from "@Src/utils";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { TrackerCore } from "./TrackerCore";

export function Tracker() {
  const dispatch = useDispatch();
  const trackerState = useSelector((state) => state.ui.trackerState);
  const activeSetupName = useSelector((state) => {
    const { activeId, setupManageInfos } = state.calculator;
    return findById(setupManageInfos, activeId)?.name || "";
  });

  const setTrackerState = (newState: TrackerState) => {
    dispatch(updateUI({ trackerState: newState }));
  };

  return (
    <Modal.Core state={trackerState} preset="large" className="flex flex-col" onClose={() => setTrackerState("close")}>
      <div className="absolute top-1 right-1 flex">
        <Button boneOnly icon={<FaMinus />} onClick={() => setTrackerState("hidden")} />
        <CloseButton boneOnly onClick={() => setTrackerState("close")} />
      </div>

      <Modal.Header className="flex items-center">
        Tracking Results
        <span className="ml-2 font-normal text-base text-hint-color">({activeSetupName})</span>
      </Modal.Header>

      <div className="grow px-4 pb-4 overflow-auto">
        <TrackerCore trackerState={trackerState} />
      </div>
    </Modal.Core>
  );
}
