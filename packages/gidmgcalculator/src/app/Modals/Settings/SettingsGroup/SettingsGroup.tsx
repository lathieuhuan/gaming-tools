import { ReactNode } from "react";
import { clsx } from "rond";
import { SettingControl, SettingControlProps } from "./SettingControl";

export function SettingsGroupTitle({ children }: { children: ReactNode }) {
  return <p className="text-secondary-1 text-lg font-semibold">{children}</p>;
}

type SettingGroupCardProps = {
  children: ReactNode;
  className?: string;
};

export function SettingsGroupCard(props: SettingGroupCardProps) {
  return <div className={clsx("px-4 py-2 bg-surface-1 rounded", props.className)}>{props.children}</div>;
}

export type SettingsGroupItem = SettingControlProps<any> & {
  key: string;
  hidden?: boolean;
};

export type SettingsGroupProps = {
  className?: string;
  title: ReactNode;
  items: SettingsGroupItem[];
};

export function SettingsGroup({ className, title, items }: SettingsGroupProps) {
  return (
    <SettingsGroupCard className={className}>
      <SettingsGroupTitle>{title}</SettingsGroupTitle>

      <div className="mt-2 space-y-3">
        {items.map((item) => (item.hidden ? null : <SettingControl {...item} key={item.key} />))}
      </div>
    </SettingsGroupCard>
  );
}
