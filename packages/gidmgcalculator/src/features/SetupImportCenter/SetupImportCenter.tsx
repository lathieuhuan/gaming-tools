import { useEffect, useRef, useState } from "react";
import isEqual from "react-fast-compare";
import { notification, Modal, ConfirmModal, LoadingSpin, type PartiallyRequired, message } from "rond";

import type { SetupImportInfo } from "@Src/types";
import { MAX_CALC_SETUPS } from "@Src/constants";
import { getSearchParam } from "@Src/utils";
import Object_ from "@Src/utils/object-utils";
import { decodeSetup, DECODE_ERROR_MSG } from "@Src/utils/setup-porter";

// Store
import { useDispatch, useSelector } from "@Store/hooks";
import { updateSetupImportInfo, updateUI } from "@Store/ui-slice";
import { selectCharacter, selectSetupManageInfos, selectTarget, importSetup } from "@Store/calculator-slice";
import { checkBeforeInitNewSession } from "@Store/thunks";

// Component
import { OverwriteOptions, type OverwriteOptionsProps } from "./OverwriteOptions";

type SetupImportCenterProps = PartiallyRequired<SetupImportInfo, "calcSetup" | "target">;

function SetupImportCenterCore({ calcSetup, target, ...manageInfo }: SetupImportCenterProps) {
  const dispatch = useDispatch();
  const char = useSelector(selectCharacter);
  const currentTarget = useSelector(selectTarget);
  const calcSetupInfos = useSelector(selectSetupManageInfos);

  const [pendingCode, setPendingCode] = useState(0);
  const overwriteToAsk = useRef({
    character: false,
    target: true,
  });

  useEffect(() => {
    const delayExecute = (fn: () => void) => setTimeout(fn, 0);

    // Start of site, no setup in Calculator yet
    if (!char) {
      delayExecute(startNewSession);
      return;
    }
    if (char.name !== calcSetup.char.name) {
      delayExecute(() => setPendingCode(1));
      return;
    }
    // The imported is from My Setups and already imported
    if (manageInfo.ID && calcSetupInfos.some((info) => info.ID === manageInfo.ID)) {
      delayExecute(() => setPendingCode(2));
      return;
    }
    if (calcSetupInfos.length === MAX_CALC_SETUPS) {
      delayExecute(() => setPendingCode(3));
      return;
    }
    const sameChar = isEqual(char, calcSetup.char);
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

    setPendingCode(4);
  }, []);

  const endImport = () => {
    dispatch(updateSetupImportInfo({}));
  };

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
    dispatch(
      updateUI({
        atScreen: "CALCULATOR",
        setupDirectorActive: false,
      })
    );
    endImport();
    dispatch(updateUI({ setupDirectorActive: false }));
  };

  const startNewSession = () => {
    dispatch(
      checkBeforeInitNewSession(
        {
          ...manageInfo,
          calcSetup,
          target,
        },
        {
          onSuccess: () => {
            dispatch(updateSetupImportInfo({}));

            dispatch(
              updateUI({
                atScreen: "CALCULATOR",
                setupDirectorActive: false,
              })
            );

            if (manageInfo.importRoute === "URL") {
              notification.success({
                content: "Successfully import the setup!",
                duration: 0,
              });
            }
          },
        }
      )
    );
  };

  const resetExistingSetup = () => {
    dispatch(updateUI({ setupDirectorActive: false }));
  };

  switch (pendingCode) {
    case 0:
      return (
        <Modal.Core active closeOnMaskClick={false} onClose={() => {}}>
          <LoadingSpin size="large" />
        </Modal.Core>
      );
    case 1:
      return (
        <ConfirmModal
          active
          message="We're calculating another Character. Start a new session?"
          focusConfirm
          onConfirm={startNewSession}
          onClose={endImport}
        />
      );
    case 2:
      return (
        <ConfirmModal
          active
          message="This setup is already in the Calculator. Do you want to reset it to this version?"
          focusConfirm
          onConfirm={resetExistingSetup}
          onClose={endImport}
        />
      );
    case 3:
      return (
        <ConfirmModal
          active
          message={`The number of Setups on Calculator has reach the limit of ${MAX_CALC_SETUPS}. Start a new session?`}
          focusConfirm
          onConfirm={startNewSession}
          onClose={endImport}
        />
      );
    default:
      return (
        <Modal
          active
          preset="small"
          className="bg-surface-3"
          title="Overwrite Configuration"
          withActions
          formId="overwrite-configuration"
          onClose={endImport}
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
  }
}

export function SetupImportCenter() {
  const { calcSetup, target, ...rest } = useSelector((state) => state.ui.importInfo);

  return (
    <>
      <SetupTransshipmentPort />
      {calcSetup && target ? <SetupImportCenterCore calcSetup={calcSetup} target={target} {...rest} /> : null}
    </>
  );
}

function SetupTransshipmentPort() {
  const dispatch = useDispatch();
  const importCode = useRef(getSearchParam("importCode"));
  const appReady = useSelector((state) => state.ui.ready);

  useEffect(() => {
    window.history.replaceState(null, "", window.location.origin);
  }, []);

  useEffect(() => {
    if (appReady) {
      if (importCode.current) {
        const result = decodeSetup(importCode.current);

        if (result.isOk) {
          dispatch(
            updateSetupImportInfo({
              ...result.importInfo,
              importRoute: "URL",
            })
          );
          importCode.current = "";
          return;
        }

        message.error(DECODE_ERROR_MSG[result.error]);
      }
    } else {
      window.history.replaceState(null, "", window.location.origin);
    }
  }, [appReady]);

  return null;
}
