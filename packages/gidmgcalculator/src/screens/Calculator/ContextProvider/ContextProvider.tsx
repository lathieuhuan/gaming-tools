import { CharacterDataProvider, PartyDataProvider } from "./DataProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizerStatusProvider } from "./OptimizerStatusProvider";

export function ContextProvider(props: { children: React.ReactElement }) {
  return (
    <CharacterDataProvider>
      <PartyDataProvider>
        <OptimizerStatusProvider>
          <ModalsProvider>{props.children}</ModalsProvider>
        </OptimizerStatusProvider>
      </PartyDataProvider>
    </CharacterDataProvider>
  );
}
