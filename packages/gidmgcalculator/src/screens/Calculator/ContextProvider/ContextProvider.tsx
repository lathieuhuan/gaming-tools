import { CharacterRecordProvider } from "./CharacterRecordProvider";
import { ModalsProvider } from "./ModalsProvider";
import { OptimizerProvider } from "./OptimizerProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <CharacterRecordProvider>
      <OptimizerProvider>
        <ModalsProvider>{props.children}</ModalsProvider>
      </OptimizerProvider>
    </CharacterRecordProvider>
  );
}
