import { autoUpdate, offset, shift, useFloating } from "@floating-ui/react-dom";
import { useState } from "react";
import { Button, clsx } from "rond";

import type { TourSite } from "./types";

const ARROW_WIDTH = 16;

type TourProps = {
  site: TourSite;
  totalSites: number;
  onNext?: () => void;
  onCancel?: () => void;
};

export function Tour({ site, totalSites, onNext, onCancel }: TourProps) {
  const { stepNo, location, intro, placement } = site;
  const { dialogs } = intro;

  const [dialogIndex, setDialogIndex] = useState(0);

  const { refs, floatingStyles } = useFloating({
    open: true,
    placement,
    middleware: [
      offset(12),
      shift({
        crossAxis: true,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const isLastDialog = dialogIndex === dialogs.length - 1;

  const handleNext = () => {
    if (isLastDialog) {
      onNext?.();
    } else {
      setDialogIndex(dialogIndex + 1);
    }
  };

  return (
    <>
      <div
        ref={refs.setReference}
        className="relative z-10 transition-all duration-200"
        style={{
          width: location.width,
          height: location.height,
          transform: `translateX(${location.left}px) translateY(${location.top}px)`,
        }}
      />

      <div
        ref={refs.setFloating}
        className="z-10 p-4 rounded-md bg-light-1 text-black pointer-events-auto"
        style={{
          width: intro.width,
          ...floatingStyles,
        }}
      >
        <div
          data-slot="arrow"
          className={clsx("absolute left-1/2 border-transparent", {
            "top-full border-t-light-1": placement === "top",
            "bottom-full border-b-light-1": placement === "bottom",
          })}
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

          <div className="button-group">
            <Button shape="square" onClick={onCancel}>
              Cancel
            </Button>

            <Button shape="square" variant="primary" autoFocus onClick={handleNext}>
              {stepNo === totalSites && isLastDialog ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
