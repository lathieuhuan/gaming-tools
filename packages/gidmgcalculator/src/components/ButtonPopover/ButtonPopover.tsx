import { useState } from "react";
import { Button, ButtonProps, Popover, PopoverProps, useClickOutside } from "rond";

interface ButtonPopoverProps {
  className?: string;
  style?: React.CSSProperties;
  popoverProps: Pick<PopoverProps, "className" | "origin" | "style" | "withTooltipStyle">;
  buttonProps: ButtonProps;
  children: React.ReactNode | ((close: () => void) => React.ReactNode);
}
export function ButtonPopover({ className = "", style, buttonProps, popoverProps, children }: ButtonPopoverProps) {
  const [active, setActive] = useState(false);
  const menuTriggerRef = useClickOutside<HTMLDivElement>(() => setActive(false));

  return (
    <div ref={menuTriggerRef} className={`relative ${className}`} style={style}>
      <Button
        {...buttonProps}
        onClick={(e) => {
          setActive(!active);
          buttonProps?.onClick?.(e);
        }}
      />

      <Popover active={active} {...popoverProps}>
        {typeof children === "function" ? children(() => setActive(false)) : children}
      </Popover>
    </div>
  );
}
