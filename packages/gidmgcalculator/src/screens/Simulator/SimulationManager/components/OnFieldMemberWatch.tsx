import { useSelector } from "@Store/hooks";
import { selectOnFieldMember } from "@Store/simulator-slice";
import { ClassValue, clsx } from "rond";

import { useActiveMember } from "@Simulator/ToolboxProvider";
import "./OnFieldMemberWatch.styles.scss";

interface OnFieldMemberWatchProps {
  className?: ClassValue;
  children: React.ReactNode;
}
export function OnFieldMemberWatch(props: OnFieldMemberWatchProps) {
  const activeMember = useActiveMember();
  const isOnField = useSelector(selectOnFieldMember) === activeMember?.data.code;

  return (
    <div className={clsx(isOnField ? "member-on-field" : "member-off-field", props.className)}>{props.children}</div>
  );
}
