import { useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { notification } from "rond";

import type { TourType } from "@Store/ui/types";
import type { TourStep, TourStepErrorCode } from "./_types";

import { setTourType } from "@Store/ui";
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
  steps: TourStep[];
  onError: (code: TourStepErrorCode) => void;
  onFinish: () => void;
  onCancel: () => void;
};

export function TourGuide({ steps, onError, onFinish, onCancel }: TourGuideProps) {
  const overlayElement = useOverlayElement("tour");

  const tourPrepper = useTourPrepper({
    onError: (code) => {
      onError(code);
    },
    onFinish: () => {
      onFinish();
    },
  });

  const [totalSites, setTotalSites] = useState(0);
  const [site, setSite] = useState(tourPrepper.site);

  useLayoutEffect(() => {
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
      <Tour site={site} totalSites={totalSites} onNext={handleNext} onCancel={onCancel} />
    ) : (
      <TourLoading />
    ),
    overlayElement
  );
}
