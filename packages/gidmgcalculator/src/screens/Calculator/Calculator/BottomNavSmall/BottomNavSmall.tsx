import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet } from "rond";

import { MobileBottomNav, MobileBottomNavProps } from "@/components";
import { SetupManagerSmall } from "./SetupManagerSmall";

export type BottomNavSmallProps<T extends string> = Pick<
  MobileBottomNavProps<T>,
  "value" | "options" | "onSelect"
>;

export function BottomNavSmall<T extends string>(props: BottomNavSmallProps<T>) {
  const [managerActive, setManagerActive] = useState(false);

  const closeManager = () => setManagerActive(false);

  return (
    <>
      <MobileBottomNav
        {...props}
        extraEnd={
          <>
            <div className="my-auto w-px h-2/3 bg-dark-line" />
            <button
              type="button"
              className="shrink-0 w-10 flex-center rotate-180"
              onClick={() => setManagerActive(true)}
            >
              <FaChevronDown />
            </button>
          </>
        }
      />

      <BottomSheet active={managerActive} title="Setups Manager" onClose={closeManager}>
        <SetupManagerSmall onClose={closeManager} />
      </BottomSheet>
    </>
  );
}
