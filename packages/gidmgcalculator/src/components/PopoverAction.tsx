import { useState } from "react";
import { Popover, PopoverProps, useClickOutside } from "rond";

type PopoverActionProps = Omit<PopoverProps, "children" | "active" | "content"> & {
  content: React.ReactNode | ((props: { handleClose: () => void }) => React.ReactNode);
  children: (props: { onClick: (e: React.MouseEvent<HTMLElement>) => void }) => React.ReactElement;
};

export function PopoverAction({ content, children, ...popoverProps }: PopoverActionProps) {
  const [active, setActive] = useState(false);
  const popoverRef = useClickOutside<HTMLDivElement>(() => setActive(false));

  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setActive(!active);
  };

  return (
    <div className="relative">
      {children({ onClick: handleClick })}

      <Popover ref={popoverRef} active={active} {...popoverProps}>
        {typeof content === "function"
          ? content({
              handleClose: () => setActive(false),
            })
          : content}
      </Popover>
    </div>
  );
}
