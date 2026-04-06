import { FaBars, FaMapMarkedAlt } from "react-icons/fa";
import { Modal, ModalControl } from "rond";

import type { TourType } from "@Store/ui/types";

import { CHAR_ENHANCE_TOUR } from "@/lib/tour-operator";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { setTourType } from "@Store/ui";

function EnhanceNotice({ onClose }: ModalControl) {
  const activeSetup = useCalcStore(selectSetup);
  const { teammates } = activeSetup;
  const { enhanceType } = activeSetup.main.data;

  let tourType: TourType | undefined = undefined;
  let isQuickTour = true;

  if (enhanceType) {
    tourType = "MAIN_ENHANCE";

    if (!teammates.length || teammates.some((t) => t.data.enhanceType === enhanceType)) {
      tourType = "CHAR_ENHANCE";
      isQuickTour = false;
    }
  } else if (teammates.some((t) => t.data.enhanceType)) {
    tourType = "TEAMMATE_ENHANCE";
  }

  const handleStartTour = () => {
    if (tourType) {
      setTourType(tourType);
    }

    onClose?.();
  };

  return (
    <div>
      <p>
        A character in this setup can be enhanced by tapping the enhancement tag (e.g. Hexerei...)
        near their name.
      </p>

      {isQuickTour && (
        <div className="mt-4 text-sm text-light-hint contains-inline-svg">
          Finish the App Tour: <b>{CHAR_ENHANCE_TOUR.title}</b> in{" "}
          <span className="whitespace-nowrap">
            <FaBars /> Menu
          </span>{" "}
          /{" "}
          <span className="whitespace-nowrap">
            <FaMapMarkedAlt /> App Tours
          </span>{" "}
          to mute this notice.
        </div>
      )}

      <Modal.Actions
        focusConfirm
        confirmText="Show me"
        onConfirm={handleStartTour}
        onCancel={onClose}
      />
    </div>
  );
}

export function EnhanceNoticeModal({ active, onClose }: ModalControl) {
  return (
    <Modal
      title="Enhanceable"
      active={active}
      preset="small"
      className="bg-dark-1"
      withFooterDivider={false}
      withCloseButton={false}
      closeOnMaskClick={false}
      onClose={onClose}
    >
      <EnhanceNotice onClose={onClose} />
    </Modal>
  );
}
