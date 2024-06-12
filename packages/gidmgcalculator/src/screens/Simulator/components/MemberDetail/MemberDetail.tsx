import { useEffect, useState } from "react";
import { TotalAttribute } from "@Backend";

import { $AppWeapon } from "@Src/services";
import { AttributeTable, GenshinImage } from "@Src/components";
import { useActiveMember } from "@Simulator/providers";

export function MemberDetail(props: { className?: string }) {
  const [totalAttr, setTotalAttr] = useState<TotalAttribute | null>(null);
  const activeMember = useActiveMember();

  useEffect(() => {
    if (activeMember) {
      const { initialTotalAttr, unsubscribe } = activeMember?.tools?.subscribeTotalAttr(setTotalAttr);

      setTotalAttr(initialTotalAttr);
      return unsubscribe;
    }
    return undefined;
  }, [activeMember]);

  console.log("render: MemberDetail");

  if (!activeMember || !totalAttr) {
    return null;
  }
  const { info, data } = activeMember;

  const appWeapon = $AppWeapon.get(info.weapon.code)!;

  return (
    <div className={props.className}>
      <div className="h-full space-y-3 hide-scrollbar">
        <div>
          <h3 className={`text-xl text-${data.vision} font-bold`}>{info.name}</h3>
          <p>
            Level: {info.level} - C{info.cons}
          </p>
        </div>
        <GenshinImage className="w-12 h-12" fallbackCls="p-1" src={appWeapon.icon} />
        <AttributeTable attributes={totalAttr} />
      </div>
    </div>
  );
}
