import type { EntityModifier, IModifierCtrl, IModifierCtrlBasic } from "@/types";

export function enhanceCtrls<T extends EntityModifier>(
  ctrls: IModifierCtrlBasic[],
  mods?: T[],
  extraCheck: (ctrl: IModifierCtrlBasic, mod: T) => boolean = () => true
) {
  if (mods) {
    return ctrls.reduce<IModifierCtrl<T>[]>((result, ctrl) => {
      const data = mods.find((mod) => mod.index === ctrl.id && extraCheck(ctrl, mod));
      return data ? result.concat({ ...ctrl, data }) : result;
    }, []);
  }

  return [];
}
