import clsx, { type ClassValue } from "clsx";
import { useEffect, useState } from "react";
import "./Drawer.styles.scss";

type DrawerState = {
  mounted: boolean;
  active: boolean;
};

export interface DrawerProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  active?: boolean;
  activeWidth: string | number;
  closeOnMaskClick?: boolean;
  destroyOnClose?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}
export const Drawer = ({
  className,
  style,
  active,
  activeWidth,
  closeOnMaskClick = true,
  destroyOnClose,
  children,
  onClose,
}: DrawerProps) => {
  const [state, setState] = useState<DrawerState>({
    mounted: false,
    active: false,
  });

  const updateState = <T extends keyof DrawerState>(key: T, value: DrawerState[T]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    console.log("useEffect", active, state.mounted);

    if (active) {
      if (!state.mounted) {
        updateState("mounted", true);

        setTimeout(() => {
          updateState("active", true);
        }, 50);
      }
    } else if (state.mounted) {
      closeDrawer();
    }
  }, [active]);

  const closeDrawer = () => {
    updateState("active", false);
  };

  const onMaskTransitionEnd = () => {
    if (state.active === false) {
      updateState("mounted", false);
      onClose?.();
    }
  };

  return (
    <div className={clsx("ron-drawer-wrapper ron-full-stretch", !state.mounted && "ron-hidden")}>
      <div
        className={clsx("ron-drawer-mask", state.active && "ron-drawer-mask-active")}
        onTransitionEnd={onMaskTransitionEnd}
        onClick={closeOnMaskClick ? closeDrawer : undefined}
      />

      <div
        className={clsx("ron-drawer", className)}
        style={{
          width: state.active ? activeWidth : 0,
          ...style,
        }}
      >
        {!destroyOnClose || state.mounted ? children : null}
      </div>
    </div>
  );
};
