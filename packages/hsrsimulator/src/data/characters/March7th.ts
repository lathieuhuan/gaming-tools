import { AppCharacter } from "@Backend";

const March7th: AppCharacter = {
  id: 2,
  name: "March 7th",
  icon: "",
  rarity: 4,
  maxEnergy: 120,
  stats: [
    [69.6, 78, 144, 101],
    [69.6, 78, 144, 101],
  ],
  basic: {
    name: "Frigid Cold Arrow",
    target: {
      type: "ENEMY",
      scope: "SINGLE",
    },
    energyRestore: 20,
    effects: {
      id: 1,
      type: "ATTACK",
      toughReduce: 10,
      multiplier: 50,
    },
  },
  skill: {
    name: "The Power of Cuteness",
    target: {
      type: "ALLY",
      scope: "SINGLE",
    },
    energyRestore: 30,
    effects: {
      id: 1,
      type: "SHIELD",
      multiplier: {
        value: 38,
        baseOn: "def",
      },
      extra: 190,
      turns: 3,
    },
  },
  ultimate: {
    name: "Glacial Cascade",
    target: {
      type: "ENEMY",
      scope: "PARTY",
    },
    energyRestore: 5,
    effects: [
      {
        id: 1,
        type: "ATTACK",
        toughReduce: 20,
        multiplier: 90,
      },
      {
        id: 2,
        type: "FREEZE",
        dot: 30,
        chance: 50,
        turns: 1,
      },
    ],
  },
  talent: {
    name: "Girl Power",
    effects: {
      id: 1,
      type: "ATTACK",
      multiplier: 50,
    },
    maxTriggersPerTurn: 2,
  },
  technique: {
    name: "Freezing Beauty",
    target: {
      type: "ENEMY",
      scope: "SINGLE",
    },
    effects: {
      id: 1,
      type: "FREEZE",
      dot: 50,
      chance: 100,
      turns: 1,
    },
  },
  traces: [
    {
      name: "DMG Boost: Ice",
      description: "Ice DMG increases by 3.2%",
      effects: {
        type: "DMG_BOOST",
        value: 3.2,
      },
    },
  ],
};

export default March7th;
