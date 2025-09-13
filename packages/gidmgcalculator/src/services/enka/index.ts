import { IS_DEV_ENV } from "@/constants";
import { GOODArtifact, GOODCharacter, GOODWeapon } from "@/types/GOOD.types";

const baseUrl = IS_DEV_ENV ? "http://localhost:3001/enka" : "https://gidmgcalculator-backend.onrender.com/enka";

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

export async function getGenshinUser(uid: string): Promise<GenshinUserResponse> {
  const response = await fetch(`${baseUrl}/uid/${uid}`);

  if (response.ok) {
    return response.json();
  }

  throw new Error("Bad Request");
}
