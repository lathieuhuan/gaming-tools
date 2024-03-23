import { useEffect, useRef, useState } from "react";
import { StandardResponse } from "@Src/services";

type QueryKey = string | number;

type State<T> = {
  queryKey: QueryKey;
  mounted: boolean;
  status: "loading" | "error" | "success" | "";
  data: T | null;
};

export function useQuery<T>(queryKey: QueryKey, fetchData: () => StandardResponse<T>, options?: { auto: boolean }) {
  const { auto = true } = options || {};

  const state = useRef<State<T>>({
    queryKey: "",
    status: "",
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

  const getData = async (queryKey: QueryKey) => {
    const response = await fetchData();

    if (state.current.mounted && queryKey === state.current.queryKey) {
      if (response.code === 200) {
        state.current.status = "success";
        state.current.data = response.data;
      } else {
        state.current.status = "error";
      }
      render();
    }
  };

  if (auto && queryKey && queryKey !== state.current.queryKey) {
    state.current.queryKey = queryKey;
    state.current.status = "loading";

    getData(queryKey);
    render();
  }

  const { status, data } = state.current;

  return {
    isLoading: status === "loading",
    isError: status === "error",
    isSuccess: status === "success",
    data,
  };
}
