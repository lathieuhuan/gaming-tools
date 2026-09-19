import { Input, InputProps } from "rond";

import { useSetupDraftKit } from "./context";

export function NameInput({ setupId, onChange, ...props }: InputProps & { setupId: number }) {
  const { dispatch } = useSetupDraftKit();

  const handleChange: InputProps["onChange"] = (value) => {
    dispatch({ type: "RENAME", setupId, name: value });
    onChange?.(value);
  };

  return (
    <Input placeholder="Enter Setup's name" maxLength={20} onChange={handleChange} {...props} />
  );
}
