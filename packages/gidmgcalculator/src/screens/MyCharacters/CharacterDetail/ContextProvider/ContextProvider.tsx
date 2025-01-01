import { DetailInfoProvider } from "./DetailInfoProvider";
import { DetailModalProvider } from "./DetailModalProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return (
    <DetailInfoProvider>
      <DetailModalProvider>{props.children}</DetailModalProvider>
    </DetailInfoProvider>
  );
}
