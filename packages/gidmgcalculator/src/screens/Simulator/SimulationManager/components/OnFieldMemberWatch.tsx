import { useSelector } from "@Store/hooks";
import { selectOnFieldMember } from "@Store/simulator-slice";
import { ClassValue, clsx } from "rond";

import "./OnFieldMemberWatch.styles.scss";

interface OnFieldMemberWatchProps {
  className?: ClassValue;
  activeMemberCode?: number;
  children: React.ReactNode;
}
export function OnFieldMemberWatch(props: OnFieldMemberWatchProps) {
  const isOnField = useSelector(selectOnFieldMember) === props.activeMemberCode;
  return (
    <div className={clsx(isOnField ? "member-on-field" : "member-off-field", props.className)}>{props.children}</div>
  );
}
