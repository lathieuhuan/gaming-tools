import { ModalProvider } from "./ModalProvider";

export function ContextProvider(props: { children: React.ReactNode }) {
  return <ModalProvider>{props.children}</ModalProvider>;
}
