import type {
  AppArtifact,
  ArtifactBuff,
  ArtifactDebuff,
  ArtifactType,
  AttackReaction,
  CustomBuffCtrl,
  CustomBuffCtrlType,
  CustomDebuffCtrl,
  ElementalEvent,
  ElementType,
  IArtifactBuffCtrl,
  IArtifactDebuffCtrl,
  IArtifactModCtrl,
  IArtifactModCtrlBasic,
  IModifierCtrlBasic,
  ITeamBuffCtrl,
  ITeammateArtifact,
  ResonanceModCtrl,
  SetupImportInfo,
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
import { Artifact, ArtifactGear, CalcCharacter, Target, Team } from "@/models/base";
import { CalcSetup, CalcTeammate } from "@/models/calculator";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@/services";
import Array_ from "@/utils/Array";
import { createArtifact, createTarget, createWeapon } from "../Entity";
import IdStore from "../IdStore";
import { enhanceCtrls } from "../Modifier";
import { CUSTOM_BUFF_CATEGORIES, DIVIDER } from "./setup-porter-config";

export type DecodeError = "OLD_VERSION" | "MAIN_NOT_FOUND" | "UNKNOWN";

type DecodeSuccessResult = {
  isOk: true;
  importInfo: SetupImportInfo;
};
type DecodeFailResult = {
  isOk: false;
  error: DecodeError;
};

export const DECODE_ERROR_MSG: Record<DecodeError, string> = {
  MAIN_NOT_FOUND: "The main character data is not found.",
  UNKNOWN: "An unknown error has occurred. This setup cannot be imported.",
  OLD_VERSION: "This version of Setup is not supported.",
};

export function decodeSetup(code: string): DecodeSuccessResult | DecodeFailResult {
  const characters = $AppCharacter.getAll();
  const [
    version,
    mainStr,
    weaponStr,
    flowerStr,
    plumeStr,
    sandsStr,
    gobletStr,
    circletStr,
    selfBcStrs,
    selfDcStrs,
    wpBcStrs,
    atfBcStrs,
    atfDcStrs,
    teammateStr1,
    teammateStr2,
    teammateStr3,
    elmtMcStr,
    rsnBcStrs,
    rsnDcStrs,
    teamBuffStrs,
    customBcStrs,
    customDcStrs,
    targetStr,
  ] = code.split(DIVIDER[0]);

  if (version.at(0) !== "V" || version.slice(1) !== EXPORTED_SETUP_VERSION) {
    return {
      isOk: false,
      error: "OLD_VERSION",
    };
  }

  const parseNumber = (str: string = "", desc = "") => {
    const num = +str;
    if (!str || isNaN(num)) {
      throw new Error(`Invalid number: [${str}] ${desc}`);
    }
    return num;
  };

  const split = (str: string | undefined, splitLv: number) => {
    return str ? str.split(DIVIDER[splitLv]) : [];
  };

  const splitModCtrl = (str: string | undefined) => {
    if (!str) {
      return null;
    }

    const [id, activated, inputs] = str.split(DIVIDER.MC);

    const result: IModifierCtrlBasic = {
      activated: activated === "1",
      id: parseNumber(id, "Modifier ID"),
    };

    if (inputs) {
      result.inputs = inputs
        .split(DIVIDER.MC_INPUTS)
        .map((input) => parseNumber(input, "Modifier Input"));
    }

    return result;
  };

  const splitModCtrls = (jointCtrls: string | undefined, splitLv: number) => {
    return split(jointCtrls, splitLv)
      .map(splitModCtrl)
      .filter((ctrl) => ctrl !== null);
  };

  try {
    const idStore = new IdStore();

    const [mainCode, levelIndex, cons, NAs, ES, EB] = split(mainStr, 1);
    const [wpCode, wpTypeIndex, wpLvIndex, wpRefi] = split(weaponStr, 1);
    const mainData = Array_.findByCode(characters, +mainCode);

    if (!mainData) {
      return {
        isOk: false,
        error: "MAIN_NOT_FOUND",
      };
    }

    const team = new Team();

    // ===== MAIN =====

    const weapon = createWeapon({
      ID: idStore.gen(),
      code: parseNumber(wpCode, "Main Weapon Code"),
      level: LEVELS[parseNumber(wpLvIndex, "Main Weapon Level")],
      type: WEAPON_TYPES[parseNumber(wpTypeIndex, "Main Weapon Type")],
      refi: parseNumber(wpRefi, "Main Weapon Refi"),
    });

    const decodeArtifact = (str: string | undefined, artType: ArtifactType): Artifact | null => {
      try {
        const [atfCode, rarity, artLevel, mainStatTypeIndex, jointSubStats] = split(str, 1);

        if (!atfCode) {
          return null;
        }

        return createArtifact({
          ID: idStore.gen(),
          code: parseNumber(atfCode, "Main Artifact Code"),
          type: artType,
          rarity: parseNumber(rarity, "Artifact Rarity"),
          level: parseNumber(artLevel, "Artifact Level"),
          mainStatType: ATTRIBUTE_STAT_TYPES[parseNumber(mainStatTypeIndex)],
          subStats: split(jointSubStats, 2).map((str) => {
            const [typeStr, value] = split(str, 3);
            const typeIndex = parseNumber(typeStr, "Artifact Sub Stat Type");
            const type = ATTRIBUTE_STAT_TYPES[typeIndex] || ATTRIBUTE_STAT_TYPES[0];

            return {
              type,
              value: parseNumber(value, "Artifact Sub Stat Value"),
            };
          }),
        });
      } catch (e) {
        console.error(e);
        return null;
      }
    };

    const atfGear = new ArtifactGear(
      Array_.truthify([
        decodeArtifact(flowerStr, "flower"),
        decodeArtifact(plumeStr, "plume"),
        decodeArtifact(sandsStr, "sands"),
        decodeArtifact(gobletStr, "goblet"),
        decodeArtifact(circletStr, "circlet"),
      ])
    );

    const main = new CalcCharacter(
      {
        name: mainData.name,
        enhanced: false,
        level: LEVELS[parseNumber(levelIndex, "Main Level")],
        cons: parseNumber(cons, "Cons"),
        NAs: parseNumber(NAs, "NAs"),
        ES: parseNumber(ES, "ES"),
        EB: parseNumber(EB, "EB"),
        weapon,
        atfGear,
      },
      mainData,
      team
    );

    // ===== ARTIFACT BUFFS =====

    const decodeArtifactBuffCtrl = <T extends ArtifactBuff | ArtifactDebuff>(
      ctrlStrs: string | undefined,
      getMods: (data: AppArtifact | undefined) => T[] | undefined,
      desc: string
    ) => {
      const artBuffCtrls: IArtifactModCtrl<T>[] = [];

      for (const ctrlStr of split(ctrlStrs, 1)) {
        const [codeStr, modStrs] = split(ctrlStr, 2);
        const code = parseNumber(codeStr, desc);
        const setData = $AppArtifact.getSet(code);
        const ctrl = splitModCtrl(modStrs);
        const data = ctrl ? getMods(setData)?.find((buff) => buff.index === ctrl.id) : undefined;

        if (!setData || !data || !ctrl) {
          continue;
        }

        artBuffCtrls.push({
          code,
          ...ctrl,
          data,
          setData,
        });
      }

      return artBuffCtrls;
    };

    const artBuffCtrls = decodeArtifactBuffCtrl(
      atfBcStrs,
      (data) => data?.buffs,
      "Artifact Buff Code"
    );

    const artDebuffCtrls = decodeArtifactBuffCtrl(
      atfDcStrs,
      (data) => data?.debuffs,
      "Artifact Debuff Code"
    );

    // ===== TEAMMATES =====

    const decodeTeammate = (tmStr: string | undefined): CalcTeammate | null => {
      try {
        const [tmCode, tmBcStrs, tmDcStrs, weaponStr, artifactStr] = split(tmStr, 1);
        const tmData = characters.find((data) => data.code === +tmCode);

        if (!tmData) {
          return null;
        }

        const [wpCode, wpTypeIndex, wpRefi, wpBcStrs] = split(weaponStr, 2);
        const wpData = wpCode ? $AppWeapon.get(+wpCode) : undefined;
        const wpType = WEAPON_TYPES[parseNumber(wpTypeIndex, "Teammate Weapon Type")];

        if (!wpData || !wpType) {
          return null;
        }

        const [atfCode, atfBcStrs] = split(artifactStr, 2);
        const atfData = atfCode ? $AppArtifact.getSet(+atfCode) : undefined;
        let artifact: ITeammateArtifact | undefined;

        if (atfData) {
          artifact = {
            code: parseNumber(atfCode, "Artifact Code"),
            buffCtrls: enhanceCtrls(splitModCtrls(atfBcStrs, 3), atfData.buffs),
            data: atfData,
          };
        }

        return new CalcTeammate(
          {
            name: tmData.name,
            buffCtrls: enhanceCtrls(splitModCtrls(tmBcStrs, 2), tmData.buffs),
            debuffCtrls: enhanceCtrls(splitModCtrls(tmDcStrs, 2), tmData.debuffs),
            weapon: {
              code: parseNumber(wpCode, "Teammate Weapon Code"),
              type: wpType,
              refi: parseNumber(wpRefi, "Teammate Weapon Refi"),
              buffCtrls: enhanceCtrls(splitModCtrls(wpBcStrs, 3), wpData.buffs),
              data: wpData,
            },
            artifact,
          },
          tmData,
          team
        );
      } catch (e) {
        console.error(e);
        return null;
      }
    };

    const teammates = Array_.truthify([
      decodeTeammate(teammateStr1),
      decodeTeammate(teammateStr2),
      decodeTeammate(teammateStr3),
    ]);

    team.updateMembers([main, ...teammates]);

    // ===== ELEMENTAL EVENT =====

    const decodeElement = (indexStr = ''): ElementType | undefined => {
      return indexStr ? ELEMENT_TYPES[+indexStr] : undefined;
    };

    const [reaction, infusion, infuseReaction, absorption, absorbReaction, superconduct] = split(
      elmtMcStr,
      1
    );

    const elmtEvent: ElementalEvent = {
      reaction: (reaction || null) as AttackReaction,
      infusion: decodeElement(infusion) || null,
      infuseReaction: (infuseReaction || null) as AttackReaction,
      absorption: decodeElement(absorption) || null,
      absorbReaction: (absorbReaction || null) as AttackReaction,
      superconduct: superconduct === "1",
    };

    // ===== RESONANCES =====

    const decodeResonance = (str: string | undefined) => {
      return split(str, 1)
        .map((rsn) => {
          const [elementType, activated, inputs] = split(rsn, 2);
          const element = decodeElement(elementType);

          if (!element) {
            return null;
          }

          const rsnBuffCtrl: ResonanceModCtrl = {
            element,
            activated: activated === "1",
          };
          if (inputs) {
            rsnBuffCtrl.inputs = inputs.split(DIVIDER.MC_INPUTS).map(Number);
          }
          return rsnBuffCtrl;
        })
        .filter((ctrl) => ctrl !== null);
    };

    // ===== TEAM BUFFS =====

    const teamBuffCtrls: (ITeamBuffCtrl | null)[] = split(teamBuffStrs, 1).map((ctrl) => {
      const [id, activated, inputs] = split(ctrl, 2);
      const data = $AppData.teamBuffs.find((buff) => buff.index === +id);

      if (!data) {
        return null;
      }

      return {
        id: +id,
        activated: activated === "1",
        inputs: inputs ? inputs.split(DIVIDER.MC_INPUTS).map(Number) : [],
        data,
      };
    });

    // ===== CUSTOM MODIFIERS =====

    const customBuffCtrls: CustomBuffCtrl[] = split(customBcStrs, 1).map((codes) => {
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

    const customDebuffCtrls: CustomDebuffCtrl[] = split(customDcStrs, 1).map((codes) => {
      const [typeIndex, value] = split(codes, 2);
      return {
        type: ["def"].concat(ATTACK_ELEMENTS)[+typeIndex] as CustomDebuffCtrl["type"],
        value: +value,
      };
    });

    // ===== TARGET =====

    const [tgCode, tgLevel, tgVariant, tgInputs, tgResistances] = split(targetStr, 1);
    const targetData = $AppData.getMonster({ code: +tgCode });

    let target: Target | undefined;

    if (targetData) {
      target = new Target(
        {
          code: parseNumber(tgCode, "Target Code"),
          level: parseNumber(tgLevel, "Target Level"),
          resistances: {
            anemo: 10,
            dendro: 10,
            cryo: 10,
            geo: 10,
            electro: 10,
            hydro: 10,
            pyro: 10,
            phys: 10,
          },
        },
        targetData
      );

      if (tgVariant) {
        target.variantType = tgVariant as ElementType;
      }
      if (tgInputs) {
        target.inputs = tgInputs.split(DIVIDER[2]).map(Number);
      }

      for (const res of tgResistances.split(DIVIDER[2])) {
        const [keyIndex, value] = res.split(DIVIDER[3]);
        const key = ATTACK_ELEMENTS[+keyIndex];

        if (key) {
          target.resistances[key] = parseNumber(value, "Resistance Value");
        }
      }
    } else {
      target = createTarget({ code: 0 });
    }

    const importInfo: SetupImportInfo = {
      ID: idStore.gen(),
      name: "Imported setup",
      params: new CalcSetup({
        main,
        selfBuffCtrls: enhanceCtrls(splitModCtrls(selfBcStrs, 1), mainData.buffs),
        selfDebuffCtrls: enhanceCtrls(splitModCtrls(selfDcStrs, 1), mainData.debuffs),
        wpBuffCtrls: enhanceCtrls(splitModCtrls(wpBcStrs, 1), weapon.data.buffs),
        artBuffCtrls,
        artDebuffCtrls,
        teammates,
        team,
        rsnBuffCtrls: decodeResonance(rsnBcStrs),
        rsnDebuffCtrls: decodeResonance(rsnDcStrs),
        teamBuffCtrls: Array_.truthify(teamBuffCtrls),
        elmtEvent,
        customBuffCtrls,
        customDebuffCtrls,
      }),
    };

    return {
      isOk: true,
      importInfo,
    };
  } catch (e) {
    console.error(e);

    return {
      isOk: false,
      error: "UNKNOWN",
    };
  }
}
