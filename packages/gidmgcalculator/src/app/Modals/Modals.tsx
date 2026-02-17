import { updateUI, useUIStore } from "@Store/ui";

// Component
import { DataFixing } from "./DataFixing";
import { Donate } from "./Donate";
import { Download } from "./Download";
import { Guides } from "./Guides";
import { Settings } from "./Settings";
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
      <DataFixing active={appModalType === "DATA_FIX"} onClose={closeModal} />
    </>
  );
}
