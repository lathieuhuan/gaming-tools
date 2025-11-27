import type { ITarget } from "@/types";

import { Target } from "@/models/base";
import { $AppSettings } from "@/services";

export class MainTarget extends Target {
  constructor(info: Partial<ITarget> = {}) {
    const { targetLevel } = $AppSettings.get();
    const { level = targetLevel } = info;
    const {
      pyro = 10,
      hydro = 10,
      electro = 10,
      cryo = 10,
      geo = 10,
      anemo = 10,
      dendro = 10,
      phys = 10,
    } = info.resistances || {};

    super({
      code: 0,
      level,
      resistances: {
        pyro,
        hydro,
        electro,
        cryo,
        geo,
        anemo,
        dendro,
        phys,
      },
    });
  }

  update(info: Partial<ITarget>) {
    return new MainTarget({ ...this, ...info });
  }
}
