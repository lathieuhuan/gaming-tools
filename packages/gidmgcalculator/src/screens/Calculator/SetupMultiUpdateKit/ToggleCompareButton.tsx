import { FaBalanceScaleLeft } from "react-icons/fa";
import { Button, ButtonProps } from "rond";

import { useSetupMultiUpdateKit } from "./context";

export function ToggleCompareButton({
  setupId,
  onClick,
  ...props
}: ButtonProps & { setupId: number }) {
  const { setups, updateSetups } = useSetupMultiUpdateKit();

  const isCompared = setups.some(
    (comparedSetup) => comparedSetup.ID === setupId && comparedSetup.isCompared,
  );

  const handleClick: ButtonProps["onClick"] = (e) => {
    updateSetups((prev) => {
      return prev.map((setup) => {
        if (setup.ID !== setupId) {
          return setup;
        }

        return {
          ...setup,
          isCompared: !setup.isCompared,
        };
      });
    });

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
