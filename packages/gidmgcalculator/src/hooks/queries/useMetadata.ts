import { useEffect, useState } from "react";
import { $AppArtifact, $AppCharacter, $AppData, $AppWeapon } from "@Src/services";
import { MINIMUM_SYSTEM_VERSION } from "@Src/constants";

const MESSAGE = "The system is being upgraded.";
const COOLDOWN = {
  NORMAL: 30,
  UPGRADE: 300,
};

function isValidVersion(version: string) {
  const versionFrags = version.split(".");
  const minVersionFrags = MINIMUM_SYSTEM_VERSION.split(".");
  return versionFrags.every((frag, i) => +frag >= +minVersionFrags[i]);
}

const currentSec = () => Math.round(Date.now() / 1000);

const lastTryCtrl = {
  getSecElapsed: () => {
    return currentSec() - +(localStorage.getItem("lastVersionCheckTime") ?? "");
  },
  record: () => {
    localStorage.setItem("lastVersionCheckTime", `${currentSec()}`);
  },
  remove: () => {
    localStorage.removeItem("lastVersionCheckTime");
  },
};

type Args = {
  auto?: boolean;
};

type State = {
  status: "loading" | "success" | "error" | "idle";
  error?: string;
  cooldown?: number;
};

export function useMetadata(args?: Args) {
  const { auto = true } = args || {};

  const [state, setState] = useState<State>({
    status: auto ? "loading" : "idle",
  });

  const getMetadata = async (isForcedRefetch?: boolean) => {
    const secElapsed = lastTryCtrl.getSecElapsed();

    if (secElapsed < COOLDOWN.UPGRADE) {
      setState({
        status: "error",
        error: MESSAGE,
        cooldown: COOLDOWN.UPGRADE - secElapsed,
      });

      return;
    }

    if (state.status !== "loading") {
      setState({
        status: "loading",
      });
    }

    const res = await $AppData.fetchMetadata((data) => {
      if (isValidVersion(data.version)) {
        $AppCharacter.populate(data.characters);
        $AppWeapon.populate(data.weapons);
        $AppArtifact.populate(data.artifacts);
      } else {
        lastTryCtrl.record();
        throw "OLD_SYSTEM_VERSION";
      }
    }, isForcedRefetch);

    if (res.isOk) {
      setState({
        status: "success",
      });
      lastTryCtrl.remove();
    } else {
      if (res.message === "OLD_SYSTEM_VERSION") {
        setState({
          status: "error",
          error: MESSAGE,
          cooldown: COOLDOWN.UPGRADE,
        });
      } else {
        setState({
          status: "error",
          error: res.message,
          cooldown: COOLDOWN.NORMAL,
        });
      }
    }
  };

  useEffect(() => {
    if (auto) {
      getMetadata();
    }
  }, []);

  return {
    ...state,
    refetch: getMetadata,
  };
}
