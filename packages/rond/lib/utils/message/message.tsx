import { Modal } from "../../components/Modal";
import { ConfirmModal } from "../../components/ConfirmModal";
import { overlayRoot } from "../common/overlay-root";

const show = (type: "info" | "error") => (message: string | JSX.Element) => {
  const updateMessage = (active: boolean) => {
    const closeMsg = () => {
      if (active) updateMessage(false);
    };

    overlayRoot.render(
      <Modal.Core active={active} preset="small" onClose={closeMsg}>
        <ConfirmModal.Body
          message={<span className={type === "error" ? "text-danger-2" : ""}>{message}</span>}
          showCancel={false}
          focusConfirm
          onConfirm={closeMsg}
        />
      </Modal.Core>
    );
  };

  updateMessage(true);
};

export const message = {
  info: show("info"),
  error: show("error"),
};
