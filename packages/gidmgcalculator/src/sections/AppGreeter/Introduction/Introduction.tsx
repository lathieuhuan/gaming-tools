// import { FaExternalLinkAlt } from "react-icons/fa";
import { CollapseList, LoadingSpin, Skeleton } from "rond";

import type { MetadataInfo } from "../AppGreeter.types";
import { About, Notes, VersionRecap } from "./collapse-content";

interface IntroductionProps {
  info?: MetadataInfo;
  loading?: boolean;
}
export const Introduction = ({
  info = {
    version: "",
    updates: [],
    supporters: [],
  },
  loading,
}: IntroductionProps) => {
  const latestDate: string | undefined = info.updates[0]?.date;

  const typeToCls: Record<string, string> = {
    e: "text-primary-1",
    u: "text-danger-3",
    f: "text-bonus-color",
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
    <div className="h-full custom-scrollbar">
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
                    <span className="ml-2 px-1 text-sm rounded text-heading-color bg-surface-1">{latestDate}</span>
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
                ) : info.updates.length ? (
                  info.updates.map(({ date, patch, content }, i) => (
                    <div key={i}>
                      <p className="text-heading-color font-semibold">{date + (patch ? ` (v${patch})` : "")}</p>
                      <ul className="mt-1 space-y-1">
                        {content.map((line, j) => (
                          <li key={j} dangerouslySetInnerHTML={{ __html: `- ${parseContent(line)}` }} />
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <div className="h-20 flex-center text-danger-3">
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
        ]}
      />
      <div className="px-2 space-y-1">
        <p className="text-heading-color font-semibold">Credit</p>
        <p>
          - Thank you{" "}
          <a href="https://genshin-impact.fandom.com/wiki/Genshin_Impact_Wiki" rel="noreferrer" target="_blank">
            Genshin Impact Wiki
          </a>
          . Every image and formula is gathered from them.
        </p>
        <p>
          - A thank to{" "}
          <a href="https://genshin.honeyhunterworld.com/?lang=EN" rel="noreferrer" target="_blank">
            Honey Impact
          </a>
          , data of characters, weapons, and artifacts are collected from their site.
        </p>
        <p>- Huge and special thanks to the donators!</p>
        <ul className="ml-4 text-primary-1 columns-1 md:columns-2 xm:columns-3 lg:columns-4">
          {["Marc (marcdau)", "Akenouille", "Brandon Pride", "apiromz", "aimie"].map((name, i) => (
            <li key={i}>{name}</li>
          ))}
        </ul>
        <p>- Special thanks to these supporters for the bug reports:</p>
        {loading ? (
          <div className="ml-4 grid grid-cols-1 md:grid-cols-2 xm:grid-cols-3 lg:grid-cols-4 gap-y-2">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="w-28 h-4 rounded" />
            ))}
          </div>
        ) : info.supporters.length ? (
          <ul className="ml-4 text-primary-1 columns-1 md:columns-2 xm:columns-3 lg:columns-4">
            {info.supporters.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        ) : (
          <div className="h-20 flex-center text-danger-3">
            <p>Failed to get supporters</p>
          </div>
        )}
        <p>- Last but not least, thank you for using my App and please give me some feedback if you can.</p>
      </div>
    </div>
  );
};
