import type { ElementModCtrl } from "@Src/types";
import type {
  AppCharacter,
  AttackElement,
  AttackPattern,
  CalcItem,
  CalcItemFlatFactor,
  CalcItemMultFactor,
} from "../../types";
import type { CalcInfusion } from "../calculation.types";
import type { CalcListConfigControl } from "../controls";
import { CharacterCalc } from "../utils";

class AttackPatternConfig {
  private appChar: AppCharacter;
  private elmtModCtrls: ElementModCtrl;
  private infusion: CalcInfusion;

  constructor(appChar: AppCharacter, elmtModCtrls: ElementModCtrl, infusion: CalcInfusion) {
    this.appChar = appChar;
    this.elmtModCtrls = elmtModCtrls;
    this.infusion = infusion;
  }

  config(patternKey: AttackPattern, calcListConfigCtrl: CalcListConfigControl) {
    const info = CharacterCalc.getTalentDefaultInfo(patternKey, this.appChar);
    const { resultKey } = info;
    const calcListConfig = calcListConfigCtrl.get(patternKey);
    let reaction = this.elmtModCtrls.reaction;

    const configCalcItem = (item: CalcItem) => {
      let attElmt: AttackElement;

      if (item.attElmt) {
        switch (item.attElmt) {
          case "absorb":
            // this attack can absorb element (anemo abilities) but user may or may not activate absorption
            attElmt = this.elmtModCtrls.absorption || this.appChar.vision;
            break;
          default:
            attElmt = item.attElmt;
        }
      } else if (this.appChar.weaponType === "catalyst" || item.subAttPatt === "FCA" || resultKey !== "NAs") {
        attElmt = this.appChar.vision;
      } else {
        attElmt = "phys";
      }

      if (
        resultKey === "NAs" &&
        attElmt === "phys" &&
        this.infusion.element !== "phys" &&
        this.infusion.range.includes(patternKey as (typeof this.infusion.range)[number])
      ) {
        attElmt = this.infusion.element;

        if (this.infusion.isCustom) {
          reaction = this.elmtModCtrls.infuse_reaction;
        }
      }

      const configMultFactor = (factor: CalcItemMultFactor) => {
        const {
          root,
          scale = info.defaultScale,
          basedOn = info.defaultBasedOn,
        } = typeof factor === "number" ? { root: factor } : factor;

        return {
          root,
          scale,
          basedOn,
        };
      };

      return {
        attElmt: calcListConfig?.attElmt ?? attElmt,
        attPatt: calcListConfig?.attPatt ?? item.attPatt ?? info.defaultAttPatt,
        reaction,
        configMultFactor,
      };
    };

    const configFlatFactor = (factor: CalcItemFlatFactor) => {
      const { root, scale = 3 } = typeof factor === "number" ? { root: factor } : factor;
      return {
        root,
        scale,
      };
    };

    return {
      resultKey,
      defaultFlatFactorScale: info.defaultFlatFactorScale,
      configCalcItem,
      configFlatFactor,
    };
  }
}

export default AttackPatternConfig;
