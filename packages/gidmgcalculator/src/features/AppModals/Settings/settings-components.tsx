import { Checkbox } from "rond";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}
export function Section({ title, children }: SectionProps) {
  return (
    <div className="px-4 py-2 bg-surface-1 rounded">
      <p className="text-secondary-1 text-lg font-semibold">{title}</p>
      <div className="mt-2 space-y-3">{children}</div>
    </div>
  );
}

interface CheckSettingProps {
  label: string;
  defaultChecked: boolean;
  onChange: () => void;
}
export function CheckSetting({ label, ...rest }: CheckSettingProps) {
  return (
    <label className="flex items-center justify-between glow-on-hover">
      <span>{label}</span>
      <Checkbox className="ml-4" {...rest} />
    </label>
  );
}
