import { SiTarget } from "react-icons/si";
import { Button, ButtonProps } from "rond";

import { MultiSetupChange } from "@Store/calculator/actions";
import { useSetupDraftKit } from "./context";

export function SelectStandardButton({
  setup,
  onClick,
  ...props
}: ButtonProps & { setup: MultiSetupChange }) {
  const { setups, standardId, dispatch } = useSetupDraftKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    dispatch({ type: "SELECT_STANDARD", setupId: setup.ID });
    onClick?.(e);
  };

  return (
    <Button
      data-active={setup.ID === standardId}
      icon={<SiTarget />}
      disabled={!setup.isCompared || setups.length <= 1}
      onClick={handleClick}
      {...props}
    />
  );
}
