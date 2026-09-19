import { Button, ButtonProps, TrashCanSvg } from "rond";

import { useSetupDraftKit } from "./context";

export function RemoveButton({ setupId, onClick, ...props }: ButtonProps & { setupId: number }) {
  const { setups, dispatch } = useSetupDraftKit();

  const handleClick: ButtonProps["onClick"] = (e) => {
    dispatch({ type: "REMOVE", setupId });
    onClick?.(e);
  };

  return (
    <Button icon={<TrashCanSvg />} disabled={setups.length <= 1} onClick={handleClick} {...props} />
  );
}
