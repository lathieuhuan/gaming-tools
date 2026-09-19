import { BiImport } from "react-icons/bi";
import { Button, CloseButton, CollapseSpace, Modal } from "rond";

import { updateMultiSetups } from "@Store/calculator/actions";
import { updateUI, useUIStore } from "@Store/ui";
import { useCalcModalCtrl } from "./ContextProvider";

// Component
import { Card } from "./components/Card";
import {
  AddButton,
  DuplicateButton,
  NameInput,
  RemoveButton,
  SelectStandardButton,
  SetupMultiUpdateKit,
  ToggleCompareButton,
  useSetupMultiUpdateKit,
} from "./SetupMultiUpdateKit";

function SetupDirectorCore() {
  const calcModalCtrl = useCalcModalCtrl();

  const { setups, standardId, canAddMoreSetup } = useSetupMultiUpdateKit();

  const handleApply = () => {
    if (setups.length === 0) {
      return;
    }

    updateMultiSetups(setups, standardId);
    updateUI({ setupDirectorActive: false });
  };

  return (
    <Card className="h-full flex flex-col">
      <p className="mb-2 text-xlp text-center text-heading font-bold">Setups Management</p>

      <div className="mb-4 button-group justify-end">
        <Button
          className="text-black"
          icon={<BiImport className="text-xl" />}
          disabled={!canAddMoreSetup}
          onClick={calcModalCtrl.requestImportSetup}
        >
          Import
        </Button>

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

      <SetupMultiUpdateKit>
        <SetupDirectorCore />
      </SetupMultiUpdateKit>
    </CollapseSpace>
  );
}
