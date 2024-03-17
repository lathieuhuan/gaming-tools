import type {
  AttributeStat,
  Character,
  AppWeapon,
  ModifierCtrl,
  ModInputConfig,
  Party,
  Resonance,
  UserArtifact,
  UserCharacter,
  UserSetup,
  UserWeapon,
  ElementType,
} from "@Src/types";

import { ELEMENT_TYPES } from "@Src/constants";
import { $AppData, $AppCharacter } from "@Src/services";
import { Calculation_, Modifier_, Weapon_, findById, findByIndex } from "@Src/utils";
import { version3map } from "./util-maps";

type ConvertUserDataArgs = {
  version: number;
  Characters: any[];
  Weapons: any[];
  Artifacts: any[];
  Setups: any[];
};

export function convertFromVersion2_1(data: Omit<ConvertUserDataArgs, "version">) {
  let seedID = Date.now();
  let weapons = data.Weapons.map(convertWeapon);
  let artifacts = data.Artifacts.map(convertArtifact);

  const newWeapons: UserWeapon[] = [];
  const newArtifacts: UserArtifact[] = [];
  const characters = data.Characters.map((Character) => {
    const { character, xtraWeapon } = convertCharacter(Character, weapons, artifacts, seedID);

    if (xtraWeapon) {
      newWeapons.push(xtraWeapon);
    }

    return character;
  });

  seedID += newWeapons.length;

  const setups = data.Setups.filter((setup) => setup.type !== "complex").map((Setup) => {
    const { setup, xtraWeapon, xtraArtifacts } = convertSetup(Setup, weapons, artifacts, seedID++);

    if (xtraWeapon) {
      newWeapons.push(xtraWeapon);
      seedID++;
    }
    if (xtraArtifacts.length) {
      newArtifacts.push(...xtraArtifacts);
      seedID += xtraArtifacts.length;
    }

    return setup;
  });

  if (newWeapons.length) {
    weapons = weapons.concat(newWeapons);
  }
  if (newArtifacts.length) {
    artifacts = artifacts.concat(newArtifacts);
  }

  return {
    version: 3,
    characters,
    weapons,
    artifacts,
    setups,
  };
}

const convertCharInfo = (char: any): Character => {
  const {
    name,
    level = "1/20",
    "Normal Attack": NAs,
    "Elemental Skill": ES,
    "Elemental Burst": EB,
    constellation: cons,
  } = char;

  return { name, level, NAs, ES, EB, cons };
};

const convertWeapon = (weapon: any): UserWeapon => {
  const { ID, type, code, level, refinement: refi, user: owner } = weapon;

  return { ID, type: type.toLowerCase(), code, level, refi, owner };
};

const convertArtifact = (artifact: any): UserArtifact => {
  const { ID, type, code, rarity = 5, level, mainSType, subS, user: owner = null } = artifact;

  const mainStatType = version3map[mainSType] as AttributeStat;
  const subStats = subS.map((stat: any) => {
    return {
      type: version3map[stat.type],
      value: stat.val,
    };
  });

  return { ID, type, code, rarity, level, mainStatType, subStats, owner };
};

interface ConvertCharacterResult {
  character: UserCharacter;
  xtraWeapon?: UserWeapon;
}
const convertCharacter = (
  char: any,
  weapons: UserWeapon[],
  artifacts: UserArtifact[],
  seedID: number
): ConvertCharacterResult => {
  const { weaponID, artIDs = [], ...charInfo } = char;
  let finalWeaponID = weaponID;
  let xtraWeapon: UserWeapon | undefined;
  const artifactIDs: (number | null)[] = [];

  if (!weaponID || !findById(weapons, weaponID)) {
    finalWeaponID = seedID++;
    const { weaponType = "sword" } = $AppCharacter.get(char.name) || {};

    xtraWeapon = {
      owner: char.name,
      ...Weapon_.create({ type: weaponType }, finalWeaponID),
    };
  }

  for (const index of [0, 1, 2, 3, 4]) {
    artifactIDs.push(artIDs[index] && findById(artifacts, artIDs[index]) ? artIDs[index] : null);
  }

  return {
    character: { ...convertCharInfo(charInfo), weaponID: finalWeaponID, artifactIDs },
    xtraWeapon,
  };
};

interface OldModifierCtrl {
  activated: boolean;
  index: number;
  inputs?: Array<boolean | number | string> | undefined;
}
interface CleanModifiersRef {
  index: number;
  inputConfigs?: ModInputConfig[];
}
const cleanModifiers = (mods: OldModifierCtrl[], refs: CleanModifiersRef[]): ModifierCtrl[] => {
  const result: ModifierCtrl[] = [];

  for (const mod of mods) {
    const ref = findByIndex(refs, mod.index);
    if (!ref) continue;

    const inputs: number[] = [];
    const { inputConfigs = [] } = ref;

    inputConfigs.forEach((config, configIndex) => {
      const input = mod.inputs?.[configIndex];
      const { type, max, options } = config;

      if (typeof input === "boolean" && type === "check") {
        return inputs.push(input ? 1 : 0);
      }
      if (typeof input === "number" && ["text", "stacks", "select"].includes(type)) {
        return inputs.push(max ? Math.min(input, max) : input);
      }
      if (typeof input === "string") {
        let inputIndex = -1;

        if (type === "select" && options) {
          inputIndex = options.indexOf(input);
        } else if (type === "anemoable" || type === "dendroable") {
          inputIndex = ELEMENT_TYPES.indexOf(input.toLowerCase() as ElementType);
        }

        if (inputIndex !== -1) {
          return inputs.push(inputIndex);
        }
      }

      inputs.push(Modifier_.getDefaultInitialValue(type));
    });

    result.push({
      index: ref.index,
      activated: mod.activated,
      ...(inputs.length ? { inputs } : undefined),
    });
  }

  return result;
};

interface ConvertSetupResult {
  setup: UserSetup;
  xtraWeapon?: UserWeapon;
  xtraArtifacts: UserArtifact[];
}
const convertSetup = (
  setup: any,
  weapons: UserWeapon[],
  artifacts: UserArtifact[],
  seedID: number
): ConvertSetupResult => {
  const { weapon, art } = setup;
  const { buffs = [], debuffs = [] } = $AppCharacter.get(setup.char.name) || {};
  let weaponID: number;
  let xtraWeapon: UserWeapon | undefined;
  const artifactIDs: (number | null)[] = [];
  const xtraArtifacts: UserArtifact[] = [];
  const party: Party = [];

  const resonances =
    setup.elmtMCs.resonance?.reduce((result: Resonance[], { name, ...rest }: any) => {
      const elementType = version3map[name];

      if (elementType) {
        result.push({ vision: elementType, ...rest });
      }

      return result;
    }, []) || [];

  // WEAPON
  let dataWeapon: AppWeapon | undefined;
  const { BCs: wpBuffCtrls, ...weaponInfo } = weapon;

  const existedWeapon = findById(weapons, weaponInfo.ID);

  if (weaponInfo.ID && existedWeapon) {
    weaponID = weaponInfo.ID;
    dataWeapon = $AppData.getWeapon(existedWeapon.code);

    if (!existedWeapon.setupIDs?.includes(setup.ID)) {
      existedWeapon.setupIDs = (existedWeapon.setupIDs || []).concat(setup.ID);
    }
  } else {
    weaponID = seedID++;

    xtraWeapon = {
      ...convertWeapon(weapon),
      ID: weaponID,
      owner: null,
      setupIDs: [setup.ID],
    };
    dataWeapon = $AppData.getWeapon(xtraWeapon.code);
  }

  // ARTIFACTS
  const finalArtifacts: UserArtifact[] = [];

  for (const index of [0, 1, 2, 3, 4]) {
    const artifact = art.pieces[index];

    if (artifact) {
      const existedArtifact = findById(artifacts, artifact.ID);

      if (existedArtifact) {
        artifactIDs.push(existedArtifact.ID);
        finalArtifacts.push(existedArtifact);

        if (!existedArtifact.setupIDs?.includes(setup.ID)) {
          existedArtifact.setupIDs = (existedArtifact.setupIDs || []).concat(setup.ID);
        }
      } else {
        const artifactID = seedID++;
        artifactIDs.push(artifactID);

        const xtraArtifact = {
          ...convertArtifact(artifact),
          ID: artifactID,
          owner: null,
          setupIDs: [setup.ID],
        };

        xtraArtifacts.push(xtraArtifact);
        finalArtifacts.push(xtraArtifact);
      }
    } else {
      artifactIDs.push(null);
    }
  }
  const { code: setBonusesCode = 0 } = Calculation_.getArtifactSetBonuses(finalArtifacts)[0] || {};
  const { buffs: artifactBuffs = [] } = $AppData.getArtifactSet(setBonusesCode) || {};

  // PARTY
  for (const teammate of setup.party) {
    if (!teammate) {
      party.push(null);
    } else {
      const dataTeammate = $AppCharacter.get(teammate);

      if (!dataTeammate) {
        party.push(null);
      } else {
        const { weaponType, buffs = [], debuffs = [] } = dataTeammate;

        party.push({
          name: teammate.name,
          weapon: {
            code: Weapon_.getDefaultCode(weaponType),
            type: weaponType,
            refi: 1,
            buffCtrls: [],
          },
          artifact: {
            code: 0,
            buffCtrls: [],
          },
          buffCtrls: cleanModifiers(teammate.BCs, buffs),
          debuffCtrls: cleanModifiers(teammate.DCs, debuffs),
        });
      }
    }
  }

  const {
    Level: level = 1,
    "Pyro RES": pyro,
    "Hydro RES": hydro,
    "Dendro RES": dendro,
    "Electro RES": electro,
    "Anemo RES": anemo,
    "Cryo RES": cryo,
    "Geo RES": geo,
    "Physical RES": phys,
  } = setup.target;

  return {
    setup: {
      ID: setup.ID,
      type: "original",
      name: setup.name,
      char: convertCharInfo(setup.char),
      weaponID,
      artifactIDs,
      party,

      elmtModCtrls: {
        infuse_reaction: null,
        reaction: null,
        resonances,
        superconduct: !!setup.elmtMCs?.superconduct,
        absorption: null,
      },
      selfBuffCtrls: cleanModifiers(setup.selfMCs?.BCs || [], buffs),
      selfDebuffCtrls: cleanModifiers(setup.selfMCs?.DCs || [], debuffs),
      wpBuffCtrls: cleanModifiers(wpBuffCtrls, dataWeapon?.buffs || []),
      artBuffCtrls: cleanModifiers(setup.art?.BCs || [], artifactBuffs),
      artDebuffCtrls: Modifier_.createArtifactDebuffCtrls(),
      customBuffCtrls: [],
      customDebuffCtrls: [],

      customInfusion: {
        element: "phys",
      },
      target: {
        level,
        code: 0,
        resistances: { pyro, hydro, dendro, electro, anemo, cryo, geo, phys },
      },
    },
    xtraWeapon,
    xtraArtifacts,
  };
};
