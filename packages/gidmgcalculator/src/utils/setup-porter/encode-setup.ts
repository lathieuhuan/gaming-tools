import {
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  AttackElement,
  AttributeStat,
  BONUS_KEYS,
  ELEMENT_TYPES,
  LEVELS,
  REACTIONS,
  ReactionType,
  WEAPON_TYPES,
} from "@Backend";

import type { CalcSetup, ModifierCtrl, Target } from "@Src/types";
import { EXPORTED_SETUP_VERSION } from "@Src/constants";
import { $AppCharacter } from "@Src/services";
import { CUSTOM_BUFF_CATEGORIES, DIVIDER } from "./setup-porter-config";

const encodeModCtrl = (mod: ModifierCtrl) => {
  return [+mod.activated, mod.index, mod.inputs?.length ? mod.inputs.join(DIVIDER.MC_INPUTS) : ""].join(DIVIDER.MC);
};

const encodeModCtrls = (mods: ModifierCtrl[], divideLv: number) => {
  return mods.map(encodeModCtrl).join(DIVIDER[divideLv]);
};

export function encodeSetup(calcSetup: CalcSetup, target: Target) {
  const {
    char,
    selfBuffCtrls,
    selfDebuffCtrls,
    weapon,
    wpBuffCtrls,
    artifacts,
    artBuffCtrls,
    artDebuffCtrls,
    party,
    elmtModCtrls,
    customInfusion,
    customBuffCtrls,
    customDebuffCtrls,
  } = calcSetup;

  try {
    const appChar = $AppCharacter.get(char.name);
    if (!appChar) {
      throw new Error("Character not found");
    }

    const { code: charCode = 0 } = appChar;
    const { cons, NAs, ES, EB } = char;

    const _charCode = [charCode, LEVELS.indexOf(char.level), cons, NAs, ES, EB].join(DIVIDER[1]);

    const _wpCode = [weapon.code, WEAPON_TYPES.indexOf(weapon.type), LEVELS.indexOf(weapon.level), weapon.refi].join(
      DIVIDER[1]
    );

    const _artifactCodes = artifacts.map((artifact, i) => {
      return artifact
        ? [
            artifact.code,
            // artifact.type,
            artifact.rarity,
            artifact.level,
            ATTRIBUTE_STAT_TYPES.indexOf(artifact.mainStatType),
            artifact.subStats
              .map((subStat) => [ATTRIBUTE_STAT_TYPES.indexOf(subStat.type), subStat.value].join(DIVIDER[3]))
              .join(DIVIDER[2]),
          ].join(DIVIDER[1])
        : "";
    });
    const _artBCsCode = artBuffCtrls.map((ctrl) => `${ctrl.code}${DIVIDER[2]}${encodeModCtrl(ctrl)}}`).join(DIVIDER[1]);
    const _artDCsCode = artDebuffCtrls
      .map((ctrl) => `${ctrl.code}${DIVIDER[2]}${encodeModCtrl(ctrl)}}`)
      .join(DIVIDER[1]);

    const _teammateCodes = party.map((tm, i) => {
      if (tm) {
        const { code: tmCode } = $AppCharacter.get(tm.name) || {};
        const { weapon, artifact } = tm;

        return [
          tmCode,
          encodeModCtrls(tm.buffCtrls, 2),
          encodeModCtrls(tm.debuffCtrls, 2),
          [weapon.code, WEAPON_TYPES.indexOf(weapon.type), weapon.refi, encodeModCtrls(weapon.buffCtrls, 3)].join(
            DIVIDER[2]
          ),
          [artifact.code, encodeModCtrls(artifact.buffCtrls, 3)].join(DIVIDER[2]),
        ].join(DIVIDER[1]);
      }
      return "";
    });

    const _elmtMCsCode = [
      elmtModCtrls.reaction,
      elmtModCtrls.infuse_reaction,
      +elmtModCtrls.superconduct,
      elmtModCtrls.absorption ? ELEMENT_TYPES.indexOf(elmtModCtrls.absorption) : "",
    ].join(DIVIDER[1]);

    const _resonancesCode = elmtModCtrls.resonances
      .map((rsn) => [rsn.vision, +rsn.activated, rsn.inputs ? rsn.inputs.join(DIVIDER[3]) : ""].join(DIVIDER[2]))
      .join(DIVIDER[1]);

    const _customBuffCodes = customBuffCtrls.map((ctrl) => {
      let typeCode = 0;

      switch (ctrl.category) {
        case "totalAttr":
          typeCode = ATTRIBUTE_STAT_TYPES.indexOf(ctrl.type as AttributeStat);
          break;
        case "attElmtBonus":
          typeCode = ATTACK_ELEMENTS.indexOf(ctrl.type as AttackElement);
          break;
        case "attPattBonus":
          typeCode = ["all"].concat(ATTACK_PATTERNS).indexOf(ctrl.type);
          break;
        case "rxnBonus":
          typeCode = REACTIONS.indexOf(ctrl.type as ReactionType);
          break;
      }
      return [
        CUSTOM_BUFF_CATEGORIES.indexOf(ctrl.category),
        typeCode,
        ctrl.subType ? BONUS_KEYS.indexOf(ctrl.subType) : 0,
        ctrl.value,
      ].join(DIVIDER[2]);
    });

    const _customDebuffCodes = customDebuffCtrls.map((ctrl) => {
      const typeCode = ["def"].concat(ATTACK_ELEMENTS).indexOf(ctrl.type);
      return [typeCode, ctrl.value].join(DIVIDER[2]);
    });

    const _targetCode = [
      target.code,
      target.level,
      target.variantType || "",
      target.inputs?.length ? target.inputs.join(DIVIDER[2]) : "",
      Object.entries(target.resistances)
        .map(([key, value]) => [ATTACK_ELEMENTS.indexOf(key as AttackElement), value].join(DIVIDER[3]))
        .join(DIVIDER[2]),
    ].join(DIVIDER[1]);

    return [
      `V${EXPORTED_SETUP_VERSION}`,
      _charCode,
      encodeModCtrls(selfBuffCtrls, 1),
      encodeModCtrls(selfDebuffCtrls, 1),
      _wpCode,
      encodeModCtrls(wpBuffCtrls, 1),
      ..._artifactCodes,
      _artBCsCode,
      _artDCsCode,
      ..._teammateCodes,
      _elmtMCsCode,
      _resonancesCode,
      ATTACK_ELEMENTS.indexOf(customInfusion.element),
      _customBuffCodes.join(DIVIDER[1]),
      _customDebuffCodes.join(DIVIDER[1]),
      _targetCode,
    ].join(DIVIDER[0]);
    //
  } catch (e) {
    console.log(e);
    return "";
  }
}
