import { useEffect, useRef, useState } from "react";
import { StandardResponse } from "@Src/services";

type State<T> = {
  status: "loading" | "error" | "success" | "idle";
  error: string | null;
  data: T | null;
  mounted: boolean;
};

function isSameQueryKey<TKeyArray extends ReadonlyArray<unknown>>(key1: TKeyArray, key2: TKeyArray) {
  return key1.length === key2.length && key1.every((frag, i) => frag === key2[i]);
}

export function useQuery<TQueryKey extends ReadonlyArray<string | number>, TData = unknown>(
  queryKey: TQueryKey,
  fetchData: (queryKey: TQueryKey) => StandardResponse<TData>,
  options?: { auto: boolean }
) {
  const { auto = true } = options || {};

  const vars = useRef({
    mounted: true,
    queryKey: [] as unknown as TQueryKey,
  });
  const [state, setState] = useState<State<TData>>({
    status: "idle",
    error: null,
    data: null,
    mounted: true,
  });

  useEffect(() => {
    return () => {
      vars.current.mounted = false;
    };
  }, []);

  const getData = async (queryKey: TQueryKey) => {
    const response = await fetchData(queryKey);

    // Still mounted & not stale
    if (vars.current.mounted && isSameQueryKey(queryKey, vars.current.queryKey)) {
      if (response.code === 200) {
        setState((prevState) => ({
          ...prevState,
          status: "success",
          error: null,
          data: response.data,
        }));
      } else {
        setState((prevState) => ({
          ...prevState,
          status: "error",
          error: response.message || null,
          data: null,
        }));
      }
    }
  };

  useEffect(() => {
    if (auto) {
      vars.current.queryKey = queryKey;

      setState((prevState) => ({
        ...prevState,
        status: "loading",
        error: null,
      }));

      getData(queryKey);
    }
  }, [auto, ...queryKey]);

  return {
    isLoading: state.status === "loading",
    isError: state.status === "error",
    isSuccess: state.status === "success",
    error: state.error,
    data: state.data,
  };
}
