import type { CalcSetup } from "@/models/calculator";
import type {
  AttackElement,
  AttributeStat,
  ElementType,
  IModifierCtrlBasic,
  ReactionType,
} from "@/types";

import {
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  BONUS_KEYS,
  ELEMENT_TYPES,
  EXPORTED_SETUP_VERSION,
  LEVELS,
  REACTIONS,
  WEAPON_TYPES,
} from "@/constants";
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
    const { cons, NAs, ES, EB, weapon, atfGear } = main;

    const mainCode = [main.data.code, LEVELS.indexOf(main.level), cons, NAs, ES, EB].join(
      DIVIDER[1]
    );

    const weaponCode = [
      weapon.code,
      WEAPON_TYPES.indexOf(weapon.type),
      LEVELS.indexOf(weapon.level),
      weapon.refi,
    ].join(DIVIDER[1]);

    const artifactCodes = atfGear.slots.map((slot) => {
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

    const atfBCsCode = artBuffCtrls
      .map((ctrl) => `${ctrl.code}${DIVIDER[2]}${encodeModCtrl(ctrl)}`)
      .join(DIVIDER[1]);
    const atfDCsCode = artDebuffCtrls
      .map((ctrl) => `${ctrl.code}${DIVIDER[2]}${encodeModCtrl(ctrl)}`)
      .join(DIVIDER[1]);

    const teammateCodes = [0, 1, 2].map((i) => {
      const tm = teammates[i];

      if (!tm) {
        return "";
      }

      const { weapon, artifact } = tm;
      const artifactCode = artifact
        ? [artifact.code, encodeModCtrls(artifact.buffCtrls, 3)].join(DIVIDER[2])
        : "";

      return [
        tm.data.code,
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

    const elmtMCsCode = [
      elmtEvent.reaction,
      encodeElement(elmtEvent.infusion),
      elmtEvent.infuseReaction,
      encodeElement(elmtEvent.absorption),
      elmtEvent.absorbReaction,
      +elmtEvent.superconduct,
    ].join(DIVIDER[1]);

    const teamBuffCodes = teamBuffCtrls.map((ctrl) => {
      return [
        ctrl.id,
        +ctrl.activated,
        ctrl.inputs?.length ? ctrl.inputs.join(DIVIDER.MC_INPUTS) : "",
      ].join(DIVIDER[2]);
    });

    const rsnBCsCode = rsnBuffCtrls.map((ctrl) => {
      return [
        encodeElement(ctrl.element),
        +ctrl.activated,
        ctrl.inputs?.length ? ctrl.inputs.join(DIVIDER.MC_INPUTS) : "",
      ].join(DIVIDER[2]);
    });

    const rsnDCsCode = rsnDebuffCtrls.map((ctrl) => {
      return [
        encodeElement(ctrl.element),
        +ctrl.activated,
        ctrl.inputs?.length ? ctrl.inputs.join(DIVIDER.MC_INPUTS) : "",
      ].join(DIVIDER[2]);
    });

    const customBCsCodes = customBuffCtrls.map((ctrl) => {
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

    const customDCsCodes = customDebuffCtrls.map((ctrl) => {
      const typeCode = ["def"].concat(ATTACK_ELEMENTS).indexOf(ctrl.type);
      return [typeCode, ctrl.value].join(DIVIDER[2]);
    });

    const targetCode = [
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
      mainCode,
      weaponCode,
      ...artifactCodes,
      encodeModCtrls(selfBuffCtrls, 1),
      encodeModCtrls(selfDebuffCtrls, 1),
      encodeModCtrls(wpBuffCtrls, 1),
      atfBCsCode,
      atfDCsCode,
      ...teammateCodes,
      elmtMCsCode,
      rsnBCsCode.join(DIVIDER[1]),
      rsnDCsCode.join(DIVIDER[1]),
      teamBuffCodes.join(DIVIDER[1]),
      customBCsCodes.join(DIVIDER[1]),
      customDCsCodes.join(DIVIDER[1]),
      targetCode,
    ].join(DIVIDER[0]);
    //
  } catch (e) {
    console.log(e);
    return "";
  }
}
