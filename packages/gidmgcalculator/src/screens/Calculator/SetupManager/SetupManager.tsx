import { useState } from "react";
import { FaSkull } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { useElementSize, Button, Modal } from "rond";

import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

// Component
import { SetupSelect } from "./SetupSelect";
import { TargetConfig } from "./TargetConfig";
import HighManager from "./HighManager";
import SectionArtifacts from "./SectionArtifacts";
import SectionParty from "./SectionParty";
import SectionTarget from "./SectionTarget/SectionTarget";
import SectionWeapon from "./SectionWeapon/SectionWeapon";

type ModalType = "TARGET_CONFIG" | "";

export default function SetupManager() {
  const dispatch = useDispatch();

  const [modalType, setModalType] = useState<ModalType>("");
  const [targetOverviewOn, setTargetOverviewOn] = useState(true);

  const [ref, { height }] = useElementSize<HTMLDivElement>();

  const closeModal = () => setModalType("");

  return (
    <div ref={ref} className="h-full flex flex-col overflow-hidden">
      <SetupSelect />

      <div className="mt-4 grow hide-scrollbar space-y-2 scroll-smooth">
        <SectionParty />
        <SectionWeapon />
        <SectionArtifacts />

        {targetOverviewOn && (
          <SectionTarget onMinimize={() => setTargetOverviewOn(false)} onEdit={() => setModalType("TARGET_CONFIG")} />
        )}
      </div>

      <div className="mt-4 grid grid-cols-3">
        <div className="flex items-center">
          {!targetOverviewOn && <Button boneOnly icon={<FaSkull />} onClick={() => setModalType("TARGET_CONFIG")} />}
        </div>

        <div className="flex-center">
          <Button
            className="mx-auto"
            icon={<IoDocumentText />}
            onClick={() => dispatch(updateUI({ highManagerActive: true }))}
          />
        </div>
      </div>

      <HighManager height={height} />

      <Modal
        active={modalType === "TARGET_CONFIG"}
        className={[Modal.LARGE_HEIGHT_CLS, "bg-dark-900"]}
        title="Target Configuration (live)"
        bodyCls="grow hide-scrollbar"
        withActions
        showCancel={false}
        confirmText="Close"
        confirmButtonProps={{ variant: "default" }}
        onConfirm={closeModal}
        cancelText="Overview mode"
        moreActions={[
          {
            children: "Overview mode",
            className: targetOverviewOn && "invisible",
            onClick: () => {
              setTargetOverviewOn(true);
              closeModal();
            },
          },
        ]}
        onClose={closeModal}
      >
        <TargetConfig />
      </Modal>
    </div>
  );
}
