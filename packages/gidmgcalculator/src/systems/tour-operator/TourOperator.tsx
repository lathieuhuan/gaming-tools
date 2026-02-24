import { notification } from "rond";

import type { TourStep, TourStepErrorCode } from "@/systems/tour-guide";
import type { TourKey } from "@/types";
import type { TourType } from "@Store/ui/types";

import { TourGuide } from "@/systems/tour-guide";
import { setTourFinished } from "@Store/tours/actions";
import { setTourType } from "@Store/ui";
import { getEnhanceTourSteps, getSubEnhanceTourSteps } from "./tours/enhanceTours";

type TourOperatorProps = {
  tourType: TourType;
};

export const TourOperator = ({ tourType }: TourOperatorProps) => {
  let steps: TourStep[] = [];

  switch (tourType) {
    case "CHAR_ENHANCE":
    case "MAIN_ENHANCE":
      steps = getEnhanceTourSteps();
      break;
    case "TEAMMATE_ENHANCE":
      steps = getSubEnhanceTourSteps();
      break;
    default:
      tourType satisfies never;
      break;
  }

  const endTour = () => {
    setTourType(undefined);
  };

  const handleFinish = () => {
    let finishedTour: TourKey | undefined = undefined;

    switch (tourType) {
      case "CHAR_ENHANCE":
        finishedTour = tourType;
        break;
      case "MAIN_ENHANCE":
      case "TEAMMATE_ENHANCE":
        // These are quick tours, they are not tracked
        break;
      default:
        tourType satisfies never;
        break;
    }

    if (finishedTour) {
      setTourFinished(finishedTour);

      notification.success({
        content: `Congratulations! You have finished the tour.`,
        duration: 5,
      });
    }

    endTour();
  };

  function getErrorByCode(code: TourStepErrorCode) {
    switch (code) {
      case "NOT_FOUND":
        return "The next location is not found.";
      default:
        return "Unknown error has occurred.";
    }
  }

  const handleError = (code: TourStepErrorCode) => {
    notification.error({
      content: `The tour has ended prematurely. ${getErrorByCode(code)}`,
      duration: 0,
    });

    endTour();
  };

  return (
    <TourGuide steps={steps} onError={handleError} onFinish={handleFinish} onCancel={endTour} />
  );
};
