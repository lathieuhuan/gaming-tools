import { useEffect, useRef, useState } from "react";
import { StandardResponse } from "@Src/services";

type State<K, T> = {
  queryKey: K;
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

  const state = useRef<State<TQueryKey, TData>>({
    queryKey: [] as unknown as TQueryKey,
    status: "idle",
    error: null,
    data: null,
    mounted: true,
  });
  const [, setCount] = useState(0);

  useEffect(() => {
    return () => {
      state.current.mounted = false;
    };
  }, []);

  const render = () => {
    setCount((n) => n + 1);
  };

  const getData = async (queryKey: TQueryKey) => {
    const response = await fetchData(queryKey);

    // Still mounted & not stale
    if (state.current.mounted && isSameQueryKey(queryKey, state.current.queryKey)) {
      console.log(queryKey, response);

      if (response.code === 200) {
        state.current = {
          ...state.current,
          status: "success",
          error: null,
          data: response.data,
        };
      } else {
        state.current = {
          ...state.current,
          status: "error",
          error: response.message || null,
          data: null,
        };
      }
      render();
    }
  };

  if (auto && !isSameQueryKey(queryKey, state.current.queryKey)) {
    state.current.queryKey = queryKey;
    state.current.status = "loading";

    getData(queryKey);
    render();
  }

  const { status } = state.current;

  return {
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    error: state.current.error,
    data: state.current.data,
  };
}
