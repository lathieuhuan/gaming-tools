import { useMemo, useState } from "react";

import type { CalcSetup } from "@/models/calculator";
import { encodeSetup } from "@/utils/setup-porter";
import { PorterLayout } from "./PorterLayout";
import { EXPORTED_SETUP_VERSION, LEGACY_EXPORTED_SETUP_VERSION } from "@/constants/config";

type SetupExporterProps = {
  setupName: string;
  calcSetup: CalcSetup;
  onClose: () => void;
};

export const SetupExporter = ({ setupName, calcSetup, onClose }: SetupExporterProps) => {
  const [status, setStatus] = useState<"SUCCESS" | "NOT_SUPPORT" | "">("");

  const encodedData = useMemo(() => encodeSetup(calcSetup), []);

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
      warning={
        <>
          <p className="text-danger-2">
            Please do NOT save this code/link for long-term use. It will be outdated when new format
            is released.
          </p>
          <p className="mt-2 text-right">
            Supported versions: V{EXPORTED_SETUP_VERSION}, V{LEGACY_EXPORTED_SETUP_VERSION}
          </p>
        </>
      }
      moreButtons={[
        {
          children: "Copy URL",
          onClick: () => {
            navigator.clipboard
              .writeText(`${window.location.origin}?importCode=${encodedData}`)
              .then(
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
