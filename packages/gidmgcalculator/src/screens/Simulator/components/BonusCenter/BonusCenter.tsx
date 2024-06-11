import { getActiveMember } from "@Simulator/Simulator.utils";
import { useSelector } from "@Store/hooks";
import { RootState } from "@Store/store";

const selectBonuses = (state: RootState) => {
  const member = getActiveMember(state);
  return [member?.attributeBonus ?? [], member?.attackBonus ?? []] as const;
};

export function BonusCenter(props: { className?: string }) {
  const [attributeBonus, attackBonus] = useSelector(selectBonuses);

  return (
    <div className={props.className}>
      {attributeBonus.map((bonus) => {
        const key = `${bonus.trigger.character}-${bonus.trigger.modId}-${bonus.toStat}`;

        return <div key={key}>

        </div>;
      })}
    </div>
  );
}

/**
 * modify event => attribute bonus => attribute   => hit config => hit event
 *              => attack bonus    => attackBonus
 */