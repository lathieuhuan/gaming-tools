import { createPortal } from "react-dom";
import { LoadingSpin, Modal } from "rond";

import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

// Component
import { Donate } from "./components/Donate";
import { Download } from "./components/Download";
import { Guides } from "./components/Guides";
import { Settings } from "./components/Settings";
import { Upload } from "./components/Upload";

const AppLoadingMask = () => {
  const loading = useSelector((state) => state.ui.loading);
  let mask = document.getElementById("app-mask");

  if (!mask) {
    mask = document.createElement("div");
    mask.id = "app-mask";
    document.body.appendChild(mask);
  }
  return createPortal(
    <Modal.Core active={loading} closeOnMaskClick={false} onClose={() => {}}>
      <LoadingSpin size="large" />
    </Modal.Core>,
    mask
  );
};

export function Modals() {
  const dispatch = useDispatch();
  const appModalType = useSelector((state) => state.ui.appModalType);

  const closeModal = () => dispatch(updateUI({ appModalType: "" }));

  return (
    <>
      <Guides active={appModalType === "GUIDES"} onClose={closeModal} />
      <Settings active={appModalType === "SETTINGS"} onClose={closeModal} />
      <Download active={appModalType === "DOWNLOAD"} onClose={closeModal} />
      <Upload active={appModalType === "UPLOAD"} onClose={closeModal} />
      <Donate active={appModalType === "DONATE"} onClose={closeModal} />
      <AppLoadingMask />
    </>
  );
}
