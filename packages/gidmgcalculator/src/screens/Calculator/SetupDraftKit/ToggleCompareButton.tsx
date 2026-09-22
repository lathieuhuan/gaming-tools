import { FaBalanceScaleLeft } from "react-icons/fa";
import { Button, ButtonProps } from "rond";

import { useSetupDraftKit } from "./context";

export function ToggleCompareButton({
  setupId,
  onClick,
  ...props
}: ButtonProps & { setupId: number }) {
  const { setups, dispatch } = useSetupDraftKit();

  const isCompared = setups.some(
    (comparedSetup) => comparedSetup.ID === setupId && comparedSetup.isCompared,
  );

  const handleClick: ButtonProps["onClick"] = (e) => {
    dispatch({ type: "TOGGLE_COMPARE", setupId });
    onClick?.(e);
  };

  return (
    <Button
      data-active={isCompared}
      icon={<FaBalanceScaleLeft />}
      onClick={handleClick}
      {...props}
    />
  );
}
