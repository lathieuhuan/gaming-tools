import type { AppCharacter } from "@/types";
import { cn, type ClassValue } from "rond";

type EnhanceTagProps = {
  id?: string;
  className?: ClassValue;
  character: {
    enhanced: boolean;
    data: AppCharacter;
  };
  mutable?: boolean;
  onToggle?: () => void;
};

export function EnhanceTag(props: EnhanceTagProps) {
  const { enhanced, data } = props.character;

  return (
    <div
      id={props.id}
      className={cn(
        "text-base font-semibold leading-none",
        props.mutable && "cursor-pointer",
        props.className
      )}
      hidden={!data.enhanceType}
      onClick={props.mutable ? props.onToggle : undefined}
    >
      <p
        className={cn(
          "capitalize",
          enhanced ? `text-${data.vision}` : ["text-light-hint", props.mutable && "glow-on-hover"]
        )}
      >
        {data.enhanceType?.toLowerCase()}
      </p>
    </div>
  );
}
