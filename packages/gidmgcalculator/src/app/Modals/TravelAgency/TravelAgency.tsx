import { useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { VscDebugContinue } from "react-icons/vsc";
import { Modal } from "rond";

import { TourKey } from "@/types";
import { nextFrame } from "@/utils/window.utils";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { setTourType } from "@Store/ui";
import { prepEnhanceTour } from "./actions/prepEnhanceTour";

import { TourCatalogue } from "./TourCatalogue";

type TravelAgencyProps = {
  open?: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function TravelAgency({ open, onOpen, onClose }: TravelAgencyProps) {
  //
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirmedRef = useRef(false);

  const startTour = async (key: TourKey) => {
    switch (key) {
      case "CHARACTER_ENHANCE":
        prepEnhanceTour();
        await nextFrame();
        break;
      default:
        // No prep needed
        key satisfies "TRAVELER_SETTINGS";
    }

    setTourType(key);
    onClose?.();
  };

  const isEnhanceTourAvailable = () => {
    const activeSetup = selectSetup(useCalcStore.getState());
    if (!activeSetup) return true;

    const { teammates } = activeSetup;
    const { enhanceType } = activeSetup.main.data;

    return (
      enhanceType &&
      (!teammates.length || teammates.some((t) => t.data.enhanceType === enhanceType))
    );
  };

  const handleStartTour = (key: TourKey) => {
    switch (key) {
      case "CHARACTER_ENHANCE": {
        if (!isEnhanceTourAvailable()) {
          setConfirmOpen(true);
          onClose();
          return;
        }

        break;
      }
      default:
        key satisfies "TRAVELER_SETTINGS";
    }

    void startTour(key);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);

    if (!confirmedRef.current) {
      onOpen();
    }
  };

  return (
    <>
      <Modal active={open} title="App Tours" preset="small" className="bg-dark-2" onClose={onClose}>
        <TourCatalogue onStartTour={handleStartTour} />
      </Modal>

      <Modal
        active={confirmOpen}
        title="Caution"
        preset="small"
        className="bg-dark-2"
        withActions
        withFooterDivider={false}
        confirmButtonProps={{
          children: "Yes",
          icon: <VscDebugContinue className="text-lg" />,
        }}
        cancelButtonProps={{
          children: "No",
          icon: <FaTimes className="text-base" />,
        }}
        onTransitionEnd={(open) => {
          if (open) {
            confirmedRef.current = false;
          }
        }}
        onConfirm={() => {
          void startTour("CHARACTER_ENHANCE");
          setConfirmOpen(false);
          confirmedRef.current = true;
        }}
        onClose={handleCloseConfirm}
      >
        <span className="text-base">
          We will start a new calculating session for this tour. The existing session (if any) will
          be <span className="text-danger-2 font-bold">REMOVED</span>. Do you want to continue?
        </span>
      </Modal>
    </>
  );
}
