import { FaPlus } from "react-icons/fa";
import { BiImport } from "react-icons/bi";
import { clsx, Button, CloseButton, CollapseSpace, Modal } from "rond";

import { updateUI } from "@Store/ui-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { useCalcModalCtrl } from "../ContextProvider";
import { useSetupDirectorKit } from "./useSetupDirectorKit";

// Component
import { SetupControl } from "./SetupControl";

function SetupDirectorCore() {
  const dispatch = useDispatch();
  const calcModalCtrl = useCalcModalCtrl();
  const { displayedSetups, comparedSetups, canAddMoreSetup, tempStandardId, control } = useSetupDirectorKit();

  return (
    <div className="p-4 h-full flex flex-col">
      <CloseButton
        className={Modal.CLOSE_BTN_CLS}
        boneOnly
        onClick={() => dispatch(updateUI({ setupDirectorActive: false }))}
      />

      <p className="my-2 text-1.5xl text-center text-heading-color font-bold">Setups Management</p>

      <div className="flex-grow hide-scrollbar">
        <div className="space-y-4">
          <div hidden={!displayedSetups.length} className="space-y-3">
            {displayedSetups.map((setup, index) => {
              return (
                <SetupControl
                  key={setup.ID}
                  setup={setup}
                  isStandard={setup.ID === tempStandardId}
                  choosableAsStandard={setup.isCompared && comparedSetups.length > 1}
                  removable={displayedSetups.length > 1}
                  copiable={canAddMoreSetup}
                  onChangeSetupName={control.changeSetupName(index)}
                  onRemoveSetup={control.removeSetup(index)}
                  onCopySetup={control.copySetup(index)}
                  onToggleCompared={control.toggleSetupCompared(index)}
                  onChooseStandard={control.selectStandardSetup(index)}
                />
              );
            })}
          </div>

          {canAddMoreSetup && (
            <div className="space-y-4">
              <Button
                variant="custom"
                className="w-full bg-secondary-1 text-black"
                icon={<FaPlus />}
                onClick={control.addNewSetup}
              >
                Add
              </Button>
              <Button
                className="w-full text-black"
                icon={<BiImport className="text-xl" />}
                onClick={calcModalCtrl.requestImportSetup}
              >
                Import
              </Button>
            </div>
          )}
        </div>
      </div>

      <Button
        className="mt-4 mx-auto group relative"
        variant="primary"
        onClick={() => control.tryApplyNewSettings(() => dispatch(updateUI({ setupDirectorActive: false })))}
      >
        Apply
      </Button>
    </div>
  );
}

export function SetupDirector(props: { className?: string }) {
  const setupDirectorActive = useSelector((state) => state.ui.setupDirectorActive);

  return (
    <CollapseSpace
      active={setupDirectorActive}
      className={clsx("absolute bottom-0 left-0 bg-surface-3 z-30", props.className)}
      activeHeight="100%"
      moveDuration={200}
      destroyOnClose
    >
      <SetupDirectorCore />
    </CollapseSpace>
  );
}
