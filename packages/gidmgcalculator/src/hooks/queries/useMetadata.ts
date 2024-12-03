import { useEffect, useRef, useState } from "react";
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

class LastVersionCheck {
  private static get currentSec() {
    return Math.round(Date.now() / 1000);
  }
  static get secondsElapsed() {
    return LastVersionCheck.currentSec - +(localStorage.getItem("lastVersionCheckTime") ?? "");
  }
  static record = () => {
    localStorage.setItem("lastVersionCheckTime", `${LastVersionCheck.currentSec}`);
  };
  static remove = () => {
    localStorage.removeItem("lastVersionCheckTime");
  };
}

type State = {
  status: "loading" | "success" | "error" | "idle";
  error?: string;
  cooldown?: number;
};

export function useMetadata(args?: { auto?: boolean }) {
  const { auto = true } = args || {};

  const [state, setState] = useState<State>({
    status: auto ? "loading" : "idle",
  });
  // const channel = useRef<BroadcastChannel>();

  const getMetadata = async (isForcedRefetch?: boolean) => {
    const secondsElapsed = LastVersionCheck.secondsElapsed;

    if (secondsElapsed < COOLDOWN.UPGRADE) {
      setState({
        status: "error",
        error: MESSAGE,
        cooldown: COOLDOWN.UPGRADE - secondsElapsed,
      });
      return;
    }

    if (state.status !== "loading") {
      setState({
        status: "loading",
      });
    }

    const response = await $AppData.fetchMetadata(isForcedRefetch);

    switch (response.code) {
      case 200: {
        if (!response.data) return;
        const { data } = response;

        if (isValidVersion(data.version)) {
          LastVersionCheck.remove();
          setState({
            status: "success",
          });

          $AppCharacter.populate(data.characters);
          $AppWeapon.populate(data.weapons);
          $AppArtifact.populate(data.artifacts);
          return;
        }

        LastVersionCheck.record();
        setState({
          status: "error",
          error: MESSAGE,
          cooldown: COOLDOWN.UPGRADE,
        });
        return;
      }
      case 400: {
        return;
      }
      default:
        setState({
          status: "error",
          error: response.message,
          cooldown: COOLDOWN.NORMAL,
        });
    }
  };

  useEffect(() => {
    // channel.current = new BroadcastChannel("METADATA");

    // const onMessage = (e: MessageEvent) => {
    //   if (e.target === channel.current) {
    //     console.log("same");
    //   }
    //   console.log(e);
    // };

    // channel.current.addEventListener("message", onMessage);

    if (auto) {
      // channel.current.postMessage("gimme metadata");
      getMetadata();
    }

    // return () => {
    //   channel.current?.removeEventListener("message", onMessage);
    //   channel.current?.close();
    // };
  }, []);

  return {
    ...state,
    refetch: getMetadata,
  };
}
