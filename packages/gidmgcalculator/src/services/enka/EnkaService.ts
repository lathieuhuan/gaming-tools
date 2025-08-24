import { IS_DEV_ENV } from "@Src/constants";
import { GOODArtifact, GOODCharacter, GOODWeapon } from "@Src/types/GOOD.types";

type GOODBuild = {
  name?: string;
  character: GOODCharacter;
  weapon: GOODWeapon;
  artifacts: GOODArtifact[];
};

export type GenshinUserResponse = {
  name: string;
  level: number;
  signature: string;
  builds: GOODBuild[];
};

export class EnkaService {
  static readonly baseUrl = IS_DEV_ENV
    ? "http://localhost:3001/enka"
    : "https://gidmgcalculator-backend.onrender.com/enka";

  static readonly genshinUserUrl = (uid: string) => `${EnkaService.baseUrl}/uid/${uid}`;

  async fetchGenshinUser(uid: string): Promise<GenshinUserResponse> {
    const response = await fetch(EnkaService.genshinUserUrl(uid));

    if (response.ok) {
      return response.json();
    }

    throw new Error("Bad Request");
  }
}
