import type { UserArtifactGear } from "./UserArtifactGear";
import type { UserWeapon } from "./UserWeapon";

import { CalcCharacter } from "../base";

export class UserCharacter extends CalcCharacter<UserWeapon, UserArtifactGear> {}
