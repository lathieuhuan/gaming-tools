import { clsx, CollapseList, LoadingSpin, Skeleton } from "rond";

import type { AppMetadata } from "../types";
import { About, Credits, Notes, VersionRecap } from "./collapsible-sections";
import { UpdateList } from "./UpdateList";

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

  const latestDateElement = loading ? (
    <Skeleton className="w-28 h-4 rounded" />
  ) : (
    latestDate && <span className="px-1 text-sm rounded text-heading bg-dark-1">{latestDate}</span>
  );

  return (
    <div className={clsx("custom-scrollbar", className)}>
      <CollapseList
        items={[
          {
            heading: (expanded) => (
              <div className="flex items-center space-x-2">
                <span>Updates</span>

                {!expanded && latestDateElement}
              </div>
            ),
            body: loading ? (
              <div className="h-20 flex-center">
                <LoadingSpin size="large" />
              </div>
            ) : (
              <div>
                <UpdateList className="space-y-2 contains-inline-svg peer" updates={updates} />
                <div className="h-20 flex-center text-danger-2 hidden peer-empty:flex">
                  <p>Failed to get updates</p>
                </div>
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
