import { useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { ConfirmModal, LoadingSpin, Modal, notification } from "rond";

import type { SetupImportInfo } from "@Store/ui/types";

import { MAX_CALC_SETUPS, SCREEN_PATH } from "@/constants/config";
import { useRouter } from "@/lib/router";
import { CalcSetup } from "@/logic/calculator";
import { useShallowCalcStore } from "@Store/calculator";
import { importSetup, initSession } from "@Store/calculator/actions";
import { isTourFinished } from "@Store/tours";
import { updateUI, useUIStore } from "@Store/ui";

import { OverwriteOptions, OverwriteOptionsProps } from "./OverwriteOptions";

export function SetupImportCenter() {
  const importInfo = useUIStore((state) => state.setupImportInfo);

  if (!importInfo) {
    return null;
  }

  return <ImportCenter {...importInfo} />;
}

type PendingCode = "INIT" | "DIFFERENT_CHAR" | "EXISTED" | "MAX_SETUPS" | "DIFFERENT_INFO/TARGET";

function ImportCenter({ meta, params }: SetupImportInfo) {
  const router = useRouter();

  const { main, target, setupManagers } = useShallowCalcStore((state) => {
    return {
      main: state.setupsById[state.activeId]?.main,
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

  const handleCancel = () => {
    updateUI({ setupImportInfo: null });
  };

  useEffect(() => {
    const delay = (fn: () => void) => setTimeout(fn, 0);

    // Start of site, no setup in Calculator yet
    if (!main) {
      delay(startNewSession);
      return;
    }

    if (main.data.code !== params.main.code) {
      delay(() => setPendingCode("DIFFERENT_CHAR"));
      return;
    }

    // The imported is from My Setups and already imported
    if (meta.id && setupManagers.some((manager) => manager.ID === meta.id)) {
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
        }),
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
    importSetup(params, meta, config);

    updateUI({
      setupDirectorActive: false,
      setupImportInfo: null,
    });
  };

  const startNewSession = () => {
    const calcSetup = CalcSetup.create(meta.id, params.main, params);

    const { teammates } = calcSetup;
    const { enhanceType } = calcSetup.main.data;

    initSession({
      name: meta.name,
      type: meta.type,
      calcSetup,
    });

    const shouldShowEnhanceNotice =
      !isTourFinished("CHAR_ENHANCE") && (enhanceType || teammates.some((t) => t.data.enhanceType));

    updateUI({
      setupDirectorActive: false,
      setupImportInfo: null,
      appModalType: shouldShowEnhanceNotice ? "CHAR_ENHANCE_NOTICE" : "",
    });

    router.navigate({ to: SCREEN_PATH.CALCULATOR });

    if (meta.source === "URL" || meta.source === "ENKA") {
      notification.success({
        content: "Successfully import the setup!",
        duration: 0,
      });
    }
  };

  const resetExistingSetup = () => {
    // TODO implement
    updateUI({ setupDirectorActive: false });

    router.navigate({ to: SCREEN_PATH.CALCULATOR });
  };

  switch (pendingCode) {
    case "INIT":
      return (
        <Modal.Core active closeOnMaskClick={false}>
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
          onClose={handleCancel}
        />
      );
    case "EXISTED":
      return (
        <ConfirmModal
          active
          message="This setup is already in the Calculator. Do you want to reset it to this version?"
          focusConfirm
          onConfirm={resetExistingSetup}
          onClose={handleCancel}
        />
      );
    case "MAX_SETUPS":
      return (
        <ConfirmModal
          active
          message={`The number of Setups on Calculator has reach the limit of ${MAX_CALC_SETUPS}. Start a new session?`}
          focusConfirm
          onConfirm={startNewSession}
          onClose={handleCancel}
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
          onClose={handleCancel}
        >
          <OverwriteOptions {...overwriteProps.current} onDone={addImportedSetup} />
        </Modal>
      );
    default:
      return null;
  }
}
