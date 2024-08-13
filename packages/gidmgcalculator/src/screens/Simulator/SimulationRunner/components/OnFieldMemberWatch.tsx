import { useSelector } from "@Store/hooks";
import { selectOnFieldMember } from "@Store/simulator-slice";
import { clsx, type ClassValue } from "rond";

import { useActiveMember } from "@Simulator/ToolboxProvider";
import "./OnFieldMemberWatch.styles.scss";

interface OnFieldMemberWatchProps {
  className?: ClassValue;
  style?: React.CSSProperties;
  children: React.ReactNode;
}
export function OnFieldMemberWatch(props: OnFieldMemberWatchProps) {
  const activeMember = useActiveMember();
  const isOnField = useSelector(selectOnFieldMember) === activeMember?.data.code;

  return <div {...props} className={clsx(isOnField ? "member-on-field" : "member-off-field", props.className)} />;
}
