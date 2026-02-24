import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { VscDebugContinue } from "react-icons/vsc";
import { ConfirmModal, Modal, ModalControl } from "rond";

import type { TourKey } from "@/types";

import { nextFrame } from "@/utils/window.utils";
import { useCalcStore } from "@Store/calculator";
import { selectSetup } from "@Store/calculator/selectors";
import { setTourType } from "@Store/ui";
import { prepTour } from "./actions/prepTour";

import { TourCatalogue } from "./TourCatalogue";

type ModalType = "TOUR_CATALOGUE" | "CONFIRM_START_ENHANCE_TOUR" | "";

function TravelAgency({ onClose }: ModalControl) {
  const [modalType, setModalType] = useState<ModalType>("TOUR_CATALOGUE");

  const handleClose = () => {
    onClose && setTimeout(onClose, 150);
  };

  const isTourAvailable = (key: TourKey) => {
    switch (key) {
      case "CHAR_ENHANCE": {
        const activeSetup = selectSetup(useCalcStore.getState());

        if (!activeSetup) return true;

        const { teammates } = activeSetup;
        const { enhanceType } = activeSetup.main.data;

        if (
          enhanceType &&
          (!teammates.length || teammates.some((t) => t.data.enhanceType === enhanceType))
        ) {
          return true;
        }

        setModalType("CONFIRM_START_ENHANCE_TOUR");
        return false;
      }
      default:
        key satisfies never;
        return false;
    }
  };

  const startTour = async (key: TourKey) => {
    prepTour(key);

    await nextFrame();

    setTourType(key);
    onClose?.();
  };

  const handleStartTour = (key: TourKey) => {
    if (isTourAvailable(key)) {
      void startTour(key);
    }
  };

  return (
    <>
      <Modal
        active={modalType === "TOUR_CATALOGUE"}
        title="App Tours"
        preset="small"
        className="bg-dark-2"
        onClose={() => {
          setModalType("");
          handleClose();
        }}
      >
        <TourCatalogue onStartTour={handleStartTour} />
      </Modal>

      <ConfirmModal
        active={modalType === "CONFIRM_START_ENHANCE_TOUR"}
        message={
          <span className="text-base">
            We will start a new calculating session for this tour. The existing session (if any)
            will be <span className="text-danger-2 font-bold">REMOVED</span>. Do you want to
            continue?
          </span>
        }
        confirmButtonProps={{
          children: "Yes",
          icon: <VscDebugContinue className="text-lg" />,
        }}
        cancelButtonProps={{
          children: "No",
          icon: <FaTimes className="text-base" />,
        }}
        onConfirm={() => void startTour("CHAR_ENHANCE")}
        onClose={() => setModalType("TOUR_CATALOGUE")}
      />
    </>
  );
}

export function TravelAgencyModals(props: ModalControl) {
  return props.active ? <TravelAgency {...props} /> : null;
}
