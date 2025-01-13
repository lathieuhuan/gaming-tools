import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { BottomSheet } from "rond";

import { MobileBottomNav } from "@Src/components";
import { SetupManagerSmall } from "./SetupManagerSmall";

interface BottomNavSmallProps {
  activePanelI: number;
  onSelectSection: (index: number) => void;
}
export function BottomNavSmall({ activePanelI, onSelectSection }: BottomNavSmallProps) {
  const [optionsActive, setOptionsActive] = useState(false);

  const closeOptions = () => setOptionsActive(false);

  return (
    <>
      <MobileBottomNav
        activeI={activePanelI}
        options={["Overview", "Modifiers", "Setup", "Results"]}
        extraEnd={
          <>
            <div className="my-auto w-px h-2/3 bg-surface-border" />
            <button
              type="button"
              className="shrink-0 w-10 flex-center rotate-180"
              onClick={() => setOptionsActive(true)}
            >
              <FaChevronDown />
            </button>
          </>
        }
        onSelect={onSelectSection}
      />

      <BottomSheet active={optionsActive} title="Setups Manager" onClose={closeOptions}>
        <SetupManagerSmall onClose={closeOptions} />
      </BottomSheet>
    </>
  );
}
