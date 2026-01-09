import { clsx } from "rond";

import type { Weapon } from "@/models/base";
import type { IWeaponBasic } from "@/types";

import { CONTINUE_MSG, genNewEntityMessage, genSameEntityMessage } from "../_config";

import { WeaponSummary } from "./WeaponSummary";
import { isExactWeapon } from "../_utils";

type CaseProps = {
  message: string;
  hint?: string;
  withDivider?: boolean;
  children: React.ReactNode;
};

const Case = ({ message, hint, withDivider, children }: CaseProps) => {
  return (
    <div>
      {withDivider && <div className="mx-auto my-4 h-px w-1/2 bg-dark-line" />}

      <div className="mb-2">
        <p className="text-light-3 text-sm">{message}</p>
        {hint && <p className="mt-1 text-light-hint text-sm">{hint}</p>}
      </div>
      {children}
    </div>
  );
};

type WeaponSaverProps = {
  className?: string;
  weapon: Weapon;
  currentWeapon?: IWeaponBasic;
  sameWeapons: IWeaponBasic[];
  sameWeaponsAreWithoutOwner?: boolean;
  selectedWeapon?: IWeaponBasic;
  onSelectWeapon?: (weapon: IWeaponBasic) => void;
};

export function WeaponSaver({
  className,
  weapon,
  currentWeapon,
  sameWeapons,
  sameWeaponsAreWithoutOwner,
  selectedWeapon,
  onSelectWeapon,
}: WeaponSaverProps) {
  const hasNoSameWeapons = !currentWeapon && !sameWeapons.length;

  const mainMessage = clsx(hasNoSameWeapons && genNewEntityMessage("Weapon"), CONTINUE_MSG);
  const currentWeaponMessage = `${weapon.owner} seems to be equipped with the old version of this weapon.`;
  const sameWeaponsMessage = genSameEntityMessage("Weapon", {
    withoutOwner: sameWeaponsAreWithoutOwner,
  });

  return (
    <div className={className}>
      <Case message={mainMessage}>
        <WeaponSummary variant="primary" label={weapon.data.name} weapon={weapon} />
      </Case>

      {currentWeapon && (
        <Case message={currentWeaponMessage} hint="Select to re-use and update it." withDivider>
          <WeaponSummary
            variant="primary"
            label="Current"
            weapon={currentWeapon}
            selectable
            selected={selectedWeapon?.ID === currentWeapon.ID}
            onSelect={() => onSelectWeapon?.(currentWeapon)}
          />
        </Case>
      )}

      {sameWeapons.length !== 0 && (
        <Case message={sameWeaponsMessage.main} hint={sameWeaponsMessage.hint} withDivider>
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
        </Case>
      )}
    </div>
  );
}
