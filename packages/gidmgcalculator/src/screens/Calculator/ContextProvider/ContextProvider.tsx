import { CharacterDataProvider, PartyDataProvider } from "./DataProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizationStateProvider } from "./OptimizationStateProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <CharacterDataProvider>
      <PartyDataProvider>
        <OptimizationStateProvider>
          <ModalsProvider>{props.children}</ModalsProvider>
        </OptimizationStateProvider>
      </PartyDataProvider>
    </CharacterDataProvider>
  );
}
