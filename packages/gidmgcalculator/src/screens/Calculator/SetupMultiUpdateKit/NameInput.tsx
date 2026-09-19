import { Input, InputProps } from "rond";

import { useSetupMultiUpdateKit } from "./context";

export function NameInput({ setupId, onChange, ...props }: InputProps & { setupId: number }) {
  const { updateSetups } = useSetupMultiUpdateKit();

  const handleChange: InputProps["onChange"] = (value) => {
    updateSetups((prev) => {
      return prev.map((setup) => {
        if (setup.ID !== setupId) {
          return setup;
        }

        return { ...setup, name: value };
      });
    });

    onChange?.(value);
  };

  return (
    <Input placeholder="Enter Setup's name" maxLength={20} onChange={handleChange} {...props} />
  );
}
