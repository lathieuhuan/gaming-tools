import type { CalcItemTarget } from "@Src/backend/types";
import type { CalcItemBonus, ProcessedItemBonus } from "../calculation.types";

type CalcItemBuff = {
  ids: string | string[];
  bonus: CalcItemBonus;
};

export class CalcItemBuffControl {
  private buffs: CalcItemBuff[] = [];

  add(value: number, target: CalcItemTarget, description: string) {
    this.buffs.push({
      ids: target.id,
      bonus: {
        [target.path]: { desc: description, value: value },
      },
    });
  }

  get(id?: string) {
    const list: CalcItemBonus[] = [];
    const bonus: ProcessedItemBonus = {};

    if (id) {
      for (const buff of this.buffs) {
        if (Array.isArray(buff.ids) ? buff.ids.includes(id) : buff.ids === id) {
          list.push(buff.bonus);

          for (const k in buff.bonus) {
            const key = k as keyof typeof buff.bonus;
            bonus[key] = (bonus[key] ?? 0) + (buff.bonus[key]?.value ?? 0);
          }
        }
      }
    }
    return [list, bonus] as const;
  }
}
