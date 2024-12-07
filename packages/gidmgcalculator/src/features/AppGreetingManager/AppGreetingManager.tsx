import { useLayoutEffect, useRef, useState } from "react";

import { useMetadata } from "@Src/hooks";
import { $AppCharacter, $AppData, $AppSettings } from "@Src/services";
import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { GreeterService } from "./GreeterService";

const useGreeter = () => {
  const ref = useRef<GreeterService>();
  if (!ref.current) {
    ref.current = new GreeterService($AppData);
  }
  return ref.current;
};

type State = {
  status: "loading" | "success" | "error";
  error?: string;
  cooldown?: number;
};

export const AppGreetingManager = () => {
  const dispatch = useDispatch();

  const [state, setState] = useState<State>({
    status: "loading",
  });
  const isConfiged = useRef(false);
  const greeter = useGreeter();

  if (!isConfiged.current) {
    $AppCharacter.changeTraveler($AppSettings.get("traveler"));
    isConfiged.current = true;
  }

  const getMetadata = async (isForcedRefetch?: boolean) => {
    if (state.status !== "loading") {
      setState({
        status: "loading",
      });
    }

    const error = await greeter.fetchMetadata(isForcedRefetch);

    if (error) {
      setState({
        status: "error",
        error: error.message,
        cooldown: error.cooldown,
      });
    } else {
      setState({
        status: "success",
      });
      dispatch(updateUI({ ready: true }));
    }
  };

  useLayoutEffect(() => {
    //
    console.log("useLayoutEffect", greeter.isFirstInShift);

    getMetadata();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ($AppSettings.get("askBeforeUnload")) {
        e.preventDefault();
        return (e.returnValue = "Are you sure you want to exit?");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });

    return () => {
      greeter.endShift();
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
    };
  }, []);

  return null;
};
