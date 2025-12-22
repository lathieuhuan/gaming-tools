import { useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { ConfirmModal, LoadingSpin, Modal, type PartiallyRequired, notification } from "rond";

import type { SetupImportInfo } from "@/types";

import { MAX_CALC_SETUPS, SCREEN_PATH } from "@/constants/config";
import { CalcSetup } from "@/models/calculator";
import { useRouter } from "@/systems/router";
import { useShallowCalcStore } from "@Store/calculator";
import { importSetup, initSession } from "@Store/calculator/actions";
import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

// Component
import { OverwriteOptions, type OverwriteOptionsProps } from "./OverwriteOptions";

type PendingCode = "INIT" | "DIFFERENT_CHAR" | "EXISTED" | "MAX_SETUPS" | "DIFFERENT_INFO/TARGET";

type SetupImportCenterProps = PartiallyRequired<SetupImportInfo, "params"> & {
  onFinish: () => void;
};

export function SetupImportCenter({ params, onFinish, ...manageInfo }: SetupImportCenterProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { main, target, setupManagers } = useShallowCalcStore((state) => {
    const { activeId = "", setupsById } = state;

    return {
      main: setupsById[activeId]?.main,
      target: state.target,
      setupManagers: state.setupManagers,
    };
  });

  const [pendingCode, setPendingCode] = useState<PendingCode>("INIT");
  const overwriteProps = useRef<
    Pick<
      OverwriteOptionsProps,
      | "currentMain"
      | "currentTarget"
      | "importedMain"
      | "importedTarget"
      | "askForCharacter"
      | "askForTarget"
    >
  >({
    currentMain: main,
    currentTarget: target,
    importedMain: params.main,
    importedTarget: target,
    askForCharacter: false,
    askForTarget: true,
  });

  useEffect(() => {
    const delay = (fn: () => void) => setTimeout(fn, 0);

    // Start of site, no setup in Calculator yet
    if (!main) {
      delay(startNewSession);
      return;
    }

    if (main.name !== params.main.name) {
      delay(() => setPendingCode("DIFFERENT_CHAR"));
      return;
    }

    // The imported is from My Setups and already imported
    if (manageInfo.ID && setupManagers.some((manager) => manager.ID === manageInfo.ID)) {
      delay(() => setPendingCode("EXISTED"));
      return;
    }

    if (setupManagers.length === MAX_CALC_SETUPS) {
      delay(() => setPendingCode("MAX_SETUPS"));
      return;
    }

    const currentMain = main.serialize();
    const importedMain = params.main.serialize();
    const sameChar = isEqual(currentMain, importedMain);

    const currentTarget = target.serialize();
    const importedTarget = params.target?.serialize();
    const sameTarget = !importedTarget || isEqual(currentTarget, importedTarget);

    if (sameChar && sameTarget) {
      delay(() =>
        addImportedSetup({
          overwriteChar: false,
          overwriteTarget: false,
        })
      );
      return;
    }

    overwriteProps.current = {
      currentMain,
      currentTarget,
      importedMain,
      importedTarget: importedTarget ?? currentTarget,
      askForCharacter: !sameChar,
      askForTarget: !sameTarget,
    };

    setPendingCode("DIFFERENT_INFO/TARGET");
  }, []);

  const addImportedSetup: OverwriteOptionsProps["onDone"] = (config) => {
    importSetup(params, manageInfo, config);
    dispatch(updateUI({ setupDirectorActive: false }));
    onFinish();
  };

  const startNewSession = () => {
    initSession({
      name: manageInfo.name,
      type: manageInfo.type,
      calcSetup: new CalcSetup({
        ...params,
        ID: manageInfo.ID,
      }),
    });

    dispatch(updateUI({ setupDirectorActive: false }));
    onFinish();

    router.navigate(SCREEN_PATH.CALCULATOR);

    if (["URL", "ENKA"].includes(manageInfo.source || "")) {
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
          className="bg-dark-3"
          title="Overwrite Configuration"
          withActions
          formId="overwrite-configuration"
          onClose={onFinish}
        >
          <OverwriteOptions {...overwriteProps.current} onDone={addImportedSetup} />
        </Modal>
      );
    default:
      return null;
  }
}
