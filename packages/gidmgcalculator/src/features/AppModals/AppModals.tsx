import { createPortal } from "react-dom";
import { LoadingSpin, Modal } from "rond";

import { updateUI } from "@Store/ui-slice";
import { useDispatch, useSelector } from "@Store/hooks";

// Component
import { Introduction } from "./Introduction";
import { Guides } from "./Guides";
import { Settings } from "./Settings";
import { Download } from "./Download";
import { Upload } from "./Upload";
import { Donate } from "./Donate";

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

export const AppModals = () => {
  const dispatch = useDispatch();
  const appModalType = useSelector((state) => state.ui.appModalType);

  const closeModal = () => dispatch(updateUI({ appModalType: "" }));

  return (
    <>
      <Introduction active={appModalType === "INTRO"} onClose={closeModal} />
      <Guides active={appModalType === "GUIDES"} onClose={closeModal} />
      <Settings active={appModalType === "SETTINGS"} onClose={closeModal} />
      <Download active={appModalType === "DOWNLOAD"} onClose={closeModal} />
      <Upload active={appModalType === "UPLOAD"} onClose={closeModal} />
      <Donate active={appModalType === "DONATE"} onClose={closeModal} />
      <AppLoadingMask />
    </>
  );
};
