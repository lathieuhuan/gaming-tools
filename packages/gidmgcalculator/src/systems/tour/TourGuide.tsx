import { useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { notification } from "rond";

import type { TourType } from "@Store/ui/types";
import type { TourStep } from "./_types";

import { setTourType } from "@Store/ui";
import { getMainEnhanceTourSteps, getSubEnhanceTourSteps } from "./_configs/enhanceTours";
import { getErrorByCode } from "./_configs/getErrorByCode";
import { useTourPrepper } from "./_hooks/useTourPrepper";

import { Tour } from "./Tour";
import { TourLoading } from "./TourLoading";

// TODO: move to rond
function useOverlayElement(id: string) {
  const ref = useRef<HTMLElement | null>(null);

  if (!ref.current) {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement("div");
      element.id = id;
      document.body.append(element);
    }

    ref.current = element;
  }

  return ref.current;
}

type TourGuideProps = {
  type: TourType;
};

export function TourGuide({ type }: TourGuideProps) {
  const overlayElement = useOverlayElement("tour");

  const endTour = () => {
    setTourType("");
  };

  const tourPrepper = useTourPrepper({
    onError: (code) => {
      notification.error({
        content: `The tour has ended prematurely. ${getErrorByCode(code)}`,
        duration: 0,
      });

      endTour();
    },
    onFinish: () => {
      endTour();
    },
  });

  const [totalSites, setTotalSites] = useState(0);
  const [site, setSite] = useState(tourPrepper.site);

  useLayoutEffect(() => {
    let steps: TourStep[] = [];

    switch (type) {
      case "MAIN_ENHANCE":
        steps = getMainEnhanceTourSteps();
        break;
      case "SUB_ENHANCE":
        steps = getSubEnhanceTourSteps();
        break;
      default:
        break;
    }

    tourPrepper.start(steps).then((site) => {
      setSite(site);
      setTotalSites(steps.length);
    });
  }, []);

  const handleNext = () => {
    tourPrepper.next().then((site) => setSite(site));
  };

  return ReactDOM.createPortal(
    site ? (
      <Tour site={site} totalSites={totalSites} onNext={handleNext} onCancel={endTour} />
    ) : (
      <TourLoading />
    ),
    overlayElement
  );
}
