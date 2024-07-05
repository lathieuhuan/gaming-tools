import { SimulationMember } from "@Src/types";

type ArtifactProps = NonNullable<SimulationMember["artifacts"][number]>;

export const team1: SimulationMember[] = [
  {
    name: "Albedo",
    level: "90/90",
    NAs: 1,
    ES: 1,
    EB: 1,
    cons: 6,
    weapon: {
      ID: 1717242701642,
      type: "sword",
      code: 140, // Key of Khaj-Nisut
      level: "90/90",
      refi: 1,
    },
    artifacts: makeArtifactSet(5), // Noblesse Oblige
  },
  {
    name: "Amber",
    level: "90/90",
    NAs: 1,
    ES: 1,
    EB: 1,
    cons: 6,
    weapon: {
      ID: 1717242701643,
      type: "bow",
      code: 9, // Elegy for the End
      level: "90/90",
      refi: 1,
    },
    artifacts: makeArtifactSet(1), // Emblem of Severed Fate
  },
  {
    name: "Kazuha",
    level: "90/90",
    NAs: 1,
    ES: 1,
    EB: 1,
    cons: 6,
    weapon: {
      ID: 1717242701644,
      type: "sword",
      code: 104, // Freedom-Sworn
      level: "90/90",
      refi: 1,
    },
    artifacts: makeArtifactSet(2), // Shimenawa's Reminiscence
  },
  {
    name: "Sucrose",
    level: "90/90",
    NAs: 1,
    ES: 1,
    EB: 1,
    cons: 6,
    weapon: {
      ID: 1717242701645,
      type: "sword",
      code: 29, // Thrilling Tales of Dragon Slayers
      level: "90/90",
      refi: 1,
    },
    artifacts: makeArtifactSet(14), // Wanderer's Troupe
  },
];

function makeArtifactSet(code: number, otherCode: number = code): SimulationMember["artifacts"] {
  const artifactProps: Pick<ArtifactProps, "level" | "rarity" | "subStats"> = {
    level: 20,
    rarity: 5,
    subStats: [],
  };

  return [
    {
      code,
      ID: 1,
      type: "flower",
      mainStatType: "hp",
      ...artifactProps,
    },
    {
      code,
      ID: 2,
      type: "plume",
      mainStatType: "atk",
      ...artifactProps,
    },
    {
      code: otherCode,
      ID: 3,
      type: "sands",
      mainStatType: "atk_",
      ...artifactProps,
    },
    {
      code: otherCode,
      ID: 4,
      type: "goblet",
      mainStatType: "phys",
      ...artifactProps,
    },
  ];
}
