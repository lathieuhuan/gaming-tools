import { useMemo, useState } from "react";

import type { CalcSetup } from "@/models/calculator";
import { encodeSetup } from "@/utils/setup-porter";
import { PorterLayout } from "./PorterLayout";

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
