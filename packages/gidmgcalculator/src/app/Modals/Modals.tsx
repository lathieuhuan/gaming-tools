import { Modal } from "rond";

import { updateUI, useUIStore } from "@Store/ui";

// Component
import { DataRepair } from "./DataRepair";
import { Donate } from "./Donate";
import { Download } from "./Download";
import { EnhanceNoticeModal } from "./EnhanceNoticeModal";
import { Guides } from "./Guides";
import { Settings } from "./Settings";
import { TourCatalogue } from "./TourCatalogue";
import { Upload } from "./Upload";

export function Modals() {
  const appModalType = useUIStore((state) => state.appModalType);

  const closeModal = () => updateUI({ appModalType: "" });

  return (
    <>
      <Guides active={appModalType === "GUIDES"} onClose={closeModal} />
      <Settings active={appModalType === "SETTINGS"} onClose={closeModal} />
      <Download active={appModalType === "DOWNLOAD"} onClose={closeModal} />
      <Upload active={appModalType === "UPLOAD"} onClose={closeModal} />
      <Donate active={appModalType === "DONATE"} onClose={closeModal} />
      <DataRepair active={appModalType === "DATA_REPAIR"} onClose={closeModal} />

      <Modal
        active={appModalType === "TOUR_CATALOGUE"}
        title="App Tours"
        preset="small"
        className="bg-dark-2"
        onClose={closeModal}
      >
        <TourCatalogue onStartTour={closeModal} />
      </Modal>

      {/* <EnhanceNoticeModal active={appModalType === "CHAR_ENHANCE_NOTICE"} onClose={closeModal} /> */}
    </>
  );
}
