import { useMemo, useState } from "react";
import { Button } from "rond";

import { CalcSetup } from "@/logic/calculator";
import { encodeSetup } from "@/logic/setupCodec";
import { SetupPorter, type SetupPorterProps } from "./SetupPorter";

type SetupExporterProps = {
  setup: CalcSetup;
  onCancel?: () => void;
};

export function SetupExporter({ setup, onCancel }: SetupExporterProps) {
  const [status, setStatus] = useState<"SUCCESS" | "NOT_SUPPORT" | "IDLE">("IDLE");

  const encodedData = useMemo(() => encodeSetup(setup), []);

  const handleCopyURL = () => {
    navigator.clipboard.writeText(`${window.location.origin}?importCode=${encodedData}`).then(
      () => setStatus("SUCCESS"),
      () => setStatus("NOT_SUPPORT"),
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(encodedData).then(
      () => setStatus("SUCCESS"),
      () => setStatus("NOT_SUPPORT"),
    );
  };

  let message: SetupPorterProps["message"];

  switch (status) {
    case "SUCCESS":
      message = {
        text: "Successfully copied to Clipboard.",
        type: "success",
      };
      break;
    case "NOT_SUPPORT":
      message = {
        text: "Sorry. Your browser does not allow/support this function.",
        type: "error",
      };
      break;
    default:
      status satisfies "IDLE";
  }

  return (
    <SetupPorter
      note={
        <p className="text-danger-2">
          Please do NOT save this code/link for long-term use. It will be outdated when new format
          is released.
        </p>
      }
      textareaProps={{
        value: encodedData,
        readOnly: true,
      }}
      message={message}
      actions={
        <>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleCopyURL}>Copy URL</Button>
          <Button variant="primary" autoFocus onClick={handleCopy}>
            Copy
          </Button>
        </>
      }
    />
  );
}
