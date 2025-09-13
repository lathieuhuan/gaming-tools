import type { ArtifactType, AttackReaction } from "@Calculation";
import type {
  ArtifactModCtrl,
  CalcArtifact,
  CustomBuffCtrl,
  CustomBuffCtrlType,
  CustomDebuffCtrl,
  ModifierCtrl,
  Resonance,
  SetupImportInfo,
  Target,
  Teammate,
} from "@/types";

import {
  ATTACK_ELEMENTS,
  ATTACK_PATTERNS,
  ATTRIBUTE_STAT_TYPES,
  BONUS_KEYS,
  ELEMENT_TYPES,
  ElementType,
  LEVELS,
  REACTIONS,
  WEAPON_TYPES,
} from "@Calculation";
import { EXPORTED_SETUP_VERSION } from "@/constants";
import { $AppCharacter } from "@/services";
import Setup_ from "@/utils/setup-utils";
import Array_ from "@/utils/array-utils";
import { CUSTOM_BUFF_CATEGORIES, DIVIDER } from "./setup-porter-config";

export type DecodeError = "OLD_VERSION" | "UNKNOWN";

type DecodeSuccessResult = {
  isOk: true;
  importInfo: SetupImportInfo;
};
type DecodeFailResult = {
  isOk: false;
  error: DecodeError;
};

export const DECODE_ERROR_MSG: Record<DecodeError, string> = {
  UNKNOWN: "An unknown error has occurred. This setup cannot be imported.",
  OLD_VERSION: "This version of Setup is not supported.",
};

const split = (str: string | null, splitLv: number) => (str ? str.split(DIVIDER[splitLv]) : []);

const splitModCtrl = (code: string) => {
  const [activated, index, inputs] = code.split(DIVIDER.MC);

  const result: ModifierCtrl = {
    activated: activated === "1",
    index: +index,
  };
  if (inputs) {
    result.inputs = inputs.split(DIVIDER.MC_INPUTS).map(Number);
  }
  return result;
};

const splitModCtrls = (jointCtrls: string | null, splitLv: number) => {
  return jointCtrls ? split(jointCtrls, splitLv).map(splitModCtrl) : [];
};

const decodeArtifactModCtrls = (code: string | null) => {
  const modCtrls: ArtifactModCtrl[] = [];

  if (code) {
    for (const ctrlStr of split(code, 1)) {
      const firstDividerIndex = (ctrlStr || "").indexOf(DIVIDER[2]);

      modCtrls.push({
        code: +(ctrlStr || "").slice(0, firstDividerIndex),
        ...splitModCtrl(ctrlStr.slice(firstDividerIndex + 1)),
      });
    }
  }
  return modCtrls;
};

export function decodeSetup(code: string): DecodeSuccessResult | DecodeFailResult {
  const characters = $AppCharacter.getAll();
  const [
    version,
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
  ] = code.split(DIVIDER[0]);
  const [, versionNo] = version;

  if (version.at(0) !== "V" || +versionNo !== EXPORTED_SETUP_VERSION) {
    return {
      isOk: false,
      error: "OLD_VERSION",
    };
  }

  try {
    let seedID = Date.now();

    const [charCode, levelIndex, cons, NAs, ES, EB] = split(_charCode, 1);
    const [wpCode, wpTypeIndex, wpLvIndex, wpRefi] = split(_wpCode, 1);
    const { name = "" } = Array_.findByCode(characters, +charCode) || {};

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

    const decodeTeammate = (tmStr: string | null): Teammate | null => {
      if (!tmStr) return null;
      const [tmCode, tmBCs, tmDCs, weapon, artifact] = split(tmStr, 1);
      const { name = "" } = Object.values(characters).find((data) => data.code === +tmCode) || {};
      const [wpCode, wpTypeIndex, wpRefi, wpBuffCtrls] = split(weapon, 2);
      const [artCode, artBCs] = split(artifact, 2);

      return {
        name,
        buffCtrls: splitModCtrls(tmBCs, 2),
        debuffCtrls: splitModCtrls(tmDCs, 2),
        weapon: {
          code: +wpCode,
          type: WEAPON_TYPES[+wpTypeIndex],
          refi: +wpRefi,
          buffCtrls: splitModCtrls(wpBuffCtrls, 3),
        },
        artifact: {
          code: +artCode,
          buffCtrls: splitModCtrls(artBCs, 3),
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
            resonance.inputs = inputs.split(DIVIDER[3]).map(Number);
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
        ...(category === "totalAttr" ? undefined : { subType: BONUS_KEYS[+subTypeIndex] }),
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
      target.inputs = tgInputs.split(DIVIDER[2]).map(Number);
    }
    for (const res of tgResistances.split(DIVIDER[2])) {
      const [keyIndex, value] = res.split(DIVIDER[3]);
      target.resistances[ATTACK_ELEMENTS[+keyIndex]] = +value;
    }

    const importInfo: SetupImportInfo = {
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
        selfBuffCtrls: splitModCtrls(_selfBCsCode, 1),
        selfDebuffCtrls: splitModCtrls(_selfDCsCode, 1),
        weapon: {
          ID: seedID++,
          code: +wpCode,
          level: LEVELS[+wpLvIndex],
          type: WEAPON_TYPES[+wpTypeIndex],
          refi: +wpRefi,
        },
        wpBuffCtrls: splitModCtrls(_wpBCsCode, 1),
        artifacts: [
          decodeArtifact(_flowerCode, "flower"),
          decodeArtifact(_plumeCode, "plume"),
          decodeArtifact(_sandsCode, "sands"),
          decodeArtifact(_gobletCode, "goblet"),
          decodeArtifact(_circletCode, "circlet"),
        ],
        artBuffCtrls: decodeArtifactModCtrls(_artBCsCode),
        artDebuffCtrls: decodeArtifactModCtrls(_artDCsCode),
        party: [decodeTeammate(_tmCode1), decodeTeammate(_tmCode2), decodeTeammate(_tmCode3)],
        elmtModCtrls: {
          resonances,
          superconduct: superconduct === "1",
          reaction: (reaction as AttackReaction) || null,
          infuse_reaction: (infuse_reaction as AttackReaction) || null,
          absorb_reaction: null,
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

    return {
      isOk: true,
      importInfo,
    };
  } catch {
    return {
      isOk: false,
      error: "UNKNOWN",
    };
  }
}
