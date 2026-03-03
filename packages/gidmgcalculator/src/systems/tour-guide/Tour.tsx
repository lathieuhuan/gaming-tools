import { useState } from "react";
import { ButtonGroup } from "rond";

import type { TourSite } from "./types";

const ARROW_WIDTH = 16;

type TourProps = {
  site: TourSite;
  totalSites: number;
  onNext?: () => void;
  onCancel?: () => void;
};

export function Tour({ site, totalSites, onNext, onCancel }: TourProps) {
  const { stepNo, location, intro } = site;
  const { dialogs } = intro;

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
    <div
      className="relative z-10"
      style={{
        width: location.width,
        height: location.height,
        transform: `translateX(${location.left}px) translateY(${location.top}px)`,
      }}
    >
      <div
        className="absolute top-full left-1/2 z-10 mt-3 p-4 rounded-md bg-light-1 text-black pointer-events-auto"
        style={
          {
            width: intro.width,
            "--tw-translate-x": `calc(${-50}% + ${intro.offsetX}px)`,
            translate: "var(--tw-translate-x) var(--tw-translate-y)",
          } as React.CSSProperties
        }
      >
        <div
          data-slot="arrow"
          className="absolute bottom-full left-1/2 border-transparent border-b-light-1"
          style={
            {
              borderWidth: ARROW_WIDTH / 2,
              "--tw-translate-x": `calc(${-50}% - ${intro.offsetX}px)`,
              translate: "var(--tw-translate-x) var(--tw-translate-y)",
            } as React.CSSProperties
          }
        />

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
  );
}
