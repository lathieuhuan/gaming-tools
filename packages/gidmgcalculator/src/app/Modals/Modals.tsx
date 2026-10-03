import { Button, Modal } from "rond";

import { setTourType, updateUI, useUIStore } from "@Store/ui";

// Component
import { TOUR_STEP_ID } from "@/constants";
import { DataRepair } from "./DataRepair";
import { DownloadView } from "./DownloadView";
import { EnhanceNotice } from "./EnhanceNotice";
import { Guides } from "./Guides";
import { Settings } from "./Settings";
import { TravelAgency } from "./TravelAgency";
import { UploadModals } from "./UploadModals";
import { VersionsView } from "./VersionsView";

export function Modals() {
  const modalType = useUIStore((state) => state.appModalType);

  const closeModal = () => updateUI({ appModalType: "" });

  const handleStartTravelerSettingsTour = () => {
    setTourType("TRAVELER_SETTINGS");
    closeModal();
  };

  return (
    <>
      <Modal
        active={modalType === "GUIDES"}
        title="Guides"
        preset="large"
        withHeaderDivider={false}
        bodyCls="pt-0"
        onClose={closeModal}
      >
        <Guides />
      </Modal>

      <Modal.Core
        active={modalType === "VERSIONS"}
        preset="small"
        className="max-h-[90vh] p-4 bg-dark-2 flex flex-col gap-2"
        onClose={closeModal}
      >
        <VersionsView className="grow overflow-y-auto" />

        <div className="mt-4 flex justify-end">
          <Button onClick={closeModal}>Close</Button>
        </div>
      </Modal.Core>

      <TravelAgency
        open={modalType === "TRAVEL_AGENCY"}
        onOpen={() => updateUI({ appModalType: "TRAVEL_AGENCY" })}
        onClose={closeModal}
      />

      <Modal
        active={modalType === "SETTINGS"}
        id={TOUR_STEP_ID.settingsModal}
        title="Settings"
        className={["w-103 bg-dark-2", Modal.LARGE_HEIGHT_CLS]}
        bodyCls="py-0"
        withHeaderDivider={false}
        withFooterDivider={false}
        withActions={true}
        formId="app-settings-form"
        confirmButtonProps={{
          id: TOUR_STEP_ID.saveSettings,
        }}
        onClose={closeModal}
      >
        <Settings id="app-settings-form" onClose={closeModal} />
      </Modal>

      <Modal
        active={modalType === "DOWNLOAD"}
        title="Download"
        preset="small"
        className="bg-dark-1"
        onClose={closeModal}
      >
        <DownloadView />
      </Modal>

      <UploadModals active={modalType === "UPLOAD"} onClose={closeModal} />

      <Modal
        active={modalType === "DATA_REPAIR"}
        title="Fix my data"
        preset="small"
        className="bg-dark-1"
        onClose={closeModal}
      >
        <DataRepair />
      </Modal>

      <Modal
        title="Traveler Settings"
        active={modalType === "TRAVELER_SETTINGS_NOTICE"}
        preset="small"
        className="bg-dark-1"
        withFooterDivider={false}
        withCloseButton={false}
        closeOnMaskClick={false}
        withActions
        focusConfirm
        confirmText="Show me"
        onConfirm={handleStartTravelerSettingsTour}
        onClose={closeModal}
      >
        <p>You can select the Traveler and activate their power-ups in the Settings.</p>
      </Modal>

      <Modal
        title="Enhanceable"
        active={modalType === "CHARACTER_ENHANCEABLE_NOTICE"}
        preset="small"
        className="bg-dark-1"
        withFooterDivider={false}
        withCloseButton={false}
        closeOnMaskClick={false}
        onClose={closeModal}
      >
        <EnhanceNotice onCancel={closeModal} onStartTour={closeModal} />
      </Modal>
    </>
  );
}
