import { MAX_USER_ARTIFACTS, MAX_USER_WEAPONS } from "@/constants/config";
import { useStore } from "@/lib/dynamic-store";
import { RawCharacter } from "@/types";

type AddCharacterError = {
  code: "ALREADY_EXISTS";
  message: string;
};

type AddWeaponError = {
  code: "LIMIT_EXCEEDED";
  message: string;
};

type AddArtifactError = {
  code: "LIMIT_EXCEEDED";
  message: string;
};

export function useStoreCheck() {
  const store = useStore();

  const isAbleToAddCharacter = (character: RawCharacter): AddCharacterError | null => {
    const existed = store
      .select((state) => state.userdb.userChars)
      .some((c) => c.code === character.code);

    if (existed) {
      return null;
    }

    return { code: "ALREADY_EXISTS", message: "Character already exists." };
  };

  const isAbleToAddWeapon = (quantity = 1): AddWeaponError | null => {
    const exceeded =
      store.select((state) => state.userdb.userWps).length + quantity <= MAX_USER_WEAPONS;

    if (exceeded) {
      return null;
    }

    return {
      code: "LIMIT_EXCEEDED",
      message: "The maximum number of stored weapons has been reached.",
    };
  };

  const isAbleToAddArtifact = (quantity = 1): AddArtifactError | null => {
    const exceeded =
      store.select((state) => state.userdb.userArts).length + quantity <= MAX_USER_ARTIFACTS;

    if (exceeded) {
      return null;
    }

    return {
      code: "LIMIT_EXCEEDED",
      message: "The maximum number of stored artifacts has been reached.",
    };
  };

  return {
    store,
    isAbleToAddCharacter,
    isAbleToAddWeapon,
    isAbleToAddArtifact,
  };
}
