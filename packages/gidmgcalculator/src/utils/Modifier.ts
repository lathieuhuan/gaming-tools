import type { EntityModifier, IModifierCtrl, IModifierCtrlBasic } from "@/types";

export function enhanceCtrls<T extends EntityModifier, TExtra extends object = never>(
  ctrls: IModifierCtrlBasic[],
  mods?: T[],
  extraProps: TExtra = {} as TExtra,
  extraCheck: (ctrl: IModifierCtrlBasic, mod: T) => boolean = () => true
) {
  if (mods) {
    return ctrls.reduce<(IModifierCtrl<T> & TExtra)[]>((result, ctrl) => {
      const data = mods.find((mod) => mod.index === ctrl.id && extraCheck(ctrl, mod));
      return data ? result.concat({ ...ctrl, data, ...extraProps }) : result;
    }, []);
  }

  return [];
}
