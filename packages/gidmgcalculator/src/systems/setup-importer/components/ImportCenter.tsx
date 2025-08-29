import { useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { ConfirmModal, LoadingSpin, Modal, type PartiallyRequired, notification } from "rond";

import { MAX_CALC_SETUPS, SCREEN_PATH } from "@Src/constants";
import { useRouter } from "@Src/systems/router";
import Object_ from "@Src/utils/object-utils";
import {
  importSetup,
  initNewSession,
  selectCharacter,
  selectSetupManageInfos,
  selectTarget,
} from "@Store/calculator-slice";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { SetupImportInfo } from "@Src/types";

// Component
import { OverwriteOptions, type OverwriteOptionsProps } from "./OverwriteOptions";

type PendingCode = "INIT" | "DIFFERENT_CHAR" | "EXISTED" | "MAX_SETUPS" | "DIFFERENT_INFO/TARGET";

type SetupImportCenterProps = PartiallyRequired<SetupImportInfo, "calcSetup" | "target"> & {
  onFinish: () => void;
};

export function SetupImportCenter({ calcSetup, target, onFinish, ...manageInfo }: SetupImportCenterProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const character = useSelector(selectCharacter);
  const currentTarget = useSelector(selectTarget);
  const calcSetupInfos = useSelector(selectSetupManageInfos);

  const [pendingCode, setPendingCode] = useState<PendingCode>("INIT");
  const overwriteToAsk = useRef({
    character: false,
    target: true,
  });

  useEffect(() => {
    const delayExecute = (fn: () => void) => setTimeout(fn, 0);

    // Start of site, no setup in Calculator yet
    if (!character) {
      delayExecute(startNewSession);
      return;
    }
    if (character.name !== calcSetup.char.name) {
      delayExecute(() => setPendingCode("DIFFERENT_CHAR"));
      return;
    }
    // The imported is from My Setups and already imported
    if (manageInfo.ID && calcSetupInfos.some((info) => info.ID === manageInfo.ID)) {
      delayExecute(() => setPendingCode("EXISTED"));
      return;
    }
    if (calcSetupInfos.length === MAX_CALC_SETUPS) {
      delayExecute(() => setPendingCode("MAX_SETUPS"));
      return;
    }
    const sameChar = isEqual(character, calcSetup.char);
    const sameTarget = isEqual(Object_.omitEmptyProps(currentTarget), Object_.omitEmptyProps(target));

    if (sameChar && sameTarget) {
      delayExecute(() =>
        addImportedSetup({
          shouldOverwriteChar: false,
          shouldOverwriteTarget: false,
        })
      );
      return;
    }
    overwriteToAsk.current = {
      character: !sameChar,
      target: !sameTarget,
    };

    setPendingCode("DIFFERENT_INFO/TARGET");
  }, []);

  const addImportedSetup: OverwriteOptionsProps["onDone"] = (config) => {
    dispatch(
      importSetup({
        importInfo: {
          ...manageInfo,
          calcSetup,
          target,
        },
        ...config,
      })
    );
    dispatch(updateUI({ setupDirectorActive: false }));
    onFinish();
  };

  const startNewSession = () => {
    dispatch(
      initNewSession({
        ...manageInfo,
        calcSetup,
        target,
      })
    );
    dispatch(updateUI({ setupDirectorActive: false }));
    onFinish();

    router.navigate(SCREEN_PATH.CALCULATOR);

    if (["URL", "ENKA"].includes(manageInfo.importSource || "")) {
      notification.success({
        content: "Successfully import the setup!",
        duration: 0,
      });
    }
  };

  const resetExistingSetup = () => {
    dispatch(updateUI({ setupDirectorActive: false }));
  };

  switch (pendingCode) {
    case "INIT":
      return (
        <Modal.Core active closeOnMaskClick={false} onClose={() => {}}>
          <LoadingSpin size="large" />
        </Modal.Core>
      );
    case "DIFFERENT_CHAR":
      return (
        <ConfirmModal
          active
          message="We're calculating another Character. Start a new session?"
          focusConfirm
          onConfirm={startNewSession}
          onClose={onFinish}
        />
      );
    case "EXISTED":
      return (
        <ConfirmModal
          active
          message="This setup is already in the Calculator. Do you want to reset it to this version?"
          focusConfirm
          onConfirm={resetExistingSetup}
          onClose={onFinish}
        />
      );
    case "MAX_SETUPS":
      return (
        <ConfirmModal
          active
          message={`The number of Setups on Calculator has reach the limit of ${MAX_CALC_SETUPS}. Start a new session?`}
          focusConfirm
          onConfirm={startNewSession}
          onClose={onFinish}
        />
      );
    case "DIFFERENT_INFO/TARGET":
      return (
        <Modal
          active
          preset="small"
          className="bg-surface-3"
          title="Overwrite Configuration"
          withActions
          formId="overwrite-configuration"
          onClose={onFinish}
        >
          <OverwriteOptions
            askForCharacter={overwriteToAsk.current.character}
            askForTarget={overwriteToAsk.current.target}
            importedChar={calcSetup?.char}
            importedTarget={target}
            onDone={addImportedSetup}
          />
        </Modal>
      );
    default:
      return null;
  }
}
