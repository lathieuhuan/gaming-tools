import { FaCheck } from "react-icons/fa";
import { MdDownload } from "react-icons/md";
import { Button, FancyBackSvg } from "rond";

import { useCalcStore } from "@Store/calculator";
import { updateCalculator } from "@Store/calculator/actions";

import { SetupImportAction } from "../../components/SetupImportAction";
import { AddButton, useMultiSetupUpdateKit } from "../../SetupDraftKit";
import { SetupControl } from "./SetupControl";

type SetupManagerSmallProps = {
  onClose: () => void;
};

export function SetupManagerSmall({ onClose }: SetupManagerSmallProps) {
  const activeId = useCalcStore((state) => state.activeId);

  const { setups, canAddMoreSetup, apply } = useMultiSetupUpdateKit();

  const handleSelectSetup = (id: number) => {
    if (id !== activeId) {
      updateCalculator({ activeId: id });
    }
    onClose();
  };

  const handleApply = () => {
    if (apply()) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="h-102 px-4 pt-4 space-y-4 custom-scrollbar">
        {setups.map((setup) => (
          <SetupControl
            key={setup.ID}
            className="border-b border-dark-line"
            setup={setup}
            active={setup.ID === activeId}
            onSelect={() => handleSelectSetup(setup.ID)}
          />
        ))}
      </div>

      <div className="mt-auto p-4 flex gap-4">
        <SetupImportAction onImportStart={onClose}>
          <Button
            className="w-full text-black"
            icon={<MdDownload className="text-xl" />}
            disabled={!canAddMoreSetup}
          >
            Import
          </Button>
        </SetupImportAction>

        <AddButton variant="custom" className="w-full" />
      </div>

      <div className="p-4 button-group justify-end bg-dark-3">
        <Button icon={<FancyBackSvg />} onClick={onClose} />
        <Button variant="primary" icon={<FaCheck />} onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
