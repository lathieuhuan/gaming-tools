import { AppLightCone } from "@Backend";

export const purpleLightCones: AppLightCone[] = [
  {
    id: 21,
    name: "A Secret Vow",
    rarity: 4,
    path: "destruction",
    statsScale: [48, 21, 12],
    passiveName: "Spare No Effort",
    description:
      "Increases DMG dealt by the wearer by 20~40%. The wearer also deals an extra 20~40% of DMG to enemies whose current HP percentage is equal to or higher than the wearer's current HP percentage.",
    bonuses: [
      {
        type: "ATK_TYPES",
        value: 15,
        toTypes: "ALL",
      },
      {
        type: "ATK_TYPES",
        checkTargetHp: {
          type: "COMPARE_HP",
          compare: ">=",
        },
        value: 15,
        toTypes: "ALL",
      },
    ],
  },
  {
    id: 22,
    name: "After the Charmony Fall",
    rarity: 4,
    path: "erudition",
    statsScale: [38, 21, 18],
    passiveName: "Quiescence",
    description:
      "Increases the wearer's Break Effect by 28~56%. After the wearer uses Ultimate, increases SPD by 8~16%, lasting for 2 turn(s).",
    bonuses: {
      type: "STATS",
      value: 21,
      toStats: "break_",
    },
    abilities: {
      trigger: {
        type: "ULTIMATE_CAST",
        checkSource: "SELF",
      },
      effects: {
        type: "STATS_BOOST",
        value: 6,
        toStats: "spd_",
        turns: 2,
      },
    },
  },
  {
    id: 23,
    name: "Before the Tutorial Mission Starts",
    rarity: 4,
    path: "nihility",
    statsScale: [43, 21, 15],
    passiveName: "Quick on the Draw",
    description:
      "Increases the wearer's Effect Hit Rate by 20~40%. When the wearer attacks DEF-reduced enemies, regenerates 4~8 Energy.",
    bonuses: {
      type: "STATS",
      value: 15,
      toStats: "effHit_",
    },
    abilities: {
      trigger: {
        type: "ATTACK",
        checkStatuses: "DEF-REDUCED",
      },
      effects: {
        type: "REPLENISH",
        value: 3,
      },
    },
  },
  {
    id: 24,
    name: "Boundless Choreo",
    rarity: 4,
    path: "nihility",
    statsScale: [43, 21, 15],
    passiveName: "Scrutinize",
    description:
      "Increase the wearer's CRIT Rate by 8~16%. The wearer deals 24~48% more CRIT DMG to enemies that are currently Slowed or have reduced DEF.",
    bonuses: {
      type: "STATS",
      value: 6,
      toStats: "cRate_",
    },
    abilities: {
      trigger: {
        type: "ATTACK",
        checkStatuses: ["SLOWED", "DEF-REDUCED"],
      },
      effects: {
        type: "ATK_ENHANCE",
        value: 21,
        toTypes: "ALL",
        toAspect: "cDmg_",
      },
    },
  },
  {
    id: 25,
    name: "Carve the Moon, Weave the Clouds",
    rarity: 4,
    path: "harmony",
    statsScale: [43, 21, 15],
    passiveName: "Secret",
    description:
      "At the start of the battle and whenever the wearer's turn begins, one of the following effects is applied randomly: All allies' ATK increases by 10~20%, all allies' CRIT DMG increases by 12~24%, or all allies' Energy Regeneration Rate increases by 6~12%. The applied effect cannot be identical to the last effect applied, and will replace the previous effect. The applied effect will be removed when the wearer has been knocked down. Effects of the same type cannot be stacked.",
  },
];
