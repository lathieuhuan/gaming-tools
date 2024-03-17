import { useRef, useState, useEffect } from "react";
import { $AppCharacter } from "@Src/services";
import { AppCharacter } from "@Src/types";
import { getAppDataError } from "@Src/utils";

type Status = "loading" | "error" | "success";

type State = {
  data: AppCharacter | null;
  dataOf: string;
  fetchingFor?: string;
  unsubscriber?: () => void;
  status: Status | "";
  error: string | null;
};

export const useAppCharacter = (name?: string) => {
  const state = useRef<State>({
    data: null,
    dataOf: "",
    fetchingFor: "",
    status: "",
    error: null,
    // mounted: true,
  });
  const [boo, setBoo] = useState(false);
  state.current.fetchingFor = name;

  useEffect(() => {
    return () => {
      state.current.unsubscriber?.();
    };
  }, []);

  const render = () => {
    setBoo(!boo);
  };

  const onSuccess = (data: AppCharacter) => {
    state.current.status = "success";
    state.current.data = data;
    state.current.error = null;
    state.current.unsubscriber = undefined;
  };

  const onFetching = () => {
    state.current.status = "loading";
    state.current.data = null;
    state.current.fetchingFor = name;
  };

  const fetchData = async (charName: string) => {
    const response = await $AppCharacter.fetch(charName);

    if (name !== state.current.fetchingFor) {
      // response is stale (name is old)
      return;
    }

    if (response.code === 200 && response.data) {
      onSuccess(response.data);
    } else {
      state.current.status = "error";
      state.current.error = getAppDataError("character", response.code);
    }
    render();
  };

  if (name && state.current.dataOf !== name) {
    state.current.dataOf = name;
    state.current.unsubscriber?.();

    switch ($AppCharacter.getStatus(name)) {
      case "fetched":
        onSuccess($AppCharacter.get(name));
        break;
      case "fetching":
        onFetching();

        state.current.unsubscriber = $AppCharacter.subscribe(name, (data) => {
          if (data.name === state.current.fetchingFor) {
            onSuccess(data);
          }
        });
        break;
      case "unfetched":
        onFetching();
        fetchData(name);
        break;
      default:
    }
  }

  const { status } = state.current;

  return {
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    error: state.current.error,
    appChar: state.current.data,
  };
};
