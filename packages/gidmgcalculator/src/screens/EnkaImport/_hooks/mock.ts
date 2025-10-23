import { GenshinUserResponse } from "@/services/enka";

export const userMock: GenshinUserResponse = {
  uid: "1234567890",
  name: "Algoinde",
  level: 57,
  worldLevel: 7,
  signature: "Meta rejected us. So we rejected the meta.",
  builds: [
    {
      character: {
        key: "Amber",
        level: 90,
        constellation: 6,
        ascension: 6,
        talent: {
          auto: 10,
          skill: 10,
          burst: 10,
        },
      },
      artifacts: [
        {
          setKey: "BloodstainedChivalry",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Amber",
          lock: false,
          substats: [
            {
              key: "def",
              value: 37,
            },
            {
              key: "atk_",
              value: 11.1,
            },
            {
              key: "critDMG_",
              value: 18.7,
            },
            {
              key: "eleMas",
              value: 19,
            },
          ],
        },
        {
          setKey: "BloodstainedChivalry",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Amber",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 3.9,
            },
            {
              key: "atk_",
              value: 9.9,
            },
            {
              key: "def_",
              value: 19,
            },
            {
              key: "critDMG_",
              value: 22.5,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Amber",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 21,
            },
            {
              key: "atk",
              value: 14,
            },
            {
              key: "critRate_",
              value: 14.4,
            },
            {
              key: "critDMG_",
              value: 15.5,
            },
          ],
        },
        {
          setKey: "PaleFlame",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "physical_dmg_",
          location: "Amber",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 6.6,
            },
            {
              key: "atk",
              value: 37,
            },
            {
              key: "atk_",
              value: 9.3,
            },
            {
              key: "def_",
              value: 16,
            },
          ],
        },
        {
          setKey: "PaleFlame",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Amber",
          lock: false,
          substats: [
            {
              key: "def",
              value: 60,
            },
            {
              key: "atk_",
              value: 20.4,
            },
            {
              key: "def_",
              value: 7.3,
            },
            {
              key: "atk",
              value: 19,
            },
          ],
        },
      ],
      weapon: {
        key: "SkywardHarp",
        level: 90,
        ascension: 6,
        refinement: 2,
        location: "Amber",
        lock: false,
      },
    },
    {
      character: {
        key: "Bennett",
        level: 90,
        constellation: 6,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 8,
          burst: 10,
        },
      },
      artifacts: [
        {
          setKey: "NoblesseOblige",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Bennett",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 9.7,
            },
            {
              key: "atk",
              value: 31,
            },
            {
              key: "atk_",
              value: 9.3,
            },
            {
              key: "def_",
              value: 12.4,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Bennett",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 6.6,
            },
            {
              key: "enerRech_",
              value: 15.5,
            },
            {
              key: "def_",
              value: 7.3,
            },
            {
              key: "eleMas",
              value: 37,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Bennett",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 18.7,
            },
            {
              key: "eleMas",
              value: 37,
            },
            {
              key: "hp",
              value: 239,
            },
            {
              key: "critRate_",
              value: 10.1,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Bennett",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 10.4,
            },
            {
              key: "critDMG_",
              value: 15.5,
            },
            {
              key: "hp_",
              value: 9.9,
            },
            {
              key: "def_",
              value: 11.7,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "Bennett",
          lock: false,
          substats: [
            {
              key: "atk_",
              value: 14.6,
            },
            {
              key: "enerRech_",
              value: 10.4,
            },
            {
              key: "def",
              value: 39,
            },
            {
              key: "eleMas",
              value: 23,
            },
          ],
        },
      ],
      weapon: {
        key: "FreedomSworn",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Bennett",
        lock: false,
      },
    },
    {
      character: {
        key: "Ganyu",
        level: 90,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 9,
          skill: 9,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "WanderersTroupe",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 18.7,
            },
            {
              key: "eleMas",
              value: 72,
            },
            {
              key: "critRate_",
              value: 3.1,
            },
            {
              key: "enerRech_",
              value: 6.5,
            },
          ],
        },
        {
          setKey: "WanderersTroupe",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "hp_",
              value: 5.8,
            },
            {
              key: "critDMG_",
              value: 12.4,
            },
            {
              key: "critRate_",
              value: 9.7,
            },
            {
              key: "atk_",
              value: 9.3,
            },
          ],
        },
        {
          setKey: "WanderersTroupe",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "def",
              value: 39,
            },
            {
              key: "hp",
              value: 239,
            },
            {
              key: "critDMG_",
              value: 21.8,
            },
            {
              key: "critRate_",
              value: 7,
            },
          ],
        },
        {
          setKey: "ShimenawasReminiscence",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "cryo_dmg_",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 8.9,
            },
            {
              key: "eleMas",
              value: 40,
            },
            {
              key: "critDMG_",
              value: 6.2,
            },
            {
              key: "hp",
              value: 478,
            },
          ],
        },
        {
          setKey: "WanderersTroupe",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "def",
              value: 23,
            },
            {
              key: "critRate_",
              value: 14.4,
            },
            {
              key: "hp_",
              value: 11.1,
            },
            {
              key: "def_",
              value: 7.3,
            },
          ],
        },
      ],
      weapon: {
        key: "AmosBow",
        level: 90,
        ascension: 6,
        refinement: 2,
        location: "Ganyu",
        lock: false,
      },
    },
    {
      character: {
        key: "Xingqiu",
        level: 80,
        constellation: 6,
        ascension: 5,
        talent: {
          auto: 2,
          skill: 8,
          burst: 8,
        },
      },
      artifacts: [
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Xingqiu",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 28.7,
            },
            {
              key: "enerRech_",
              value: 9.7,
            },
            {
              key: "eleMas",
              value: 19,
            },
            {
              key: "atk",
              value: 19,
            },
          ],
        },
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Xingqiu",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 27.2,
            },
            {
              key: "critRate_",
              value: 7,
            },
            {
              key: "enerRech_",
              value: 5.2,
            },
            {
              key: "def_",
              value: 6.6,
            },
          ],
        },
        {
          setKey: "WanderersTroupe",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Xingqiu",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 7.8,
            },
            {
              key: "critRate_",
              value: 13.6,
            },
            {
              key: "def",
              value: 19,
            },
            {
              key: "enerRech_",
              value: 13,
            },
          ],
        },
        {
          setKey: "TenacityOfTheMillelith",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "hydro_dmg_",
          location: "Xingqiu",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 6.5,
            },
            {
              key: "eleMas",
              value: 35,
            },
            {
              key: "critDMG_",
              value: 28.7,
            },
            {
              key: "atk",
              value: 16,
            },
          ],
        },
        {
          setKey: "WanderersTroupe",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "Xingqiu",
          lock: false,
          substats: [
            {
              key: "def",
              value: 42,
            },
            {
              key: "atk",
              value: 19,
            },
            {
              key: "critDMG_",
              value: 22.5,
            },
            {
              key: "enerRech_",
              value: 12.3,
            },
          ],
        },
      ],
      weapon: {
        key: "SacrificialSword",
        level: 80,
        ascension: 5,
        refinement: 5,
        location: "Xingqiu",
        lock: false,
      },
    },
  ],
};

export const ronqueroc: GenshinUserResponse = {
  uid: "1234567890",
  name: "Ronqueroc",
  level: 60,
  worldLevel: 9,
  signature: "",
  builds: [
    {
      character: {
        key: "Ganyu",
        level: 90,
        constellation: 1,
        ascension: 6,
        talent: {
          auto: 10,
          skill: 9,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "BlizzardStrayer",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "atk_",
              value: 8.7,
            },
            {
              key: "critDMG_",
              value: 20.2,
            },
            {
              key: "def_",
              value: 5.8,
            },
            {
              key: "atk",
              value: 54,
            },
          ],
        },
        {
          setKey: "BlizzardStrayer",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "def_",
              value: 5.8,
            },
            {
              key: "critDMG_",
              value: 29.5,
            },
            {
              key: "enerRech_",
              value: 9.7,
            },
            {
              key: "critRate_",
              value: 7.4,
            },
          ],
        },
        {
          setKey: "BlizzardStrayer",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "def",
              value: 46,
            },
            {
              key: "critDMG_",
              value: 25.6,
            },
            {
              key: "eleMas",
              value: 21,
            },
            {
              key: "hp_",
              value: 4.7,
            },
          ],
        },
        {
          setKey: "DeepwoodMemories",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "cryo_dmg_",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "def",
              value: 44,
            },
            {
              key: "critDMG_",
              value: 20.2,
            },
            {
              key: "critRate_",
              value: 3.9,
            },
            {
              key: "atk_",
              value: 9.3,
            },
          ],
        },
        {
          setKey: "BlizzardStrayer",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "Ganyu",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 23,
            },
            {
              key: "hp",
              value: 299,
            },
            {
              key: "atk",
              value: 54,
            },
            {
              key: "critDMG_",
              value: 20.2,
            },
          ],
        },
      ],
      weapon: {
        key: "SkywardHarp",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Ganyu",
        lock: false,
      },
    },
    {
      character: {
        key: "Rosaria",
        level: 81,
        constellation: 6,
        ascension: 6,
        talent: {
          auto: 9,
          skill: 9,
          burst: 10,
        },
      },
      artifacts: [
        {
          setKey: "NoblesseOblige",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Rosaria",
          lock: false,
          substats: [
            {
              key: "hp_",
              value: 9.9,
            },
            {
              key: "critDMG_",
              value: 14,
            },
            {
              key: "critRate_",
              value: 12.8,
            },
            {
              key: "def",
              value: 21,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Rosaria",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 5.8,
            },
            {
              key: "def",
              value: 23,
            },
            {
              key: "critDMG_",
              value: 28,
            },
            {
              key: "atk_",
              value: 9.3,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Rosaria",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 37,
            },
            {
              key: "def",
              value: 21,
            },
            {
              key: "critDMG_",
              value: 7,
            },
            {
              key: "critRate_",
              value: 13.2,
            },
          ],
        },
        {
          setKey: "GildedDreams",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "cryo_dmg_",
          location: "Rosaria",
          lock: false,
          substats: [
            {
              key: "hp",
              value: 777,
            },
            {
              key: "critRate_",
              value: 2.7,
            },
            {
              key: "critDMG_",
              value: 19.4,
            },
            {
              key: "atk_",
              value: 4.1,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Rosaria",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 4.5,
            },
            {
              key: "hp_",
              value: 17.5,
            },
            {
              key: "atk_",
              value: 11.1,
            },
            {
              key: "critRate_",
              value: 6.6,
            },
          ],
        },
      ],
      weapon: {
        key: "Deathmatch",
        level: 90,
        ascension: 6,
        refinement: 3,
        location: "Rosaria",
        lock: false,
      },
    },
    {
      character: {
        key: "Eula",
        level: 89,
        constellation: 1,
        ascension: 6,
        talent: {
          auto: 9,
          skill: 9,
          burst: 10,
        },
      },
      artifacts: [
        {
          setKey: "PaleFlame",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Eula",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 16,
            },
            {
              key: "critRate_",
              value: 14,
            },
            {
              key: "critDMG_",
              value: 11.7,
            },
            {
              key: "enerRech_",
              value: 11.7,
            },
          ],
        },
        {
          setKey: "BloodstainedChivalry",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Eula",
          lock: false,
          substats: [
            {
              key: "def_",
              value: 7.3,
            },
            {
              key: "critRate_",
              value: 3.5,
            },
            {
              key: "critDMG_",
              value: 26.4,
            },
            {
              key: "def",
              value: 44,
            },
          ],
        },
        {
          setKey: "PaleFlame",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Eula",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 10.9,
            },
            {
              key: "def_",
              value: 13.9,
            },
            {
              key: "critRate_",
              value: 6.2,
            },
            {
              key: "hp",
              value: 478,
            },
          ],
        },
        {
          setKey: "ScrollOfTheHeroOfCinderCity",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "physical_dmg_",
          location: "Eula",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 28.7,
            },
            {
              key: "critRate_",
              value: 7,
            },
            {
              key: "enerRech_",
              value: 11,
            },
            {
              key: "def_",
              value: 5.1,
            },
          ],
        },
        {
          setKey: "BloodstainedChivalry",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "Eula",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 15.5,
            },
            {
              key: "critDMG_",
              value: 19.4,
            },
            {
              key: "def_",
              value: 7.3,
            },
            {
              key: "hp_",
              value: 4.1,
            },
          ],
        },
      ],
      weapon: {
        key: "WolfsGravestone",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Eula",
        lock: false,
      },
    },
    {
      character: {
        key: "Sucrose",
        level: 81,
        constellation: 6,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 9,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "ViridescentVenerer",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Sucrose",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 56,
            },
            {
              key: "def_",
              value: 19,
            },
            {
              key: "enerRech_",
              value: 13,
            },
            {
              key: "critRate_",
              value: 3.9,
            },
          ],
        },
        {
          setKey: "ViridescentVenerer",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Sucrose",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 18.8,
            },
            {
              key: "eleMas",
              value: 16,
            },
            {
              key: "hp",
              value: 209,
            },
            {
              key: "critRate_",
              value: 9.3,
            },
          ],
        },
        {
          setKey: "ViridescentVenerer",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "eleMas",
          location: "Sucrose",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 11.7,
            },
            {
              key: "hp_",
              value: 4.7,
            },
            {
              key: "hp",
              value: 1046,
            },
            {
              key: "atk_",
              value: 9.9,
            },
          ],
        },
        {
          setKey: "ViridescentVenerer",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "eleMas",
          location: "Sucrose",
          lock: false,
          substats: [
            {
              key: "hp",
              value: 239,
            },
            {
              key: "atk",
              value: 18,
            },
            {
              key: "atk_",
              value: 12.2,
            },
            {
              key: "enerRech_",
              value: 18.1,
            },
          ],
        },
        {
          setKey: "HuskOfOpulentDreams",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "eleMas",
          location: "Sucrose",
          lock: false,
          substats: [
            {
              key: "hp_",
              value: 5.8,
            },
            {
              key: "critRate_",
              value: 7,
            },
            {
              key: "enerRech_",
              value: 17.5,
            },
            {
              key: "atk",
              value: 31,
            },
          ],
        },
      ],
      weapon: {
        key: "SacrificialFragments",
        level: 90,
        ascension: 6,
        refinement: 5,
        location: "Sucrose",
        lock: false,
      },
    },
    {
      character: {
        key: "YaeMiko",
        level: 89,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 10,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "WanderersTroupe",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "YaeMiko",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 10.1,
            },
            {
              key: "enerRech_",
              value: 11,
            },
            {
              key: "critDMG_",
              value: 20.2,
            },
            {
              key: "eleMas",
              value: 21,
            },
          ],
        },
        {
          setKey: "WanderersTroupe",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "YaeMiko",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 5.8,
            },
            {
              key: "critRate_",
              value: 10.9,
            },
            {
              key: "hp",
              value: 269,
            },
            {
              key: "critDMG_",
              value: 22.5,
            },
          ],
        },
        {
          setKey: "GladiatorsFinale",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "YaeMiko",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 6.5,
            },
            {
              key: "critRate_",
              value: 10.5,
            },
            {
              key: "eleMas",
              value: 61,
            },
            {
              key: "critDMG_",
              value: 7,
            },
          ],
        },
        {
          setKey: "GladiatorsFinale",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "electro_dmg_",
          location: "YaeMiko",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 20.2,
            },
            {
              key: "atk_",
              value: 9.9,
            },
            {
              key: "critRate_",
              value: 6.2,
            },
            {
              key: "atk",
              value: 16,
            },
          ],
        },
        {
          setKey: "NoblesseOblige",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "YaeMiko",
          lock: false,
          substats: [
            {
              key: "hp",
              value: 478,
            },
            {
              key: "hp_",
              value: 4.1,
            },
            {
              key: "critDMG_",
              value: 21,
            },
            {
              key: "enerRech_",
              value: 10.4,
            },
          ],
        },
      ],
      weapon: {
        key: "KagurasVerity",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "YaeMiko",
        lock: false,
      },
    },
    {
      character: {
        key: "Dehya",
        level: 90,
        constellation: 3,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 9,
          burst: 10,
        },
      },
      artifacts: [
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Dehya",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 5.4,
            },
            {
              key: "critRate_",
              value: 16.3,
            },
            {
              key: "def",
              value: 21,
            },
            {
              key: "atk_",
              value: 5.8,
            },
          ],
        },
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Dehya",
          lock: false,
          substats: [
            {
              key: "hp",
              value: 209,
            },
            {
              key: "critRate_",
              value: 7.4,
            },
            {
              key: "critDMG_",
              value: 21,
            },
            {
              key: "def_",
              value: 12.4,
            },
          ],
        },
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Dehya",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 10.1,
            },
            {
              key: "hp_",
              value: 4.7,
            },
            {
              key: "critDMG_",
              value: 14.8,
            },
            {
              key: "def",
              value: 35,
            },
          ],
        },
        {
          setKey: "ObsidianCodex",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "pyro_dmg_",
          location: "Dehya",
          lock: false,
          substats: [
            {
              key: "hp_",
              value: 9.3,
            },
            {
              key: "critDMG_",
              value: 12.4,
            },
            {
              key: "critRate_",
              value: 10.5,
            },
            {
              key: "atk",
              value: 33,
            },
          ],
        },
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Dehya",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 9.3,
            },
            {
              key: "def_",
              value: 19.7,
            },
            {
              key: "hp_",
              value: 5.3,
            },
            {
              key: "atk_",
              value: 9.3,
            },
          ],
        },
      ],
      weapon: {
        key: "WolfsGravestone",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Dehya",
        lock: false,
      },
    },
    {
      character: {
        key: "Lynette",
        level: 80,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 9,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "ViridescentVenerer",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Lynette",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 14.8,
            },
            {
              key: "critRate_",
              value: 10.1,
            },
            {
              key: "atk_",
              value: 9.9,
            },
            {
              key: "def",
              value: 35,
            },
          ],
        },
        {
          setKey: "ViridescentVenerer",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Lynette",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 9.3,
            },
            {
              key: "hp_",
              value: 10.5,
            },
            {
              key: "enerRech_",
              value: 10.4,
            },
            {
              key: "critDMG_",
              value: 11.7,
            },
          ],
        },
        {
          setKey: "ViridescentVenerer",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "enerRech_",
          location: "Lynette",
          lock: false,
          substats: [
            {
              key: "def",
              value: 69,
            },
            {
              key: "atk",
              value: 19,
            },
            {
              key: "critRate_",
              value: 6.2,
            },
            {
              key: "critDMG_",
              value: 20.2,
            },
          ],
        },
        {
          setKey: "GladiatorsFinale",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "anemo_dmg_",
          location: "Lynette",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 16,
            },
            {
              key: "def",
              value: 35,
            },
            {
              key: "enerRech_",
              value: 16.2,
            },
            {
              key: "critDMG_",
              value: 21,
            },
          ],
        },
        {
          setKey: "ViridescentVenerer",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Lynette",
          lock: false,
          substats: [
            {
              key: "def",
              value: 53,
            },
            {
              key: "critRate_",
              value: 7,
            },
            {
              key: "atk_",
              value: 14,
            },
            {
              key: "hp_",
              value: 5.8,
            },
          ],
        },
      ],
      weapon: {
        key: "PrimordialJadeCutter",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Lynette",
        lock: false,
      },
    },
    {
      character: {
        key: "Navia",
        level: 89,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 10,
          skill: 10,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "NighttimeWhispersInTheEchoingWoods",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Navia",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 16,
            },
            {
              key: "critDMG_",
              value: 20.2,
            },
            {
              key: "critRate_",
              value: 7,
            },
            {
              key: "eleMas",
              value: 37,
            },
          ],
        },
        {
          setKey: "NighttimeWhispersInTheEchoingWoods",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Navia",
          lock: false,
          substats: [
            {
              key: "hp",
              value: 269,
            },
            {
              key: "def_",
              value: 11.7,
            },
            {
              key: "critDMG_",
              value: 12.4,
            },
            {
              key: "critRate_",
              value: 9.3,
            },
          ],
        },
        {
          setKey: "NighttimeWhispersInTheEchoingWoods",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Navia",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 14,
            },
            {
              key: "atk",
              value: 54,
            },
            {
              key: "critRate_",
              value: 9.7,
            },
            {
              key: "eleMas",
              value: 16,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "geo_dmg_",
          location: "Navia",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 13.2,
            },
            {
              key: "atk_",
              value: 9.9,
            },
            {
              key: "def",
              value: 39,
            },
            {
              key: "critRate_",
              value: 10.1,
            },
          ],
        },
        {
          setKey: "NighttimeWhispersInTheEchoingWoods",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Navia",
          lock: false,
          substats: [
            {
              key: "atk_",
              value: 4.7,
            },
            {
              key: "critRate_",
              value: 7.8,
            },
            {
              key: "def",
              value: 56,
            },
            {
              key: "def_",
              value: 12.4,
            },
          ],
        },
      ],
      weapon: {
        key: "BeaconOfTheReedSea",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Navia",
        lock: false,
      },
    },
    {
      character: {
        key: "Clorinde",
        level: 89,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 10,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Clorinde",
          lock: false,
          substats: [
            {
              key: "def",
              value: 60,
            },
            {
              key: "critDMG_",
              value: 19.4,
            },
            {
              key: "enerRech_",
              value: 5.2,
            },
            {
              key: "critRate_",
              value: 6.6,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Clorinde",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 7.4,
            },
            {
              key: "hp_",
              value: 11.1,
            },
            {
              key: "eleMas",
              value: 51,
            },
            {
              key: "critDMG_",
              value: 13.2,
            },
          ],
        },
        {
          setKey: "ThunderingFury",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Clorinde",
          lock: false,
          substats: [
            {
              key: "def",
              value: 37,
            },
            {
              key: "critDMG_",
              value: 21.8,
            },
            {
              key: "critRate_",
              value: 7,
            },
            {
              key: "atk",
              value: 14,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "electro_dmg_",
          location: "Clorinde",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 49,
            },
            {
              key: "enerRech_",
              value: 6.5,
            },
            {
              key: "critDMG_",
              value: 18.7,
            },
            {
              key: "eleMas",
              value: 23,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "Clorinde",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 18,
            },
            {
              key: "def",
              value: 44,
            },
            {
              key: "def_",
              value: 13.1,
            },
            {
              key: "critDMG_",
              value: 28,
            },
          ],
        },
      ],
      weapon: {
        key: "Absolution",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Clorinde",
        lock: false,
      },
    },
    {
      character: {
        key: "Arlecchino",
        level: 89,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 10,
          skill: 8,
          burst: 8,
        },
      },
      artifacts: [
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Arlecchino",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 5.2,
            },
            {
              key: "eleMas",
              value: 16,
            },
            {
              key: "critRate_",
              value: 14.4,
            },
            {
              key: "atk_",
              value: 14,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Arlecchino",
          lock: false,
          substats: [
            {
              key: "critDMG_",
              value: 21.8,
            },
            {
              key: "eleMas",
              value: 23,
            },
            {
              key: "critRate_",
              value: 7.4,
            },
            {
              key: "def",
              value: 32,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Arlecchino",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 19,
            },
            {
              key: "def",
              value: 16,
            },
            {
              key: "atk",
              value: 18,
            },
            {
              key: "critRate_",
              value: 15.6,
            },
          ],
        },
        {
          setKey: "EmblemOfSeveredFate",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "pyro_dmg_",
          location: "Arlecchino",
          lock: false,
          substats: [
            {
              key: "critRate_",
              value: 14,
            },
            {
              key: "critDMG_",
              value: 6.2,
            },
            {
              key: "atk_",
              value: 8.2,
            },
            {
              key: "hp_",
              value: 9.9,
            },
          ],
        },
        {
          setKey: "FragmentOfHarmonicWhimsy",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critRate_",
          location: "Arlecchino",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 29,
            },
            {
              key: "eleMas",
              value: 33,
            },
            {
              key: "enerRech_",
              value: 4.5,
            },
            {
              key: "critDMG_",
              value: 18.7,
            },
          ],
        },
      ],
      weapon: {
        key: "DragonsBane",
        level: 90,
        ascension: 6,
        refinement: 5,
        location: "Arlecchino",
        lock: false,
      },
    },
    {
      character: {
        key: "Xilonen",
        level: 89,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 10,
          skill: 10,
          burst: 9,
        },
      },
      artifacts: [
        {
          setKey: "ScrollOfTheHeroOfCinderCity",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Xilonen",
          lock: false,
          substats: [
            {
              key: "def",
              value: 35,
            },
            {
              key: "enerRech_",
              value: 16.2,
            },
            {
              key: "def_",
              value: 13.1,
            },
            {
              key: "atk_",
              value: 5.8,
            },
          ],
        },
        {
          setKey: "ScrollOfTheHeroOfCinderCity",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Xilonen",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 19,
            },
            {
              key: "def_",
              value: 19.7,
            },
            {
              key: "hp_",
              value: 4.7,
            },
            {
              key: "enerRech_",
              value: 15.5,
            },
          ],
        },
        {
          setKey: "ScrollOfTheHeroOfCinderCity",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "def_",
          location: "Xilonen",
          lock: false,
          substats: [
            {
              key: "enerRech_",
              value: 16.2,
            },
            {
              key: "critRate_",
              value: 3.9,
            },
            {
              key: "hp",
              value: 448,
            },
            {
              key: "critDMG_",
              value: 14,
            },
          ],
        },
        {
          setKey: "ScrollOfTheHeroOfCinderCity",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "def_",
          location: "Xilonen",
          lock: false,
          substats: [
            {
              key: "def",
              value: 16,
            },
            {
              key: "hp",
              value: 478,
            },
            {
              key: "enerRech_",
              value: 20.1,
            },
            {
              key: "critDMG_",
              value: 6.2,
            },
          ],
        },
        {
          setKey: "ScrollOfTheHeroOfCinderCity",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "heal_",
          location: "Xilonen",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 39,
            },
            {
              key: "enerRech_",
              value: 13,
            },
            {
              key: "hp_",
              value: 5.3,
            },
            {
              key: "def_",
              value: 18.2,
            },
          ],
        },
      ],
      weapon: {
        key: "PeakPatrolSong",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Xilonen",
        lock: false,
      },
    },
    {
      character: {
        key: "Mavuika",
        level: 89,
        constellation: 0,
        ascension: 6,
        talent: {
          auto: 6,
          skill: 9,
          burst: 10,
        },
      },
      artifacts: [
        {
          setKey: "ObsidianCodex",
          slotKey: "flower",
          level: 20,
          rarity: 5,
          mainStatKey: "hp",
          location: "Mavuika",
          lock: false,
          substats: [
            {
              key: "def",
              value: 16,
            },
            {
              key: "enerRech_",
              value: 6.5,
            },
            {
              key: "critDMG_",
              value: 24.9,
            },
            {
              key: "critRate_",
              value: 6.6,
            },
          ],
        },
        {
          setKey: "ObsidianCodex",
          slotKey: "plume",
          level: 20,
          rarity: 5,
          mainStatKey: "atk",
          location: "Mavuika",
          lock: false,
          substats: [
            {
              key: "hp_",
              value: 5.3,
            },
            {
              key: "critDMG_",
              value: 17.9,
            },
            {
              key: "critRate_",
              value: 10.5,
            },
            {
              key: "eleMas",
              value: 37,
            },
          ],
        },
        {
          setKey: "ObsidianCodex",
          slotKey: "sands",
          level: 20,
          rarity: 5,
          mainStatKey: "atk_",
          location: "Mavuika",
          lock: false,
          substats: [
            {
              key: "eleMas",
              value: 16,
            },
            {
              key: "critDMG_",
              value: 31.1,
            },
            {
              key: "atk",
              value: 19,
            },
            {
              key: "hp_",
              value: 11.1,
            },
          ],
        },
        {
          setKey: "ObsidianCodex",
          slotKey: "goblet",
          level: 20,
          rarity: 5,
          mainStatKey: "pyro_dmg_",
          location: "Mavuika",
          lock: false,
          substats: [
            {
              key: "atk",
              value: 19,
            },
            {
              key: "atk_",
              value: 4.1,
            },
            {
              key: "critRate_",
              value: 13.6,
            },
            {
              key: "critDMG_",
              value: 14.8,
            },
          ],
        },
        {
          setKey: "OceanHuedClam",
          slotKey: "circlet",
          level: 20,
          rarity: 5,
          mainStatKey: "critDMG_",
          location: "Mavuika",
          lock: false,
          substats: [
            {
              key: "def_",
              value: 5.1,
            },
            {
              key: "enerRech_",
              value: 6.5,
            },
            {
              key: "atk_",
              value: 9.3,
            },
            {
              key: "critRate_",
              value: 13.2,
            },
          ],
        },
      ],
      weapon: {
        key: "AThousandBlazingSuns",
        level: 90,
        ascension: 6,
        refinement: 1,
        location: "Mavuika",
        lock: false,
      },
    },
  ],
};
