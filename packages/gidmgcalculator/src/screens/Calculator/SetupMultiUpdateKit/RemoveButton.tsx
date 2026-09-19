import { Button, ButtonProps, TrashCanSvg } from "rond";

import { useSetupMultiUpdateKit } from "./context";

export function RemoveButton({ setupId, onClick, ...props }: ButtonProps & { setupId: number }) {
  const { setups, updateSetups } = useSetupMultiUpdateKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    updateSetups((prev) => {
      const index = prev.findIndex((setup) => setup.ID === setupId);

      if (index === -1) {
        return prev;
      }

      const newTempSetups = [...prev];

      if (prev[index].status === "OLD") {
        newTempSetups[index] = {
          ...prev[index],
          status: "REMOVED",
          isCompared: false,
        };
      } else {
        newTempSetups.splice(index, 1);
      }

      return newTempSetups;
    });

    onClick?.(e);
  };

  return (
    <Button icon={<TrashCanSvg />} disabled={setups.length <= 1} onClick={handleClick} {...props} />
  );
}
