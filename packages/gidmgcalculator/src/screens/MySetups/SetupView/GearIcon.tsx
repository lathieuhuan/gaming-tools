import { GenshinImage } from "@/components";

type GearIconProps = {
  item: { beta?: boolean; icon?: string; rarity?: number };
  disabled?: boolean;
  onClick?: () => void;
};

export function GearIcon({ item, disabled, onClick }: GearIconProps) {
  return (
    <button
      className={
        `w-16 h-16 p-1 rounded flex bg-gradient-${item.rarity} ` +
        (onClick && !disabled ? "glow-on-hover" : "cursor-default opacity-50")
      }
      disabled={disabled}
      onClick={onClick}
    >
      <GenshinImage className="w-full h-full" src={item.icon} fallbackCls="p-3" />
    </button>
  );
}
