import { AppArtifact } from "@/types";
import { __appArtifactMock } from "../utils/appArtifactMock";

export const ArtifactMock = {
  SETBONUS_OF_2: 1,
  SETBONUSES_OF_2_AND_4: 2,
  BUFFS_LV_0: 3,
  BUFFS_LV_1: 4,
} as const;

export const ARTIFACT_MOCKS: AppArtifact[] = [
  __appArtifactMock(ArtifactMock.SETBONUS_OF_2, {
    setBonuses: [
      {
        effects: [
          {
            value: 1000,
            target: { module: "ATTR", path: "hp" },
          },
        ],
      },
    ],
  }),
  __appArtifactMock(ArtifactMock.SETBONUSES_OF_2_AND_4, {
    setBonuses: [
      {
        effects: [
          {
            value: 100,
            target: { module: "ATTR", path: "atk" },
          },
        ],
      },
      {
        effects: [
          {
            value: 100,
            target: { module: "ATTR", path: "def" },
          },
        ],
      },
    ],
  }),
  __appArtifactMock(ArtifactMock.BUFFS_LV_0, {
    buffs: [
      {
        id: 1,
        affect: "SELF",
        description: "",
        bonusLv: 0,
        effects: [
          {
            value: 10,
            target: { module: "ATTR", path: "er_" },
          },
        ],
      },
    ],
  }),
  __appArtifactMock(ArtifactMock.BUFFS_LV_1, {
    buffs: [
      {
        id: 1,
        affect: "SELF",
        description: "",
        bonusLv: 0,
        effects: [
          {
            value: 10,
            target: { module: "ATTR", path: "cRate_" },
          },
        ],
      },
      {
        id: 2,
        affect: "SELF",
        description: "",
        bonusLv: 1,
        effects: [
          {
            value: 20,
            target: { module: "ATTR", path: "cDmg_" },
          },
        ],
      },
    ],
  }),
];
