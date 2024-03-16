import { useState } from "react";
import { Modal } from "rond";

import type { CalcSetup, Target } from "@Src/types";
import { encodeSetup } from "./setup-porter.utils";
import { PorterLayout } from "./PorterLayout";

interface SetupExporterProps {
  setupName: string;
  calcSetup: CalcSetup;
  target: Target;
  onClose: () => void;
}
const SetupExporterCore = ({ setupName, calcSetup, target, onClose }: SetupExporterProps) => {
  const [status, setStatus] = useState<"SUCCESS" | "NOT_SUPPORT" | "">("");

  const encodedData = encodeSetup(calcSetup, target);

  return (
    <PorterLayout
      heading={`Share ${setupName}`}
      textareaAttrs={{
        value: encodedData,
        readOnly: true,
      }}
      message={
        status
          ? {
              text:
                status === "SUCCESS"
                  ? "Successfully copied to Clipboard."
                  : "Sorry. Your browser does not allow/support this function.",
              type: status === "SUCCESS" ? "success" : "error",
            }
          : undefined
      }
      moreButtons={[
        {
          children: "Copy URL",
          onClick: () => {
            navigator.clipboard.writeText(`${window.location.origin}?importCode=${encodedData}`).then(
              () => setStatus("SUCCESS"),
              () => setStatus("NOT_SUPPORT")
            );
          },
        },
        {
          children: "Copy",
          variant: "primary",
          autoFocus: true,
          onClick: () => {
            navigator.clipboard.writeText(encodedData).then(
              () => setStatus("SUCCESS"),
              () => setStatus("NOT_SUPPORT")
            );
          },
        },
      ]}
      onClose={onClose}
    />
  );
};

export const SetupExporter = Modal.coreWrap(SetupExporterCore, { preset: "small" });
