import { useState } from "react";
import { Modal } from "rond";

import { DECODE_ERROR_MSG, decodeSetup, type DecodeError } from "@Src/utils/setup-porter";
import { useDispatch } from "@Store/hooks";
import { updateSetupImportInfo } from "@Store/ui-slice";
import { PorterLayout } from "./PorterLayout";

type ImportError = "NOT_SUPPORT" | DecodeError;

function SetupImporterCore(props: { onClose: () => void }) {
  const dispatch = useDispatch();
  const [code, setCode] = useState("");
  const [error, setError] = useState<ImportError | "">("");

  return (
    <PorterLayout
      heading="Import setup"
      textareaAttrs={{
        placeholder: "Users are recommended to save their work (download data) before importing.",
        value: code,
        onChange: (e) => setCode(e.target.value),
      }}
      message={
        error
          ? {
              text:
                error === "NOT_SUPPORT"
                  ? "Sorry, your browser does not allow/support this function."
                  : DECODE_ERROR_MSG[error],
              type: "error",
            }
          : undefined
      }
      moreButtons={[
        {
          children: "Paste",
          variant: "primary",
          autoFocus: true,
          onClick: () => {
            navigator.clipboard.readText().then(setCode, () => setError("NOT_SUPPORT"));
          },
        },
        {
          children: "Proceed",
          onClick: () => {
            const actualCode = code.trim();

            if (actualCode.length) {
              const result = decodeSetup(actualCode);

              if (result.isOk) {
                dispatch(updateSetupImportInfo(result.importInfo));
                props.onClose();
                return;
              }

              setError(result.error);
            }
          },
        },
      ]}
      onClose={props.onClose}
    />
  );
}

export const SetupImporter = Modal.coreWrap(SetupImporterCore, { preset: "small" });
