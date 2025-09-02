import { CharacterInnateBuff } from "@Calculation";

export const cannedKnowledgeBuff: CharacterInnateBuff = {
  src: "Canned Knowledge",
  description: "Increases {Base ATK}#[k] by {3}#[v].",
  effects: {
    id: "1",
    checkInput: 1,
    value: 3,
    targets: { module: "ATTR", path: "base_atk" },
  },
};

export const skirksTrainingBuff: CharacterInnateBuff = {
  src: "Skirk's Training",
  description:
    "Increases {Base ATK}#[k] by {7}#[v], {Elemental Mastery}#[k] by {15}#[v], and {Base HP}#[k] by {50}#[v].",
  effects: [
    {
      id: "1",
      checkInput: { value: 1, inpIndex: 1 },
      value: 7,
      targets: { module: "ATTR", path: "base_atk" },
    },
    {
      id: "2",
      checkInput: { value: 1, inpIndex: 1 },
      value: 50,
      targets: { module: "ATTR", path: "base_hp" },
    },
    {
      id: "3",
      checkInput: { value: 1, inpIndex: 1 },
      value: 15,
      targets: { module: "ATTR", path: "em" },
    },
  ],
};
