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
  /** Default to '20rem' */
  activeWidth?: string | number;
  closeOnMaskClick?: boolean;
  destroyOnClose?: boolean;
  children: React.ReactNode;
  afterClose?: () => void;
}
export const Drawer = ({
  className,
  style,
  active,
  activeWidth = '20rem',
  closeOnMaskClick = true,
  destroyOnClose,
  children,
  afterClose,
}: DrawerProps) => {
  const [state, setState] = useState<DrawerState>({
    mounted: false,
    active: false,
  });

  const updateState = <T extends keyof DrawerState>(key: T, value: DrawerState[T]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
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
    if (!state.active) {
      updateState("mounted", false);
      afterClose?.();
    }
  };

  return (
    <div className={clsx("ron-drawer__wrapper ron-full-stretch", !state.mounted && "ron-hidden")}>
      <div
        className={clsx("ron-drawer__mask", state.active && "ron-drawer__mask--active")}
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
