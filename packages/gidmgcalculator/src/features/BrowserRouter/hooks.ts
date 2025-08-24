import { useContext } from "react";
import { BrowserRouterContext, Router, SearchParams } from "./context";

export function useRouter<T = SearchParams>() {
  const router = useContext(BrowserRouterContext);
  return router as Router<T>;
}
