import { CharacterDataProvider } from "./CharacterDataProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizerProvider } from "./OptimizerProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <CharacterDataProvider>
      <OptimizerProvider>
        <ModalsProvider>{props.children}</ModalsProvider>
      </OptimizerProvider>
    </CharacterDataProvider>
  );
}
