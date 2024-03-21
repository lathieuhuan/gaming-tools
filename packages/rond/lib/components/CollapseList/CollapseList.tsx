import clsx, { ClassValue } from "clsx";
import { useState } from "react";
import { CollapseSpace } from "../CollapseSpace";
import "./CollapseList.styles.scss";

interface CollapseListProps {
  className?: ClassValue;
  bodyCls?: ClassValue;
  items: Array<{
    heading: React.ReactNode | ((expanded?: boolean) => React.ReactNode);
    body: React.ReactNode;
  }>;
}
export const CollapseList = (props: CollapseListProps) => {
  const [expanded, setExpanded] = useState<(boolean | undefined)[]>([]);

  return (
    <div className={clsx("ron-collapse-list", props.className)}>
      {props.items.map(({ heading, body }, i) => (
        <div key={i} className="ron-collapse-item">
          <div
            className={clsx(
              "ron-collapse-item-heading ron-glow-on-hover",
              expanded[i] && "ron-collapse-item-heading-active"
            )}
            onClick={() =>
              setExpanded((prev) => {
                const newEpd = [...prev];
                newEpd[i] = !newEpd[i];
                return newEpd;
              })
            }
          >
            {typeof heading === "function" ? heading(expanded[i]) : heading}
          </div>
          <CollapseSpace active={!!expanded[i]}>
            <div className={clsx("ron-collapse-item-body", props.bodyCls)}>{body}</div>
          </CollapseSpace>
        </div>
      ))}
    </div>
  );
};
