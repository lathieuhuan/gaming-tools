import { useState } from "react";
import { Button, ButtonProps, CloseButton, Popover, PopoverProps, useClickOutside } from "rond";

type PopoverPosition = "center" | "right";

type PopoverPropsByPosition = Record<PopoverPosition, Pick<PopoverProps, "style" | "origin">>;

interface ConfirmButtonProps extends Pick<ButtonProps, "className" | "variant" | "icon" | "children"> {
  asking: boolean;
  askingTitle: string;
  askingContent: React.ReactNode;
  disabledAsking?: boolean;
  popoverWidth: string | number;
  toggleAsking: (asking: boolean) => void;
  onConfirm: () => void;
}
export function ConfirmButton({
  className,
  variant,
  asking,
  askingTitle,
  askingContent,
  disabledAsking,
  popoverWidth,
  toggleAsking,
  onConfirm,
  ...buttonProps
}: ConfirmButtonProps) {
  //
  const [position, setPosition] = useState<PopoverPosition>("center");
  const triggerRef = useClickOutside<HTMLDivElement>(() => toggleAsking(false));

  const _onClick = () => {
    const parent = triggerRef.current?.parentElement;

    if (triggerRef.current && parent) {
      const parentRight = parent.getBoundingClientRect().right;
      const triggerRight = triggerRef.current.getBoundingClientRect().right;
      const distanceToRight = Math.abs(parentRight - triggerRight);

      if (distanceToRight < 1) {
        setPosition("right");
      } else {
        setPosition("center");
      }
    }

    if (asking || disabledAsking) {
      onConfirm();
    } else {
      toggleAsking(true);
    }
  };

  const popoverPropsByPosition: PopoverPropsByPosition = {
    center: {
      style: {
        width: popoverWidth,
        left: "50%",
        translate: "-50% 0",
      },
      origin: "bottom center",
    },
    right: {
      style: {
        width: popoverWidth,
        right: 0,
      },
      origin: "bottom right",
    },
  };

  return (
    <div ref={triggerRef} className="relative">
      <Button
        className={[asking && "relative z-20", className]}
        variant={asking ? variant : "default"}
        onClick={_onClick}
        {...buttonProps}
      />

      <Popover
        active={asking}
        className="z-20 bottom-full mb-3 pl-4 pr-1 py-1 shadow-white-glow"
        withTooltipStyle
        {...popoverPropsByPosition[position]}
      >
        <div className="flex justify-between items-center">
          <p className="text-base font-semibold">{askingTitle}</p>
          <CloseButton className="shrink-0" boneOnly onClick={() => toggleAsking(false)} />
        </div>

        {askingContent}
      </Popover>
    </div>
  );
}
