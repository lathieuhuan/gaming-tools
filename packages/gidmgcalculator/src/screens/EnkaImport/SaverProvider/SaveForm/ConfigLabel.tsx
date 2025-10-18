import { ReactNode } from "react";

type ConfigLabelProps = {
  children: ReactNode;
  owner?: string | null;
};

export function ConfigLabel({ children, owner }: ConfigLabelProps) {
  return (
    <div>
      <div>{children}</div>
      {owner && <p className="text-sm text-light-hint">{owner}</p>}
    </div>
  );
}
