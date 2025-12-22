import type { CalcSetup } from "@/models/calculator";
import type {
  AttackElement,
  AttributeStat,
  ElementType,
  IModifierCtrlBasic,
  ReactionType,
} from "@/types";

import { EXPORTED_SETUP_VERSION } from "@/constants/config";
import {
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  BONUS_KEYS,
  ELEMENT_TYPES,
  LEVELS,
  REACTIONS,
  WEAPON_TYPES,
} from "@/constants/global";
import { CUSTOM_BUFF_CATEGORIES, DIVIDER } from "./setup-porter-config";

export function encodeSetup(calcSetup: CalcSetup) {
  const {
    main,
    selfBuffCtrls,
    selfDebuffCtrls,
    wpBuffCtrls,
    artBuffCtrls,
    artDebuffCtrls,
    teammates,
    elmtEvent,
    customBuffCtrls,
    customDebuffCtrls,
    teamBuffCtrls,
    rsnBuffCtrls,
    rsnDebuffCtrls,
    target,
  } = calcSetup;

  const encodeModCtrl = (mod: IModifierCtrlBasic) => {
    return [
      mod.id,
      +mod.activated,
      mod.inputs?.length ? mod.inputs.join(DIVIDER.MC_INPUTS) : "",
    ].join(DIVIDER.MC);
  };

  const encodeModCtrls = (mods: IModifierCtrlBasic[], divideLv: number) => {
    return mods.map(encodeModCtrl).join(DIVIDER[divideLv]);
  };

  const encodeElement = (elmt?: ElementType | null) => {
    return elmt ? ELEMENT_TYPES.indexOf(elmt) : "";
  };

  try {
    const { cons, NAs, ES, EB, enhanced, weapon, atfGear } = main;
    const levelCode = LEVELS.indexOf(main.level);
    const enhancedCode = enhanced ? "1" : "0";

    const mainStr = [main.data.code, levelCode, cons, enhancedCode, NAs, ES, EB].join(DIVIDER[1]);

    const weaponStr = [
      weapon.code,
      WEAPON_TYPES.indexOf(weapon.type),
      LEVELS.indexOf(weapon.level),
      weapon.refi,
    ].join(DIVIDER[1]);

    const artifactStrs = atfGear.slots.map((slot) => {
      if (!slot.isFilled) {
        return "";
      }

      const { piece } = slot;

      return [
        piece.code,
        // artifact.type,
        piece.rarity,
        piece.level,
        ATTRIBUTE_STAT_TYPES.indexOf(piece.mainStatType),
        piece.subStats
          .map((subStat) =>
            [ATTRIBUTE_STAT_TYPES.indexOf(subStat.type), subStat.value].join(DIVIDER[3])
          )
          .join(DIVIDER[2]),
      ].join(DIVIDER[1]);
    });

    const atfBcStrs = artBuffCtrls
      .map((ctrl) => `${ctrl.code}${DIVIDER[2]}${encodeModCtrl(ctrl)}`)
      .join(DIVIDER[1]);
    const atfDcStrs = artDebuffCtrls
      .map((ctrl) => `${ctrl.code}${DIVIDER[2]}${encodeModCtrl(ctrl)}`)
      .join(DIVIDER[1]);

    const teammateStrs = [0, 1, 2].map((i) => {
      const tm = teammates[i];

      if (!tm) {
        return "";
      }

      const { enhanced, weapon, artifact } = tm;
      const artifactCode = artifact
        ? [artifact.code, encodeModCtrls(artifact.buffCtrls, 3)].join(DIVIDER[2])
        : "";

      return [
        tm.data.code,
        enhanced ? "1" : "0",
        encodeModCtrls(tm.buffCtrls, 2),
        encodeModCtrls(tm.debuffCtrls, 2),
        [
          weapon.code,
          WEAPON_TYPES.indexOf(weapon.type),
          weapon.refi,
          encodeModCtrls(weapon.buffCtrls, 3),
        ].join(DIVIDER[2]),
        artifactCode,
      ].join(DIVIDER[1]);
    });

    const elmtMcStr = [
      elmtEvent.reaction,
      encodeElement(elmtEvent.infusion),
      elmtEvent.infuseReaction,
      encodeElement(elmtEvent.absorption),
      elmtEvent.absorbReaction,
      +elmtEvent.superconduct,
    ].join(DIVIDER[1]);

    const teamBuffStr = teamBuffCtrls.map((ctrl) => {
      return [
        ctrl.id,
        +ctrl.activated,
        ctrl.inputs?.length ? ctrl.inputs.join(DIVIDER.MC_INPUTS) : "",
      ].join(DIVIDER[2]);
    });

    const rsnBcStr = rsnBuffCtrls.map((ctrl) => {
      return [
        encodeElement(ctrl.element),
        +ctrl.activated,
        ctrl.inputs?.length ? ctrl.inputs.join(DIVIDER.MC_INPUTS) : "",
      ].join(DIVIDER[2]);
    });

    const rsnDcStr = rsnDebuffCtrls.map((ctrl) => {
      return [
        encodeElement(ctrl.element),
        +ctrl.activated,
        ctrl.inputs?.length ? ctrl.inputs.join(DIVIDER.MC_INPUTS) : "",
      ].join(DIVIDER[2]);
    });

    const customBcStr = customBuffCtrls.map((ctrl) => {
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

    const customDcStr = customDebuffCtrls.map((ctrl) => {
      const typeCode = ["def"].concat(ATTACK_ELEMENTS).indexOf(ctrl.type);
      return [typeCode, ctrl.value].join(DIVIDER[2]);
    });

    const targetStr = [
      target.code,
      target.level,
      target.variantType || "",
      target.inputs?.length ? target.inputs.join(DIVIDER[2]) : "",
      Object.entries(target.resistances)
        .map(([key, value]) =>
          [ATTACK_ELEMENTS.indexOf(key as AttackElement), value].join(DIVIDER[3])
        )
        .join(DIVIDER[2]),
    ].join(DIVIDER[1]);

    return [
      `V${EXPORTED_SETUP_VERSION}`,
      mainStr,
      weaponStr,
      ...artifactStrs,
      encodeModCtrls(selfBuffCtrls, 1),
      encodeModCtrls(selfDebuffCtrls, 1),
      encodeModCtrls(wpBuffCtrls, 1),
      atfBcStrs,
      atfDcStrs,
      ...teammateStrs,
      elmtMcStr,
      rsnBcStr.join(DIVIDER[1]),
      rsnDcStr.join(DIVIDER[1]),
      teamBuffStr.join(DIVIDER[1]),
      customBcStr.join(DIVIDER[1]),
      customDcStr.join(DIVIDER[1]),
      targetStr,
    ].join(DIVIDER[0]);
    //
  } catch (e) {
    console.error(e);
    return "";
  }
}
