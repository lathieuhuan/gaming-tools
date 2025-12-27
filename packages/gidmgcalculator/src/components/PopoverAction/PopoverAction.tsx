import { cloneElement, useState } from "react";
import { Popover, PopoverProps, useClickOutside } from "rond";

type PopoverActionProps = Omit<PopoverProps, "children" | "active" | "content"> & {
  content: React.ReactNode | ((close: () => void) => React.ReactNode);
  children: React.ReactElement;
};

export function PopoverAction({ content, children, ...popoverProps }: PopoverActionProps) {
  const [active, setActive] = useState(false);
  const popoverRef = useClickOutside<HTMLDivElement>(() => setActive(false));

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setActive(!active);

    const { onClick } = children.props;

    if (typeof onClick === "function") {
      onClick(e);
    }
  };

  return (
    <div className="relative">
      {cloneElement(children, {
        onClick: handleClick,
      })}

      <Popover ref={popoverRef} active={active} {...popoverProps}>
        {typeof content === "function" ? content(() => setActive(false)) : content}
      </Popover>
    </div>
  );
}
