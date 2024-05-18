import clsx, { ClassValue } from "clsx";
import { useState } from "react";
import { CollapseSpace } from "../CollapseSpace";
import "./CollapseList.styles.scss";

export interface CollapseListProps {
  className?: ClassValue;
  bodyCls?: ClassValue;
  items: Array<{
    title?: string;
    heading: React.ReactNode | ((expanded?: boolean) => React.ReactNode);
    body: React.ReactNode;
  }>;
}
export const CollapseList = (props: CollapseListProps) => {
  const [expanded, setExpanded] = useState<(boolean | undefined)[]>([]);

  return (
    <div className={clsx("ron-collapse-list", props.className)}>
      {props.items.map(({ title, heading, body }, i) => {
        const active = !!expanded[i];

        return (
          <div key={i} className="ron-collapse-item">
            <div
              className={clsx(
                "ron-collapse-item__heading ron-glow-on-hover",
                expanded[i] && "ron-collapse-item__heading--active"
              )}
              onClick={() =>
                setExpanded((prev) => {
                  const newEpd = [...prev];
                  newEpd[i] = !newEpd[i];
                  return newEpd;
                })
              }
              title={title}
              role="button"
              aria-expanded={active}
            >
              {typeof heading === "function" ? heading(expanded[i]) : heading}
            </div>
            <CollapseSpace active={active}>
              <div className={clsx("ron-collapse-item__body", props.bodyCls)}>{body}</div>
            </CollapseSpace>
          </div>
        );
      })}
    </div>
  );
};
