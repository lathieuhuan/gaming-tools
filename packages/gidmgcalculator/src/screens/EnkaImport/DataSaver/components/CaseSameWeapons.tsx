import type { RawWeapon } from "@/types";

import { SavingCase, SavingCaseProps } from "./SavingCase";
import { WeaponSummary } from "./WeaponSummary";

type CaseSameWeaponsProps = Pick<SavingCaseProps, "message" | "hint" | "withDivider"> & {
  sameWeapons: RawWeapon[];
  selectedWeapon?: RawWeapon;
  onSelectWeapon?: (weapon: RawWeapon) => void;
};

export function CaseSameWeapons({
  sameWeapons,
  selectedWeapon,
  onSelectWeapon,
  ...caseProps
}: CaseSameWeaponsProps) {
  return (
    <SavingCase {...caseProps}>
      <div className="space-y-2">
        {sameWeapons.map((item, index) => (
          <WeaponSummary
            key={item.ID}
            label={
              <span>
                <span>Weapon {index + 1}</span>{" "}
                {item.owner && <span className="text-light-4">({item.owner})</span>}
              </span>
            }
            weapon={item}
            selectable
            selected={selectedWeapon?.ID === item.ID}
            onSelect={() => onSelectWeapon?.(item)}
          />
        ))}
      </div>
    </SavingCase>
  );
}
