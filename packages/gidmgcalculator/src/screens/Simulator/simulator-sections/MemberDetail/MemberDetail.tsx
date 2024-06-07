import { ATTRIBUTE_STAT_TYPES, TotalAttribute } from "@Backend";
import { AttributeTable, GenshinImage } from "@Src/components";
import { $AppWeapon } from "@Src/services";
import { useActiveMember, useTotalAttribute } from "../../SimulatorProviders";
import { TotalAttributeControl } from "../../controls";

function finalize(control: TotalAttributeControl): TotalAttribute {
  const totalAttr = {} as TotalAttribute;

  for (const key of ATTRIBUTE_STAT_TYPES) {
    if (key === "hp_" || key === "atk_" || key === "def_") {
      continue;
    }
    if (key === "hp" || key === "atk" || key === "def") {
      totalAttr[`${key}_base`] = control.getBase(key);
    }
    totalAttr[key] = control.getTotal(key, "ALL");
  }
  return totalAttr;
}

export function MemberDetail() {
  const { char } = useActiveMember();
  const totalAttr = useTotalAttribute();

  const appWeapon = $AppWeapon.get(char.weapon.code)!;

  return (
    <div>
      <h3>{char.name}</h3>
      <p>
        Level: {char.level} - C{char.cons}
      </p>
      <GenshinImage className="w-14 h-14" src={appWeapon.icon} />
      <AttributeTable attributes={finalize(totalAttr)} />
    </div>
  );
}
