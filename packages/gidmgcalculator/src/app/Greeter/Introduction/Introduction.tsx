import { clsx, CollapseList, LoadingSpin, Skeleton } from "rond";

import type { AppMetadata } from "../types";
import { About, Credits, Notes, VersionRecap } from "./collapsible-sections";

type IntroductionProps = {
  className?: string;
  metadata?: AppMetadata;
  loading?: boolean;
};

export const Introduction = ({
  className,
  metadata = {
    version: "",
    updates: [],
    supporters: [],
  },
  loading,
}: IntroductionProps) => {
  const { updates, supporters } = metadata;
  const latestDate: string | undefined = updates[0]?.date;

  const typeToCls: Record<string, string> = {
    e: "text-primary-1",
    u: "text-danger-2",
    f: "text-bonus",
  };

  const parseContent = (content: string) => {
    return content.replace(/\{[a-zA-Z0-9ã _'"-]+\}#\[[euf]\]/g, (match) => {
      const [bodyPart, typePart = ""] = match.split("#");
      const body = bodyPart.slice(1, -1);
      const type = typePart?.slice(1, -1);
      return `<span class="${typeToCls[type] || ""}">${body}</span>`;
    });
  };

  return (
    <div className={clsx("custom-scrollbar", className)}>
      <CollapseList
        items={[
          {
            heading: (expanded) => (
              <div className="flex items-center space-x-2">
                <span>Updates</span>

                {!expanded ? (
                  loading ? (
                    <Skeleton className="w-28 h-4 rounded" />
                  ) : latestDate ? (
                    <span className="ml-2 px-1 text-sm rounded text-heading bg-dark-1">
                      {latestDate}
                    </span>
                  ) : null
                ) : null}
              </div>
            ),
            body: (
              <div className="space-y-2 contains-inline-svg">
                {loading ? (
                  <div className="h-20 flex-center">
                    <LoadingSpin size="large" />
                  </div>
                ) : updates.length ? (
                  updates.map(({ date, patch, content }, i) => (
                    <div key={i}>
                      <p className="text-heading font-semibold">
                        {date + (patch ? ` (v${patch})` : "")}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {content.map((line, j) => (
                          <li
                            key={j}
                            dangerouslySetInnerHTML={{ __html: `- ${parseContent(line)}` }}
                          />
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="h-20 flex-center text-danger-2">
                    <p>Failed to get updates</p>
                  </div>
                )}
              </div>
            ),
          },
          {
            heading: "New in v3.0.0",
            body: VersionRecap,
          },
          {
            heading: "Notes",
            body: Notes,
          },
          {
            heading: "About",
            body: About,
          },
          {
            heading: "Credits",
            body: <Credits loading={loading} supporters={supporters} />,
          },
        ]}
      />
    </div>
  );
};
