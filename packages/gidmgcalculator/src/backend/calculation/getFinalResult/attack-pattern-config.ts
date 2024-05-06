import { ElementModCtrl } from "@Src/types";
import type {
  AttackPattern,
  LevelableTalentType,
  WeaponType,
  ElementType,
  AppCharacter,
  AttackElement,
  ActualAttackPattern,
  TalentAttributeType,
  CalcItem,
} from "../../types";
import { CalcUltilInfo } from "../calculation.types";
import { CharacterCalc } from "../utils";

class CalcItemConfig {}

type GenPatternHanlderReturn = {
  resultKey: "ES" | "EB" | "NAs";
};

class AttackPatternConfig {
  private char: CalcUltilInfo["char"];
  private appChar: CalcUltilInfo["appChar"];
  private partyData: CalcUltilInfo["partyData"];
  private elmtModCtrls: ElementModCtrl;

  constructor(info: CalcUltilInfo, elmtModCtrls: ElementModCtrl) {
    this.char = info.char;
    this.appChar = info.appChar;
    this.partyData = info.partyData;
    this.elmtModCtrls = elmtModCtrls;
  }

  static getTalentDefaultInfo(
    key: LevelableTalentType,
    weaponType: WeaponType,
    elementType: ElementType,
    expectedAttPatt: AttackPattern,
    config: AppCharacter["calcListConfig"]
  ): {
    attElmt: AttackElement;
    attPatt: ActualAttackPattern;
    scale: number;
    basedOn: TalentAttributeType;
    flatFactorScale: number;
  } {
    const attElmt = key === "NAs" && weaponType !== "catalyst" ? "phys" : elementType;
    const defaultScale = attElmt === "phys" ? 7 : 2;
    const { scale = defaultScale, basedOn = "atk", attPatt = expectedAttPatt } = config?.[expectedAttPatt] || {};

    return {
      attElmt,
      attPatt,
      scale,
      basedOn,
      flatFactorScale: 3,
    };
  }

  genPatternHanlder(patternKey: AttackPattern): GenPatternHanlderReturn {
    const resultKey = patternKey === "ES" || patternKey === "EB" ? patternKey : "NAs";
    const defaultInfo = AttackPatternConfig.getTalentDefaultInfo(
      resultKey,
      this.appChar.weaponType,
      this.appChar.vision,
      patternKey,
      this.appChar.calcListConfig
    );

    const configCalcItem = (item: CalcItem) => {
      let attElmt: AttackElement;

      if (item.attElmt) {
        switch (item.attElmt) {
          case "absorb":
            // this attack can absorb element (anemo abilities) but user may not activate absorption
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

      return attElmt;
    };

    return {
      resultKey,
      //   ...defaultInfo,
    };
  }
}

export default AttackPatternConfig;
