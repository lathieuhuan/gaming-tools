import { Modal } from "rond";

import { updateUI, useUIStore } from "@Store/ui";

// Component
import { DataRepair } from "./DataRepair";
import { Donate } from "./Donate";
import { Download } from "./Download";
import { EnhanceNoticeModal } from "./EnhanceNotice";
import { Guides } from "./Guides";
import { SettingsModal } from "./Settings";
import { TourCatalogue } from "./TourCatalogue";
import { UploadModals } from "./Upload";

export function Modals() {
  const appModalType = useUIStore((state) => state.appModalType);

  const closeModal = () => updateUI({ appModalType: "" });

  return (
    <>
      <Modal
        active={appModalType === "GUIDES"}
        title="Guides"
        preset="large"
        withHeaderDivider={false}
        bodyCls="pt-0"
        onClose={closeModal}
      >
        <Guides />
      </Modal>

      <SettingsModal active={appModalType === "SETTINGS"} onClose={closeModal} />

      <Modal
        active={appModalType === "DOWNLOAD"}
        title="Download"
        preset="small"
        className="bg-dark-1"
        onClose={closeModal}
      >
        <Download />
      </Modal>

      <UploadModals active={appModalType === "UPLOAD"} onClose={closeModal} />

      <Modal
        active={appModalType === "DONATE"}
        title={<p className="text-center">Donate</p>}
        preset="small"
        withHeaderDivider={false}
        className="bg-dark-1"
        onClose={closeModal}
      >
        <Donate />
      </Modal>

      <Modal
        active={appModalType === "DATA_REPAIR"}
        title="Fix my data"
        preset="small"
        className="bg-dark-1"
        onClose={closeModal}
      >
        <DataRepair />
      </Modal>

      <Modal
        active={appModalType === "TOUR_CATALOGUE"}
        title="App Tours"
        preset="small"
        className="bg-dark-2"
        onClose={closeModal}
      >
        <TourCatalogue onStartTour={closeModal} />
      </Modal>

      <EnhanceNoticeModal active={appModalType === "CHAR_ENHANCE_NOTICE"} onClose={closeModal} />
    </>
  );
}
