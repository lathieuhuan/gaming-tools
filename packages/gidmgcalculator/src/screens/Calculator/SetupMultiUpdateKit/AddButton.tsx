import { FaPlus } from "react-icons/fa";
import { Button, ButtonProps } from "rond";

import { MultiSetupChange } from "@Store/calculator/actions";
import { useSetupMultiUpdateKit } from "./context";

export function AddButton({ className, onClick, children = "Add", ...props }: ButtonProps) {
  const { canAddMoreSetup, updateSetups } = useSetupMultiUpdateKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    updateSetups((prev) => {
      const newSetup: MultiSetupChange = {
        ID: Date.now(),
        name: getNewSetupName(prev),
        type: "original",
        status: "NEW",
        isCompared: false,
      };

      return [...prev, newSetup];
    });

    onClick?.(e);
  };

  return (
    <Button
      className={["bg-secondary-1 text-black", className]}
      icon={<FaPlus />}
      disabled={!canAddMoreSetup}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
}

function getNewSetupName(setups: Array<{ name: string }>) {
  const existedIndexes = [1, 2, 3, 4];

  for (const { name } of setups) {
    const parts = name.split(" ");

    if (parts.length === 2 && parts[0] === "Setup" && !isNaN(+parts[1])) {
      const i = existedIndexes.indexOf(+parts[1]);

      if (i !== -1) {
        existedIndexes.splice(i, 1);
      }
    }
  }

  return "Setup " + existedIndexes[0];
}
