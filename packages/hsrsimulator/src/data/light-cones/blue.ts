import { AppLightCone } from "@Backend";

export const blueLightCones: AppLightCone[] = [
  {
    id: 1,
    name: "Adversarial",
    rarity: 3,
    path: "theHunt",
    statsScale: [33, 16, 12],
    passiveName: "Alliance",
    description: "When the wearer defeats an enemy, increases SPD by 10~18% for 2 turn(s).",
    abilities: {
      trigger: {
        type: "ENEMY_DEFEATED",
        checkSource: "SELF",
      },
      effects: {
        type: "STATS_BOOST",
        value: 8,
        toStats: "spd_",
        turns: 2,
      },
    },
  },
  {
    id: 2,
    name: "Arrows",
    rarity: 3,
    path: "theHunt",
    statsScale: [38, 14, 12],
    passiveName: "Crisis",
    description: "At the start of the battle, the wearer's CRIT Rate increases by 12~24% for 3 turn(s).",
    abilities: {
      trigger: {
        type: "BATTLE_START",
      },
      effects: {
        type: "STATS_BOOST",
        value: 9,
        toStats: "cRate_",
        turns: 3,
      },
    },
  },
  {
    id: 3,
    name: "Chorus",
    rarity: 3,
    path: "harmony",
    statsScale: [38, 14, 12],
    passiveName: "Concerted",
    description:
      "After entering battle, increases the ATK of all allies by 8~12%. Abilities of the same type cannot stack.",
    bonuses: {
      type: "STATS",
      scope: "PARTY",
      value: 7,
      toStats: "atk_",
      stackId: "Concerted",
    },
  },
  {
    id: 4,
    name: "Collapsing Sky",
    rarity: 3,
    path: "destruction",
    statsScale: [38, 16, 9],
    passiveName: "Havoc",
    description: "The wearer's Basic ATK and Skill deal 20~40% more DMG.",
    bonuses: {
      type: "ATK_TYPES",
      value: 15,
      toTypes: ["basic", "skill"],
    },
  },
  {
    id: 5,
    name: "Cornucopia",
    rarity: 3,
    path: "abundance",
    statsScale: [43, 12, 12],
    passiveName: "Prosperity",
    description: "When the wearer uses their Skill or Ultimate, their Outgoing Healing increases by 12~24%.",
    abilities: {
      trigger: [
        { type: "SKILL_CAST", checkSource: "SELF" },
        { type: "ULTIMATE_CAST", checkSource: "SELF" },
      ],
      effects: {
        type: "STATS_BOOST",
        value: 9,
        toStats: "heal_",
        turns: Infinity, // #TO_CHECK
      },
    },
  },
  {
    id: 6,
    name: "Darting Arrow",
    rarity: 3,
    path: "theHunt",
    statsScale: [33, 16, 12],
    passiveName: "War Cry",
    description: "When the wearer defeats an enemy, increases ATK by 24~48% for 3 turn(s).",
    abilities: {
      trigger: {
        type: "ENEMY_DEFEATED",
        checkSource: "SELF",
      },
      effects: {
        type: "STATS_BOOST",
        value: 16,
        toStats: "atk_",
        turns: 3,
      },
    },
  },
  {
    id: 7,
    name: "Data Bank",
    rarity: 3,
    path: "erudition",
    statsScale: [33, 16, 12], // #TO_CHECK
    passiveName: "Learned",
    description: "Increases DMG dealt by the wearer's Ultimate by 28~56%.",
    bonuses: {
      type: "ATK_TYPES",
      toTypes: "ultimate",
      value: 21,
    },
  },
  {
    id: 8,
    name: "Defense",
    rarity: 3,
    path: "preservation",
    statsScale: [43, 12, 12],
    passiveName: "Revitalization",
    description: "When the wearer unleashes their Ultimate, they restore HP by 18~30% of their Max HP.",
    abilities: {
      trigger: {
        type: "ULTIMATE_CAST",
        checkSource: "SELF",
      },
      effects: {
        type: "HEAL",
        multiplier: 15,
      },
    },
  },
  {
    id: 9,
    name: "Fine Fruit",
    rarity: 3,
    path: "abundance",
    statsScale: [43, 14, 9],
    passiveName: "Savor",
    description: "At the start of the battle, immediately regenerates 6~12 Energy for all allies.",
    abilities: {
      trigger: {
        type: "BATTLE_START",
      },
      effects: {
        type: "REPLENISH",
        value: 4.5,
        scope: "PARTY",
      },
    },
  },
  {
    id: 10,
    name: "Hidden Shadow",
    rarity: 3,
    path: "nihility",
    statsScale: [38, 14, 12],
    passiveName: "Mechanism",
    description:
      "After using Skill, the wearer's next Basic ATK deals Additional DMG equal to 60~120% of ATK to the target enemy.",
    abilities: {
      trigger: {
        type: "SKILL_CAST",
        checkSource: "SELF",
      },
      effects: {
        type: "ATK_ENHANCE",
        value: 0.45,
        basedOn: "atk",
        toTypes: "basic",
        toAspect: "flat",
        quota: 1,
      },
    },
  },
  {
    id: 11,
    name: "Loop",
    rarity: 3,
    path: "nihility",
    statsScale: [38, 14, 12],
    passiveName: "Pursuit",
    description: "Increases DMG dealt from its wearer to Slowed enemies by 24~48%.",
    bonuses: {
      type: "ATK_TYPES",
      checkTargetStatus: "SLOWED",
      value: 18,
      toTypes: "ALL",
    },
  },
  {
    id: 12,
    name: "Mediation",
    rarity: 3,
    path: "harmony",
    statsScale: [38, 14, 12],
    passiveName: "Family",
    description: "Upon entering battle, increases SPD of all allies by 12~20 points for 1 turn(s).",
    abilities: {
      trigger: {
        type: "BATTLE_START",
      },
      effects: {
        type: "STATS_BOOST",
        value: 10,
        toStats: "spd",
        turns: 1,
      },
    },
  },
  {
    id: 13,
    name: "Meshing Cogs",
    rarity: 3,
    path: "harmony",
    statsScale: [38, 14, 12],
    passiveName: "Fleet Triumph",
    description:
      "After the wearer uses attacks or gets hit, additionally regenerates 4~8 Energy. This effect cannot be repeatedly triggered in a single turn.",
    abilities: {
      trigger: [
        {
          type: "ATTACK",
        },
        { type: "ALLY_ATTACKED", checkTarget: "SELF" },
      ],
      effects: {
        type: "REPLENISH",
        value: 3,
      },
      maxTriggersPerTurn: 1,
    },
  },
  {
    id: 14,
    name: "Multiplication",
    rarity: 3,
    path: "abundance",
    statsScale: [43, 14, 9],
    passiveName: "Denizens of Abundance",
    description: "After the wearer uses their Basic ATK, their next action will be Advanced Forward by 12~20%.",
    abilities: {
      trigger: {
        type: "BASIC_CAST",
      },
      effects: {
        type: "ADVANCED_FORWARD",
        value: 10,
      },
    },
  },
  {
    id: 15,
    name: "Mutual Demise",
    rarity: 3,
    path: "destruction",
    statsScale: [38, 16, 9],
    passiveName: "Legion",
    description: "If the wearer's current HP is lower than 80%, CRIT Rate increases by 12~24%.",
    bonuses: {
      type: "STATS",
      checkSelf: {
        type: "HP_THRESHOLD",
        value: 80,
        compare: "<",
      },
      value: 9,
      toStats: "cRate_",
    },
  },
  {
    id: 16,
    name: "Passkey",
    rarity: 3,
    path: "erudition",
    statsScale: [33, 16, 12],
    passiveName: "Epiphany",
    description:
      "After the wearer uses their Skill, additionally regenerates 8~12 Energy. This effect cannot be repeatedly triggered in a single turn.",
    abilities: {
      trigger: {
        type: "SKILL_CAST",
      },
      effects: {
        type: "REPLENISH",
        value: 7,
      },
      maxTriggersPerTurn: 1,
    },
  },
  {
    id: 17,
    name: "Pioneering",
    rarity: 3,
    path: "preservation",
    statsScale: [43, 12, 12],
    passiveName: "IPC",
    description: "When the wearer Breaks an enemy's Weakness, the wearer restores HP by 12~20% of their Max HP.",
    abilities: {
      trigger: {
        type: "BREAK",
        checkSource: "SELF",
      },
      effects: {
        type: "HEAL",
        multiplier: 10,
      },
    },
  },
  {
    id: 18,
    name: "Sagacity",
    rarity: 3,
    path: "erudition",
    statsScale: [33, 16, 12],
    passiveName: "Genius",
    description: "When the wearer uses their Ultimate, increases ATK by 24~48% for 2 turn(s).",
    abilities: {
      trigger: {
        type: "ULTIMATE_CAST",
        checkSource: "SELF",
      },
      effects: {
        type: "STATS_BOOST",
        value: 18,
        toStats: "atk_",
        turns: 2,
      },
    },
  },
  {
    id: 19,
    name: "Shattered Home",
    rarity: 3,
    path: "destruction",
    statsScale: [38, 16, 9],
    passiveName: "Eradication",
    description: "The wearer deals 20~40% more DMG to enemy targets whose HP percentage is greater than 50%.",
    bonuses: {
      type: "ATK_TYPES",
      checkTargetHp: {
        type: "HP_THRESHOLD",
        value: 50,
        compare: ">",
      },
      value: 15,
      toTypes: "ALL",
    },
  },
  {
    id: 20,
    name: "Void",
    rarity: 3,
    path: "nihility",
    statsScale: [38, 14, 12],
    passiveName: "Fallen",
    description: "At the start of the battle, the wearer's Effect Hit Rate increases by 20~40% for 3 turn(s).",
    abilities: {
      trigger: {
        type: "BATTLE_START",
      },
      effects: {
        type: "STATS_BOOST",
        value: 15,
        toStats: "effHit_",
        turns: 3,
      },
    },
  },
];
