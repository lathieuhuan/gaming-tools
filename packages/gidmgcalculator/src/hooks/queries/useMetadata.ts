import { useLayoutEffect, useState } from "react";
import { $AppData } from "@Src/services";

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

  const getMetadata = async (isForcedRefetch?: boolean) => {
    if (state.status !== "loading") {
      setState({
        status: "loading",
      });
    }

    const error = await $AppData.fetchMetadata(isForcedRefetch);

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
    }
  };

  useLayoutEffect(() => {
    if (auto) {
      getMetadata();
    }
  }, []);

  return {
    ...state,
    refetch: getMetadata,
  };
}
