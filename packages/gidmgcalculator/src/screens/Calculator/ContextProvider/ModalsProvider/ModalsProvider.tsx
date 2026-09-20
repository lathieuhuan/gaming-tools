// Component
import { TargetConfig } from "./TargetConfig";

export function ModalsProvider(props: { children: React.ReactNode }) {
  return (
    <>
      {props.children}

      <TargetConfig />
    </>
  );
}
