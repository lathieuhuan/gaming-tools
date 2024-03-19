import { WikiImage } from "@Src/components";

interface GearIconProps {
  item: { beta?: boolean; icon: string; rarity?: number };
  disabled?: boolean;
  onClick?: () => void;
}
export const GearIcon = ({ item, disabled, onClick }: GearIconProps) => {
  return (
    <button
      className={
        `w-16 h-16 p-1 rounded flex bg-gradient-${item.rarity} ` +
        (onClick && !disabled ? "glow-on-hover" : "cursor-default opacity-50")
      }
      disabled={disabled}
      onClick={onClick}
    >
      <WikiImage className="w-full h-full" src={item.icon} />
    </button>
  );
};
