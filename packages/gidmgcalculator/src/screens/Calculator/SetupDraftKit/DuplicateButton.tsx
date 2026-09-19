import { FaCopy } from "react-icons/fa";
import { Button, ButtonProps } from "rond";

import { useSetupDraftKit } from "./context";

export function DuplicateButton({ setupId, onClick, ...props }: ButtonProps & { setupId: number }) {
  const { canAddMoreSetup, dispatch } = useSetupDraftKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    dispatch({ type: "DUPLICATE", setupId });
    onClick?.(e);
  };

  return <Button icon={<FaCopy />} disabled={!canAddMoreSetup} onClick={handleClick} {...props} />;
}
