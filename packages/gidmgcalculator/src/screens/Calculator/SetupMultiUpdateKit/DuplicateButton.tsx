import { FaCopy } from "react-icons/fa";
import { Button, ButtonProps } from "rond";

import { MultiSetupChange } from "@Store/calculator/actions";
import { getCopyName } from "@Store/calculator/utils";
import { useSetupMultiUpdateKit } from "./context";

export function DuplicateButton({ setupId, onClick, ...props }: ButtonProps & { setupId: number }) {
  const { setups, canAddMoreSetup, updateSetups } = useSetupMultiUpdateKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    updateSetups((prev) => {
      const rootSetup = prev.find((setup) => setup.ID === setupId);

      if (!rootSetup) {
        return prev;
      }

      const newSetupName = getCopyName(rootSetup.name, setups) || "New setup";

      const newSetup: MultiSetupChange = {
        ...rootSetup,
        ID: Date.now(),
        name: newSetupName,
        type: "original",
        originId: rootSetup.ID,
        status: "DUPLICATE",
      };

      return [...prev, newSetup];
    });

    onClick?.(e);
  };

  return <Button icon={<FaCopy />} disabled={!canAddMoreSetup} onClick={handleClick} {...props} />;
}
