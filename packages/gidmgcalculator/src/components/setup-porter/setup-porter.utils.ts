import {
  ATTACK_ELEMENTS,
  LEVELS,
  WEAPON_TYPES,
  ATTRIBUTE_STAT_TYPES,
  ATTACK_PATTERN_INFO_KEYS,
  ATTACK_PATTERNS,
  REACTIONS,
  ELEMENT_TYPES,
  AttributeStat,
  ArtifactType,
  ElementType,
  AttackElement,
  AttackPatternBonusKey,
  ReactionType,
} from "@Backend";

import type {
  ArtifactDebuffCtrl,
  AttackReaction,
  CalcArtifact,
  CalcSetup,
  ModifierCtrl,
  Resonance,
  SetupImportInfo,
  Target,
  Teammate,
  CustomBuffCtrlCategory,
  CustomBuffCtrl,
  CustomDebuffCtrl,
  CustomBuffCtrlType,
} from "@Src/types";
import { $AppCharacter } from "@Src/services";
import { findByCode, Setup_ } from "@Src/utils";

const DIVIDERS = ["*", "D1", "D2", "D3", "D4"];
const DIVIDER_MC = "D8";
const DIVIDER_MC_INPUTS = "D9";
const CUSTOM_BUFF_CATEGORIES: CustomBuffCtrlCategory[] = ["totalAttr", "attElmtBonus", "attPattBonus", "rxnBonus"];

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

    const _charCode = [charCode, LEVELS.indexOf(char.level), cons, NAs, ES, EB].join(DIVIDERS[1]);

    const encodeMC = (mod: ModifierCtrl) => {
      return [+mod.activated, mod.index, mod.inputs?.length ? mod.inputs.join(DIVIDER_MC_INPUTS) : ""].join(DIVIDER_MC);
    };

    const encodeMCs = (mods: ModifierCtrl[], divideLv: number) => {
      return mods.map(encodeMC).join(DIVIDERS[divideLv]);
    };

    const _wpCode = [weapon.code, WEAPON_TYPES.indexOf(weapon.type), LEVELS.indexOf(weapon.level), weapon.refi].join(
      DIVIDERS[1]
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
              .map((subStat) => [ATTRIBUTE_STAT_TYPES.indexOf(subStat.type), subStat.value].join(DIVIDERS[3]))
              .join(DIVIDERS[2]),
          ].join(DIVIDERS[1])
        : "";
    });
    const _artDCsCode = artDebuffCtrls.map((ctrl) => `${ctrl.code + DIVIDERS[2] + encodeMC(ctrl)}`).join(DIVIDERS[1]);

    const _teammateCodes = party.map((tm, i) => {
      if (tm) {
        const { code: tmCode } = $AppCharacter.get(tm.name) || {};
        const { weapon, artifact } = tm;

        return [
          tmCode,
          encodeMCs(tm.buffCtrls, 2),
          encodeMCs(tm.debuffCtrls, 2),
          [weapon.code, WEAPON_TYPES.indexOf(weapon.type), weapon.refi, encodeMCs(weapon.buffCtrls, 3)].join(
            DIVIDERS[2]
          ),
          [artifact.code, encodeMCs(artifact.buffCtrls, 3)].join(DIVIDERS[2]),
        ].join(DIVIDERS[1]);
      }
      return "";
    });

    const _elmtMCsCode = [
      elmtModCtrls.reaction,
      elmtModCtrls.infuse_reaction,
      +elmtModCtrls.superconduct,
      elmtModCtrls.absorption ? ELEMENT_TYPES.indexOf(elmtModCtrls.absorption) : "",
    ].join(DIVIDERS[1]);

    const _resonancesCode = elmtModCtrls.resonances
      .map((rsn) => [rsn.vision, +rsn.activated, rsn.inputs ? rsn.inputs.join(DIVIDERS[3]) : ""].join(DIVIDERS[2]))
      .join(DIVIDERS[1]);

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
          typeCode = ["all"].concat(ATTACK_PATTERNS).indexOf(ctrl.type as AttackPatternBonusKey);
          break;
        case "rxnBonus":
          typeCode = REACTIONS.indexOf(ctrl.type as ReactionType);
          break;
      }
      return [
        CUSTOM_BUFF_CATEGORIES.indexOf(ctrl.category),
        typeCode,
        ctrl.subType ? ATTACK_PATTERN_INFO_KEYS.indexOf(ctrl.subType) : 0,
        ctrl.value,
      ].join(DIVIDERS[2]);
    });

    const _customDebuffCodes = customDebuffCtrls.map((ctrl) => {
      const typeCode = ["def"].concat(ATTACK_ELEMENTS).indexOf(ctrl.type);
      return [typeCode, ctrl.value].join(DIVIDERS[2]);
    });

    const _targetCode = [
      target.code,
      target.level,
      target.variantType || "",
      target.inputs?.length ? target.inputs.join(DIVIDERS[2]) : "",
      Object.entries(target.resistances)
        .map(([key, value]) => [ATTACK_ELEMENTS.indexOf(key as AttackElement), value].join(DIVIDERS[3]))
        .join(DIVIDERS[2]),
    ].join(DIVIDERS[1]);

    return [
      _charCode,
      encodeMCs(selfBuffCtrls, 1),
      encodeMCs(selfDebuffCtrls, 1),
      _wpCode,
      encodeMCs(wpBuffCtrls, 1),
      ..._artifactCodes,
      encodeMCs(artBuffCtrls, 1),
      _artDCsCode,
      ..._teammateCodes,
      _elmtMCsCode,
      _resonancesCode,
      ATTACK_ELEMENTS.indexOf(customInfusion.element),
      _customBuffCodes.join(DIVIDERS[1]),
      _customDebuffCodes.join(DIVIDERS[1]),
      _targetCode,
    ].join(DIVIDERS[0]);
    //
  } catch (e) {
    console.log(e);
    return "";
  }
}

export function decodeSetup(code: string): SetupImportInfo {
  const characters = $AppCharacter.getAll();
  const [
    _charCode,
    _selfBCsCode,
    _selfDCsCode,
    _wpCode,
    _wpBCsCode,
    _flowerCode,
    _plumeCode,
    _sandsCode,
    _gobletCode,
    _circletCode,
    _artBCsCode,
    _artDCsCode,
    _tmCode1,
    _tmCode2,
    _tmCode3,
    _elmtMCsCode,
    _resonancesCode,
    _infuseElmtIndex,
    _customBuffsCode,
    _customDebuffCodes,
    _targetCode,
  ] = code.split(DIVIDERS[0]);
  let seedID = Date.now();

  const split = (str: string | null, splitLv: number) => (str ? str.split(DIVIDERS[splitLv]) : []);

  const splitMC = (code: string) => {
    const [activated, index, inputs] = code.split(DIVIDER_MC);

    const result: ModifierCtrl = {
      activated: activated === "1",
      index: +index,
    };
    if (inputs) {
      result.inputs = inputs.split(DIVIDER_MC_INPUTS).map(Number);
    }
    return result;
  };

  const splitMCs = (jointCtrls: string | null, splitLv: number) => {
    return jointCtrls ? split(jointCtrls, splitLv).map(splitMC) : [];
  };

  const [charCode, levelIndex, cons, NAs, ES, EB] = split(_charCode, 1);
  const [wpCode, wpTypeIndex, wpLvIndex, wpRefi] = split(_wpCode, 1);
  const { name = "" } = findByCode(characters, +charCode) || {};

  const decodeArtifact = (str: string | null, artType: ArtifactType): CalcArtifact | null => {
    if (!str) return null;
    const [artCode, rarity, artLevel, mainStatTypeIndex, jointSubStats] = split(str, 1);
    const subStats = split(jointSubStats, 2);

    return {
      ID: seedID++,
      code: +artCode,
      type: artType,
      rarity: +rarity,
      level: +artLevel,
      mainStatType: ATTRIBUTE_STAT_TYPES[+mainStatTypeIndex],
      subStats: subStats.map((str) => {
        const [typeIndex, value] = split(str, 3);
        return {
          type: ATTRIBUTE_STAT_TYPES[+typeIndex],
          value: +value,
        };
      }),
    };
  };

  const artDebuffCtrls: ArtifactDebuffCtrl[] = [];

  if (_artDCsCode) {
    for (const ctrlStr of split(_artDCsCode, 1)) {
      const firstDividerIndex = (ctrlStr || "").indexOf(DIVIDERS[2]);

      artDebuffCtrls.push({
        code: +(ctrlStr || "").slice(0, firstDividerIndex),
        ...splitMC(ctrlStr.slice(firstDividerIndex + 1)),
      });
    }
  }

  const decodeTeammate = (tmStr: string | null): Teammate | null => {
    if (!tmStr) return null;
    const [tmCode, tmBCs, tmDCs, weapon, artifact] = split(tmStr, 1);
    const { name = "" } = Object.values(characters).find((data) => data.code === +tmCode) || {};
    const [wpCode, wpTypeIndex, wpRefi, wpBuffCtrls] = split(weapon, 2);
    const [artCode, artBCs] = split(artifact, 2);

    return {
      name,
      buffCtrls: splitMCs(tmBCs, 2),
      debuffCtrls: splitMCs(tmDCs, 2),
      weapon: {
        code: +wpCode,
        type: WEAPON_TYPES[+wpTypeIndex],
        refi: +wpRefi,
        buffCtrls: splitMCs(wpBuffCtrls, 3),
      },
      artifact: {
        code: +artCode,
        buffCtrls: splitMCs(artBCs, 3),
      },
    };
  };

  const [reaction, infuse_reaction, superconduct, absorption] = split(_elmtMCsCode, 1);

  const resonances = _resonancesCode
    ? split(_resonancesCode, 1).map((rsn) => {
        const [elementType, activated, inputs] = split(rsn, 2);
        const resonance: Resonance = {
          vision: elementType as ElementType,
          activated: activated === "1",
        };
        if (inputs) {
          resonance.inputs = inputs.split(DIVIDERS[3]).map(Number);
        }
        return resonance;
      })
    : [];
  const [tgCode, tgLevel, tgVariant, tgInputs, tgResistances] = split(_targetCode, 1);

  const customBuffCtrls: CustomBuffCtrl[] = split(_customBuffsCode, 1).map((codes) => {
    const [categoryIndex, typeIndex, subTypeIndex, value] = split(codes, 2);
    const category = CUSTOM_BUFF_CATEGORIES[+categoryIndex];
    let type = "";

    switch (category) {
      case "totalAttr":
        type = ATTRIBUTE_STAT_TYPES[+typeIndex];
        break;
      case "attElmtBonus":
        type = ATTACK_ELEMENTS[+typeIndex];
        break;
      case "attPattBonus":
        type = ["all"].concat(ATTACK_PATTERNS)[+typeIndex];
        break;
      case "rxnBonus":
        type = REACTIONS[+typeIndex];
        break;
    }

    return {
      category,
      type: type as CustomBuffCtrlType,
      ...(category === "totalAttr" ? undefined : { subType: ATTACK_PATTERN_INFO_KEYS[+subTypeIndex] }),
      value: +value,
    };
  });

  const customDebuffCtrls: CustomDebuffCtrl[] = split(_customDebuffCodes, 1).map((codes) => {
    const [typeIndex, value] = split(codes, 2);
    return {
      type: ["def"].concat(ATTACK_ELEMENTS)[+typeIndex] as CustomDebuffCtrl["type"],
      value: +value,
    };
  });

  const target = {
    code: +tgCode,
    level: +tgLevel,
    resistances: {},
  } as Target;

  if (tgVariant) {
    target.variantType = tgVariant as ElementType;
  }
  if (tgInputs) {
    target.inputs = tgInputs.split(DIVIDERS[2]).map(Number);
  }
  for (const res of tgResistances.split(DIVIDERS[2])) {
    const [keyIndex, value] = res.split(DIVIDERS[3]);
    target.resistances[ATTACK_ELEMENTS[+keyIndex]] = +value;
  }

  return {
    ID: seedID,
    name: "Imported setup",
    calcSetup: Setup_.restoreCalcSetup({
      char: {
        name,
        level: LEVELS[+levelIndex],
        cons: +cons,
        NAs: +NAs,
        ES: +ES,
        EB: +EB,
      },
      selfBuffCtrls: splitMCs(_selfBCsCode, 1),
      selfDebuffCtrls: splitMCs(_selfDCsCode, 1),
      weapon: {
        ID: seedID++,
        code: +wpCode,
        level: LEVELS[+wpLvIndex],
        type: WEAPON_TYPES[+wpTypeIndex],
        refi: +wpRefi,
      },
      wpBuffCtrls: splitMCs(_wpBCsCode, 1),
      artifacts: [
        decodeArtifact(_flowerCode, "flower"),
        decodeArtifact(_plumeCode, "plume"),
        decodeArtifact(_sandsCode, "sands"),
        decodeArtifact(_gobletCode, "goblet"),
        decodeArtifact(_circletCode, "circlet"),
      ],
      artBuffCtrls: splitMCs(_artBCsCode, 1),
      artDebuffCtrls,
      party: [decodeTeammate(_tmCode1), decodeTeammate(_tmCode2), decodeTeammate(_tmCode3)],
      elmtModCtrls: {
        reaction: (reaction as AttackReaction) || null,
        infuse_reaction: (infuse_reaction as AttackReaction) || null,
        resonances,
        superconduct: superconduct === "1",
        absorption: absorption ? ELEMENT_TYPES[+absorption] : null,
      },
      customInfusion: {
        element: _infuseElmtIndex ? ATTACK_ELEMENTS[+_infuseElmtIndex] : "phys",
      },
      customBuffCtrls,
      customDebuffCtrls,
    }),
    target,
  };
}
