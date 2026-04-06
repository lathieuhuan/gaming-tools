import { cn } from "rond";
import { SetBonusConfiger } from "./SetBonusConfiger";
import { MainStatsConfiger } from "./MainStatsConfiger";

type ArtifactGeneratorProps = {
  className?: string;
};

export function ArtifactGenerator({ className }: ArtifactGeneratorProps) {
  return (
    <div className={cn(className, "space-y-6")}>
      <SetBonusConfiger />
      <MainStatsConfiger />
    </div>
  );
}
