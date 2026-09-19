import { FaPlus } from "react-icons/fa";
import { Button, ButtonProps } from "rond";

import { useSetupDraftKit } from "./context";

export function AddButton({ className, onClick, children = "Add", ...props }: ButtonProps) {
  const { canAddMoreSetup, dispatch } = useSetupDraftKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    dispatch({ type: "ADD" });
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
