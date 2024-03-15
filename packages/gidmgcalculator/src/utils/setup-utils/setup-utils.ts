import type { CalcSetupManageInfo, UserComplexSetup, UserSetup } from "@Src/types";

function destructName(name: string) {
  const lastWord = name.match(/\s+\(([1-9]+)\)$/);

  if (lastWord?.index && lastWord[1]) {
    return {
      nameRoot: name.slice(0, lastWord.index),
      copyNo: lastWord[1],
    };
  }
  return {
    nameRoot: name,
    copyNo: null,
  };
}

class SetupUtils {
  static isUserSetup(setup: UserSetup | UserComplexSetup): setup is UserSetup {
    return ["original", "combined"].includes(setup.type);
  }

  static getCopyName(originalName: string, existedNames: string[]) {
    const { nameRoot } = destructName(originalName);
    const versions = [];

    for (const existedName of existedNames) {
      const destructed = destructName(existedName);

      if (destructed.nameRoot === nameRoot && destructed.copyNo) {
        versions[+destructed.copyNo] = true;
      }
    }
    for (let i = 1; i <= 100; i++) {
      if (!versions[i]) {
        return nameRoot + ` (${i})`;
      }
    }

    return undefined;
  }

  static getManageInfo(defaultInfo: Partial<CalcSetupManageInfo>): CalcSetupManageInfo {
    const { name = "Setup 1", ID = Date.now(), type = "original" } = defaultInfo;
    return { name: name.trim(), ID, type };
  }
}

export default SetupUtils;
