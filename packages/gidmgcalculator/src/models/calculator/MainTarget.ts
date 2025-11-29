import type { AppMonster, ITarget } from "@/types";

import { Target } from "@/models/base";
import { $AppSettings } from "@/services";
import Array_ from "@/utils/Array";

export class MainTarget extends Target {
  constructor(info: Partial<ITarget> = {}, data: AppMonster) {
    const { targetLevel } = $AppSettings.get();
    const { inputConfigs = [] } = data;
    const variantConfig = data.variant?.types.at(0);

    const {
      level = targetLevel,
      inputs = Array_.toArray(inputConfigs).map(() => 0),
      variantType = typeof variantConfig === "object" ? variantConfig.value : variantConfig,
    } = info;
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

    super(
      {
        code: data.code,
        level,
        variantType,
        inputs,
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
      },
      data
    );
  }

  static DEFAULT() {
    const defaultMonster: AppMonster = {
      code: 0,
      title: "Custom Target",
      resistance: { base: 10 },
    };

    return new MainTarget({}, defaultMonster);
  }

  // update(info: Partial<ITarget>) {
  //   return new MainTarget({ ...this, ...info }, this.data);
  // }
}
