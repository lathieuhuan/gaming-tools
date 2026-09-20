import { useState } from "react";
import { Button } from "rond";

import type { CalcSetup } from "@/logic/calculator";

import { EXPORTED_SETUP_VERSIONS } from "@/constants/config";
import { decodeSetup } from "@/logic/setupCodec";

import { SetupPorter } from "./SetupPorter";

export type SetupImporterProps = {
  onImport?: (setup: CalcSetup) => void;
  onCancel?: () => void;
};

export function SetupImporter({ onImport, onCancel }: SetupImporterProps) {
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
      onImport?.(result.setup);
      return;
    }

    setError(result.error);
  };

  return (
    <SetupPorter
      textareaProps={{
        placeholder: "Users are recommended to save their work (download data) before importing.",
        value: code,
        onChange: (e) => setCode(e.target.value),
      }}
      note={
        <p className="text-right">
          Supported versions: {EXPORTED_SETUP_VERSIONS.map((v) => `v${v}`).join(", ")}
        </p>
      }
      message={
        error
          ? {
              text: error,
              type: "error",
            }
          : undefined
      }
      actions={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="primary" autoFocus onClick={handlePaste}>
            Paste
          </Button>
          <Button onClick={handleImport}>Proceed</Button>
        </>
      }
    />
  );
}
