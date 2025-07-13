import { TeamDataProvider } from "./TeamDataProvider";
import { ModalsProvider } from "./ModalsProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <TeamDataProvider>
      <ModalsProvider>{props.children}</ModalsProvider>
    </TeamDataProvider>
  );
}
