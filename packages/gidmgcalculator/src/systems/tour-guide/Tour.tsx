import { useState } from "react";
import { ButtonGroup } from "rond";

import type { TourSite } from "./_types";
import { TourFrame } from "./TourFrame";

type TourProps = {
  site: TourSite;
  totalSites: number;
  onNext?: () => void;
  onCancel?: () => void;
};

export function Tour({
  site: {
    stepNo,
    location,
    intro: { dialogs },
  },
  totalSites,
  onNext,
  onCancel,
}: TourProps) {
  const [dialogIndex, setDialogIndex] = useState(0);

  const isLastDialog = dialogIndex === dialogs.length - 1;

  const handleNext = () => {
    if (isLastDialog) {
      onNext?.();
    } else {
      setDialogIndex(dialogIndex + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      <TourFrame {...location} />

      <div
        className="relative z-10"
        style={{
          width: location.width,
          height: location.height,
          transform: `translateX(${location.left}px) translateY(${location.top}px)`,
        }}
      >
        <div className="absolute top-full left-1/2 -translate-x-1/2 z-10 mt-3 p-4 w-64 rounded-md bg-light-1 text-black pointer-events-auto">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-light-1" />

          <div className="mb-4 text-sm">{dialogs[dialogIndex]}</div>

          <div className="flex items-end justify-between">
            <div className="text-xs opacity-80">
              {stepNo} / {totalSites}
            </div>

            <ButtonGroup
              buttons={[
                {
                  children: "Cancel",
                  shape: "square",
                  onClick: onCancel,
                },
                {
                  children: stepNo === totalSites && isLastDialog ? "Finish" : "Next",
                  shape: "square",
                  variant: "primary",
                  onClick: handleNext,
                },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
