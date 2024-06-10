import { configTalentEvent } from "@Backend";
import { useTranslation } from "@Src/hooks";

interface TalentAttackEventProps {
  config: ReturnType<typeof configTalentEvent>;
}

export function TalentAttackEvent({ config }: TalentAttackEventProps) {
  const { t } = useTranslation();

  console.log("render: TalentAttackEvent");

  if (!config) {
    return <div>This attack is not available.</div>;
  }

  return (
    <div>
      <div className="text-sm text-secondary-1">
        {t(`${config.attElmt}_attElmt`)} / {t(config.attPatt)} DMG
      </div>
      <div>
        {Array.isArray(config.damage) ? config.damage.map((d) => Math.round(d)).join(" + ") : Math.round(config.damage)}
      </div>
    </div>
  );
}
