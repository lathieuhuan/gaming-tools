import { $AppWeapon } from "@Src/services";
import { useActiveMember, useToolbox } from "@Simulator/providers";

import { AttributeTable, GenshinImage } from "@Src/components";

interface MemberDetailProps {
  className?: string;
}
export function MemberDetail({ className = "" }: MemberDetailProps) {
  const activeMember = useActiveMember();
  const toolbox = useToolbox();

  if (!activeMember || !toolbox) {
    return null;
  }
  const { char, appChar } = activeMember;

  const appWeapon = $AppWeapon.get(char.weapon.code)!;

  return (
    <div className={"p-4 h-full rounded-md bg-surface-1 " + className}>
      <div className="h-full space-y-3 hide-scrollbar">
        <div>
          <h3 className={`text-xl text-${appChar.vision} font-bold`}>{char.name}</h3>
          <p>
            Level: {char.level} - C{char.cons}
          </p>
        </div>
        <GenshinImage className="w-12 h-12" fallbackCls="p-1" src={appWeapon.icon} />
        <AttributeTable attributes={toolbox.totalAttr.finalize()} />
      </div>
    </div>
  );
}
