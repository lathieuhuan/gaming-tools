import type { AttackPatternInfoKey, CalcItemTarget } from "@Src/backend/types";
import type { CalcItemBonus } from "./tracker-control";

type CalcItemBuff = {
  ids: string | string[];
  bonus: CalcItemBonus;
};

type ProcessedItemBonus = Partial<Record<AttackPatternInfoKey, number>>;

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

  get(id: string | undefined) {
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

    const of = (key: AttackPatternInfoKey) => bonus[key] ?? 0;

    return {
      list,
      of,
    };
  }
}
