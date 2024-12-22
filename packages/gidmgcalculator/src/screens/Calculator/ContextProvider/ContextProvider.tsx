import { CharacterDataProvider, PartyDataProvider } from "./DataProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizerProvider } from "./OptimizerProvider";

export function ContextProvider(props: { children: React.ReactElement }) {
  return (
    <CharacterDataProvider>
      <PartyDataProvider>
        <OptimizerProvider>
          <ModalsProvider>{props.children}</ModalsProvider>
        </OptimizerProvider>
      </PartyDataProvider>
    </CharacterDataProvider>
  );
}
