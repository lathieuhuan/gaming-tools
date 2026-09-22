import { Button, CloseButton, CollapseSpace, Modal } from "rond";

import { updateUI, useUIStore } from "@Store/ui";

// Component
import { MdDownload } from "react-icons/md";
import { Card } from "./components/Card";
import { SetupImportAction } from "./components/SetupImportAction";
import {
  AddButton,
  DuplicateButton,
  NameInput,
  RemoveButton,
  SelectStandardButton,
  SetupDraftKit,
  ToggleCompareButton,
  useMultiSetupUpdateKit,
} from "./SetupDraftKit";

function SetupDirectorCore() {
  const { setups, canAddMoreSetup, apply } = useMultiSetupUpdateKit();

  const handleApply = () => {
    if (apply()) {
      updateUI({ setupDirectorActive: false });
    }
  };

  const handleImportStart = () => {
    updateUI({ setupDirectorActive: false });
  };

  return (
    <Card className="h-full flex flex-col">
      <p className="mb-2 text-xlp text-center text-heading font-bold">Setups Management</p>

      <div className="mb-4 button-group justify-end">
        <SetupImportAction onImportStart={handleImportStart}>
          <Button
            className="text-black"
            icon={<MdDownload className="text-xl" />}
            disabled={!canAddMoreSetup}
          >
            Import
          </Button>
        </SetupImportAction>

        <AddButton />
      </div>

      <div className="space-y-3">
        {setups.map((setup) => (
          <div
            key={setup.ID}
            className="px-2 py-3 rounded-lg bg-dark-1"
            onDoubleClick={() => console.info(setup)}
          >
            <NameInput className="w-full" size="medium" setupId={setup.ID} value={setup.name} />

            <div className="mt-4 flex justify-end gap-4">
              <RemoveButton setupId={setup.ID} />
              <DuplicateButton setupId={setup.ID} />
              <ToggleCompareButton
                className="text-lg data-[active=true]:bg-bonus"
                setupId={setup.ID}
              />
              <SelectStandardButton
                className="text-xlp data-[active=true]:bg-bonus"
                setup={setup}
              />
            </div>
          </div>
        ))}
      </div>

      <Button className="mt-auto mx-auto group relative" variant="primary" onClick={handleApply}>
        Apply
      </Button>
    </Card>
  );
}

export function SetupDirector() {
  const setupDirectorActive = useUIStore((state) => state.setupDirectorActive);

  return (
    <CollapseSpace
      active={setupDirectorActive}
      className="absolute bottom-0 left-0 right-0 bg-dark-3 z-30 rounded-[inherit]"
      activeHeight="100%"
      moveDuration={200}
      destroyOnClose
    >
      <CloseButton
        className={Modal.CLOSE_BTN_CLS}
        boneOnly
        onClick={() => updateUI({ setupDirectorActive: false })}
      />

      <SetupDraftKit>
        <SetupDirectorCore />
      </SetupDraftKit>
    </CollapseSpace>
  );
}
