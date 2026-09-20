import type { CalcSetup } from "@/logic/calculator";
import type { SetupImportMeta } from "@Store/ui/types";
import type { ExactOmit } from "rond";

import { sendToImportCenter } from "@Store/ui";

import { ModalAction, type ModalActionProps } from "@/components/ModalAction";
import { SETUP_PORTER_MODAL_PROPS, SetupImporter } from "@/components/SetupPorters";

type SetupImportActionProps = ExactOmit<ModalActionProps, "content" | "preset" | "className"> & {
  meta?: Partial<Omit<SetupImportMeta, "source">>;
  onImportStart?: (setup: CalcSetup) => void;
};

export function SetupImportAction({ meta = {}, onImportStart, ...rest }: SetupImportActionProps) {
  const handleImport = (setup: CalcSetup) => {
    onImportStart?.(setup);

    sendToImportCenter(setup, {
      ...meta,
      source: "CALCULATOR",
    });
  };

  return (
    <ModalAction
      title="Import Setup"
      {...SETUP_PORTER_MODAL_PROPS}
      {...rest}
      content={(_, setOpen) => (
        <SetupImporter
          onImport={(setup) => {
            handleImport(setup);
            setOpen(false);
          }}
          onCancel={() => setOpen(false)}
        />
      )}
    />
  );
}
