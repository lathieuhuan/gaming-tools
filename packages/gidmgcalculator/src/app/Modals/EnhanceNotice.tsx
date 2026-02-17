import { useRef } from "react";
import { Checkbox, Modal, ModalControl } from "rond";

import { useToursStore } from "@Store/tours";
import { setTourType } from "@Store/ui";

export function EnhanceNotice({ active, onClose }: ModalControl) {
  const checkRef = useRef(false);

  const handleClose = () => {
    useToursStore.setState({ characterEnhance: checkRef.current });
    onClose?.();
  };

  return (
    <Modal
      title="Enhanceable"
      active={active}
      preset="small"
      className="bg-dark-1"
      withActions
      withFooterDivider={false}
      withCloseButton={false}
      closeOnMaskClick={false}
      focusConfirm
      confirmText="Show me"
      onConfirm={() => {
        setTourType("ENHANCE");
        handleClose();
      }}
      onClose={handleClose}
    >
      <p>This character can be enhanced by tapping the enhance tag (Hexerei...) near their name.</p>

      <div className="mt-4 flex">
        <Checkbox onChange={(checked) => (checkRef.current = checked)}>
          <span className="text-light-3">Don't show again</span>
        </Checkbox>
      </div>
    </Modal>
  );
}
