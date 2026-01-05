import { clsx, Radio } from "rond";

import type { Artifact } from "@/models/base";

import { useTranslation } from "@/hooks/useTranslation";
import { suffixOf } from "@/utils";

const STAT_CLS = "text-light-2 font-medium";

type ArtifactSummaryProps = {
  className?: string;
  /** Default "default" */
  variant?: "primary" | "default";
  label: React.ReactNode;
  artifact: Artifact;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

export function ArtifactSummary(props: ArtifactSummaryProps) {
  const { variant = "default", artifact } = props;

  return (
    <div className={clsx("px-3 py-2 rounded-md bg-dark-1 relative", props.className)}>
      <p
        className={
          variant === "primary" ? "text-primary-1 font-semibold" : "text-light-1 font-medium"
        }
      >
        {props.label}
      </p>
      <ArtifactSummaryContent artifact={artifact} />

      {props.selectable && (
        <div className="absolute top-4 right-4">
          <Radio size="medium" checked={props.selected} onChange={props.onSelect} />
        </div>
      )}
    </div>
  );
}

export function ArtifactSummaryContent({ artifact }: { artifact: Artifact }) {
  const { t } = useTranslation();

  const divider = <span className="text-dark-line">|</span>;

  return (
    <div>
      <p className="text-sm text-light-4">
        Lv. <span className={STAT_CLS}>{artifact.level}</span> {divider} {t(artifact.mainStatType)}{" "}
        +
        <span className={STAT_CLS}>
          {artifact.mainStatValue}
          {suffixOf(artifact.mainStatType)}
        </span>{" "}
        {divider} {artifact.rarity}-star
      </p>
      <div className="mt-1 text-xs text-light-4 flex flex-wrap gap-1">
        {artifact.subStats.map((subStat, index) => (
          <SubStat key={index} type={t(subStat.type)} value={subStat.value} />
        ))}
      </div>
    </div>
  );
}

function SubStat({ type, value }: { type: string; value: number }) {
  return (
    <span className="px-2 pt-2 pb-1 leading-none bg-dark-2 rounded">
      {type} +
      <span className={STAT_CLS}>
        {value}
        {suffixOf(type)}
      </span>
    </span>
  );
}
