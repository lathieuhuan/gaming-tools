import type { Weapon } from "@/models/base";

import { SavingCase, SavingCaseProps } from "./SavingCase";
import { WeaponSummary } from "./WeaponSummary";

type CaseNewWeaponProps = Pick<SavingCaseProps, "message" | "hint" | "withDivider"> & {
  weapon: Weapon;
};

export function CaseNewWeapon({ weapon, ...props }: CaseNewWeaponProps) {
  return (
    <SavingCase {...props}>
      <WeaponSummary variant="primary" label={weapon.data.name} weapon={weapon} />
    </SavingCase>
  );
}
