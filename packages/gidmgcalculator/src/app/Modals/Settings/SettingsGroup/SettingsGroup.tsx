import { ReactNode } from "react";
import { clsx } from "rond";

import { SettingControl } from "./SettingControl";
import { SettingControlProps } from "./types";

type SettingGroupCardProps = {
  children: ReactNode;
  className?: string;
};
export function SettingsGroupCard(props: SettingGroupCardProps) {
  return <div className={clsx("px-4 py-2 bg-surface-1 rounded", props.className)}>{props.children}</div>;
}

export function SettingsGroupTitle({ children }: { children: ReactNode }) {
  return <p className="text-secondary-1 text-lg font-semibold">{children}</p>;
}

export type SettingsGroupItem = SettingControlProps & {
  key: string;
  hidden?: boolean;
};

type SettingsGroupItemsProps = {
  className?: string;
  items: SettingsGroupItem[];
};
export function SettingsGroupItems({ className, items }: SettingsGroupItemsProps) {
  return (
    <div className={clsx("space-y-3", className)}>
      {items.map((item) => (item.hidden ? null : <SettingControl {...item} key={item.key} />))}
    </div>
  );
}

export type SettingsGroupProps = {
  className?: string;
  title: ReactNode;
  items: SettingsGroupItem[];
};
export function SettingsGroup({ className, title, items }: SettingsGroupProps) {
  return (
    <SettingsGroupCard className={className}>
      <SettingsGroupTitle>{title}</SettingsGroupTitle>
      <SettingsGroupItems className="mt-2" items={items} />
    </SettingsGroupCard>
  );
}
