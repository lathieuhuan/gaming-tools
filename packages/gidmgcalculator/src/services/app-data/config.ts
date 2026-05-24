import type { CharacterInnateBuff, ElementType, BonusSpec } from "@/types";

export const NO_DESCRIPTION_MSG = "[Description missing]";

export const RESONATED_ELEMENTS: ElementType[] = [
  "anemo",
  "geo",
  "electro",
  "dendro",
  "hydro",
  "pyro",
  "cryo",
];

export const cannedKnowledgeBuff: CharacterInnateBuff = {
  src: "Canned Knowledge",
  description: "Increases {Base ATK}#[k] by {3}#[v].",
  effects: {
    id: "1",
    value: 3,
    target: { module: "ATTR", path: "base_atk" },
  },
};

export const skirksTrainingBuff: CharacterInnateBuff = {
  src: "Skirk's Training",
  description:
    "Increases {Base ATK}#[k] by {7}#[v], {Elemental Mastery}#[k] by {15}#[v], and {Base HP}#[k] by {50}#[v].",
  effects: [
    {
      id: "1",
      value: 7,
      target: { module: "ATTR", path: "base_atk" },
    },
    {
      id: "2",
      value: 50,
      target: { module: "ATTR", path: "base_hp" },
    },
    {
      id: "3",
      value: 15,
      target: { module: "ATTR", path: "em" },
    },
  ],
};

type ResonatedElmtBuff = {
  src: string;
  description: string;
  items: Record<
    ElementType,
    {
      description: string;
      effects: BonusSpec;
    }
  >;
};

export const resonatedElmtsBuff: ResonatedElmtBuff = {
  src: "Resonated Elements",
  description: `Gains an attribute bonus for every resonated element.`,
  items: {
    anemo: {
      description: "Anemo: {CRIT Rate}#[k] +{10%}#[v].",
      effects: {
        id: "1",
        value: 10,
        target: { module: "ATTR", path: "cRate_" },
      },
    },
    geo: {
      description: "Geo: {DEF}#[k] +{20%}#[v].",
      effects: {
        id: "2",
        value: 20,
        target: { module: "ATTR", path: "def" },
      },
    },
    electro: {
      description: "Electro: {Energy Recharge}#[k] +{20%}#[v].",
      effects: {
        id: "3",
        value: 20,
        target: { module: "ATTR", path: "er_" },
      },
    },
    dendro: {
      description: "Dendro: {Elemental Mastery}#[k] +{60}#[v].",
      effects: {
        id: "4",
        value: 60,
        target: { module: "ATTR", path: "em" },
      },
    },
    hydro: {
      description: "Hydro: {HP}#[k] +{20%}#[v].",
      effects: {
        id: "5",
        value: 20,
        target: { module: "ATTR", path: "hp_" },
      },
    },
    pyro: {
      description: "Pyro: {ATK}#[k] +{20%}#[v].",
      effects: {
        id: "6",
        value: 20,
        target: { module: "ATTR", path: "atk_" },
      },
    },
    cryo: {
      description: "Cryo: {CRIT DMG}#[k] +{20%}#[v].",
      effects: {
        id: "7",
        value: 20,
        target: { module: "ATTR", path: "cDmg_" },
      },
    },
  },
};

export function buildResonatedElmtsBuff(resonatedElmts: ElementType[]): CharacterInnateBuff {
  let finalDesc = resonatedElmtsBuff.description;
  const finalEffects: CharacterInnateBuff["effects"] = [];

  for (const elmt of RESONATED_ELEMENTS) {
    const activated = resonatedElmts.includes(elmt);
    const { description, effects } = resonatedElmtsBuff.items[elmt];
    const decorDesc = `<span class="${activated ? "" : "opacity-50"}">• ${description}</span>`;

    finalDesc = `${finalDesc}<br />${decorDesc}`;
    activated && finalEffects.push(effects);
  }

  return {
    src: resonatedElmtsBuff.src,
    description: finalDesc,
    effects: finalEffects,
  };
}
