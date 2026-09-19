import { SiTarget } from "react-icons/si";
import { Button, ButtonProps } from "rond";

import { MultiSetupChange } from "@Store/calculator/actions";
import { useSetupMultiUpdateKit } from "./context";

export function SelectStandardButton({
  setup,
  onClick,
  ...props
}: ButtonProps & { setup: MultiSetupChange }) {
  const { setups, standardId, setStandardId } = useSetupMultiUpdateKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    setStandardId(setup.ID);
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
