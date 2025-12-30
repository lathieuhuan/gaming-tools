import type { Weapon } from "@/models/base";
import type { IWeaponBasic } from "@/types";

export function WeaponSubtitle({ item }: { item: IWeaponBasic }) {
  return (
    <div className="text-sm text-light-4 flex items-center gap-2">
      <span>Level: {item.level}</span>
      <span className="text-dark-line">|</span>
      <span>Refinement: {item.refi}</span>
    </div>
  );
}

type WeaponSummaryProps = {
  className?: string;
  weapon: Weapon;
};

export function WeaponSummary({ className, weapon }: WeaponSummaryProps) {
  return (
    <div className={className}>
      <p className="text-primary-1 font-semibold">{weapon.data.name}</p>
      <WeaponSubtitle item={weapon} />
    </div>
  );
}
