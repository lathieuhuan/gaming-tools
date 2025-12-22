import { useState } from "react";

import { useSetupImporter } from "@/systems/setup-importer";
import { decodeSetup } from "@/utils/setup-porter/decode-setup";

import { PorterLayout } from "@/components";

export function SetupImportGate(props: { onClose: () => void }) {
  const setupImporter = useSetupImporter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handlePaste = () => {
    navigator.clipboard
      .readText()
      .then(setCode, () => setError("Sorry, your browser does not allow/support this function."));
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
              text: error,
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
