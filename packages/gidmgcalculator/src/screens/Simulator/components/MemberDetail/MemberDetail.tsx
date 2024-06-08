import { $AppWeapon } from "@Src/services";
import { useActiveMember, useTotalAttribute } from "@Simulator/providers";

import { AttributeTable, GenshinImage } from "@Src/components";

export function MemberDetail() {
  const activeMember = useActiveMember();
  const totalAttr = useTotalAttribute();

  if (!activeMember || !totalAttr) {
    return null;
  }
  const { char } = activeMember;

  const appWeapon = $AppWeapon.get(char.weapon.code)!;

  return (
    <div>
      <h3>{char.name}</h3>
      <p>
        Level: {char.level} - C{char.cons}
      </p>
      <GenshinImage className="w-14 h-14" src={appWeapon.icon} />
      <AttributeTable attributes={totalAttr.finalize()} />
    </div>
  );
}
