import clsx, { ClassValue } from "clsx";
import { useState } from "react";

import { cn } from "@lib/utils";
import { CollapseSpace } from "../CollapseSpace";

export type CollapseListProps = {
  className?: string;
  bodyCls?: ClassValue;
  items: Array<{
    title?: string;
    heading: React.ReactNode | ((expanded?: boolean) => React.ReactNode);
    body: React.ReactNode;
  }>;
};

export const CollapseList = (props: CollapseListProps) => {
  const [expanded, setExpanded] = useState<(boolean | undefined)[]>([]);

  return (
    <div className={props.className}>
      {props.items.map(({ title, heading, body }, i) => {
        const active = !!expanded[i];

        return (
          <div key={i} className="mb-3">
            <div
              className={clsx(
                "pt-1 px-6 pb-0 font-semibold leading-[1.625] cursor-pointer transition-all duration-200 glow-on-hover",
                "text-light-2 bg-dark-3 aria-expanded:text-black aria-expanded:bg-primary-2"
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
              <div className={cn("pt-2 pr-4 pl-2", props.bodyCls)}>{body}</div>
            </CollapseSpace>
          </div>
        );
      })}
    </div>
  );
};
