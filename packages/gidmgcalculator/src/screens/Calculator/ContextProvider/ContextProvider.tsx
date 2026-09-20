import { ReactNode } from "react";

import { SetupTransshiper } from "./SetupTransshiper";

export function ContextProvider(props: { children: ReactNode }) {
  return (
    <>
      {props.children}
      <SetupTransshiper />
    </>
  );
}
