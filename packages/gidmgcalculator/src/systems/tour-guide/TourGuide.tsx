import { useLayoutEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

import type { TourStep, TourStepErrorCode } from "./types";

import { useTourPrepper } from "./hooks/useTourPrepper";

import { Tour } from "./Tour";
import { TourFrame } from "./TourFrame";
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

  const [site, setSite] = useState(tourPrepper.site);

  useLayoutEffect(() => {
    void tourPrepper.start(steps).then(setSite);
  }, []);

  const handleNext = () => {
    void tourPrepper.next().then(setSite);
  };

  return ReactDOM.createPortal(
    site ? (
      <TourFrame location={site.location}>
        <Tour site={site} totalSites={steps.length} onNext={handleNext} onCancel={onCancel} />
      </TourFrame>
    ) : (
      <TourLoading />
    ),
    overlayElement
  );
}
