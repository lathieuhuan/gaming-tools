import { useState } from "react";

import { decodeSetup } from "@/logic/setupCodec/decodeSetup";

import { PorterLayout } from "@/components/SetupExporter";
import { EXPORTED_SETUP_VERSIONS } from "@/constants/config";
import { importSetup } from "@Store/ui";

export function SetupImportGate(props: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handlePaste = () => {
    navigator.clipboard
      .readText()
      .then(setCode, () => setError("Sorry, your browser does not allow/support this function."));
  };

  const handleImport = () => {
    const actualCode = code.trim();

    if (!actualCode.length) {
      return;
    }
    const result = decodeSetup(actualCode);

    if (result.isOk) {
      importSetup({
        meta: {
          id: Date.now(),
          name: "New setup",
          type: "original",
          source: "URL", // TODO check
        },
        params: result.setup,
      });
      props.onClose();
      return;
    }

    setError(result.error);
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
      warning={
        <p className="text-right">
          Supported versions: {EXPORTED_SETUP_VERSIONS.map((v) => `v${v}`).join(", ")}
        </p>
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
