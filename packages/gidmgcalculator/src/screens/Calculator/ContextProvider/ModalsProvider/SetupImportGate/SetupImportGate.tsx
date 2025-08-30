import { useState } from "react";

import { useSetupImporter } from "@Src/systems/setup-importer";
import { DECODE_ERROR_MSG, decodeSetup, type DecodeError } from "@Src/utils/setup-porter";

import { PorterLayout } from "@Src/components";

type ImportError = "NOT_SUPPORT" | DecodeError;

export function SetupImportGate(props: { onClose: () => void }) {
  const setupImporter = useSetupImporter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<ImportError | "">("");

  const handlePaste = () => {
    navigator.clipboard.readText().then(setCode, () => setError("NOT_SUPPORT"));
  };

  const handleImport = () => {
    const actualCode = code.trim();

    if (actualCode.length) {
      const result = decodeSetup(actualCode);

      if (result.isOk) {
        setupImporter.import(result.importInfo);
        props.onClose();
        return;
      }

      setError(result.error);
    }
  };

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
          onClick: handlePaste,
        },
        {
          children: "Proceed",
          onClick: handleImport,
        },
      ]}
      onClose={props.onClose}
    />
  );
}
