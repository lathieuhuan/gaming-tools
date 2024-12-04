import { useLayoutEffect, useState } from "react";
// import { FaExternalLinkAlt } from "react-icons/fa";
import { clsx, CollapseList, ModalControl, LoadingSpin, Skeleton, Modal } from "rond";

import { $AppData } from "@Src/services";
import { useMetadata } from "@Src/hooks";
import { useDispatch } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";

import { MetadataRefetcher } from "../../MetadataRefetcher";
import { VersionRecap, Notes, About } from "./collapse-content";

export const Introduction = (props: ModalControl) => {
  const dispatch = useDispatch();
  const [data, setData] = useState<(typeof $AppData)["generalInfo"]>({
    version: "",
    updates: [],
    supporters: [],
  });

  const { status, error, cooldown, refetch } = useMetadata();

  useLayoutEffect(() => {
    if (status === "success") {
      setData($AppData.generalInfo);

      if (props.active) {
        dispatch(updateUI({ ready: true }));
      }
    }
  }, [status, props.active]);

  const isLoadingMetadata = status === "loading";
  const latestDate: string | undefined = data.updates[0]?.date;

  const typeToCls: Record<string, string> = {
    e: "text-primary-1",
    u: "text-danger-3",
    f: "text-bonus-color",
  };

  const parseContent = (content: string) => {
    return content.replace(/\{[a-zA-Z0-9 _'"-]+\}#\[[euf]\]/g, (match) => {
      const [bodyPart, typePart = ""] = match.split("#");
      const body = bodyPart.slice(1, -1);
      const type = typePart?.slice(1, -1);
      return `<span class="${typeToCls[type] || ""}">${body}</span>`;
    });
  };

  const renderTitle = (screen: "small" | "large") => {
    const config =
      screen === "small"
        ? {
            title: "GI DMG Calculator",
            cls: "text-1.5xl md:hidden",
            patchCls: "text-sm",
            sltCls: "h-3.5",
          }
        : {
            title: "Welcome to GI DMG Calculator",
            cls: "text-2xl hidden md:block",
            patchCls: "text-base",
            sltCls: "h-4",
          };

    return (
      <h1 className={clsx("text-heading-color text-center font-bold relative", config.cls)}>
        {config.title}
        <span className={clsx("absolute top-0 left-full ml-2 text-hint-color", config.patchCls)}>
          {isLoadingMetadata ? (
            <Skeleton className={clsx("w-14 rounded", config.sltCls)} />
          ) : data.version ? (
            <span>v{data.version}</span>
          ) : null}
        </span>
      </h1>
    );
  };

  return (
    <Modal
      preset="large"
      withHeaderDivider={false}
      bodyCls="pt-0"
      title={
        <>
          <div className="flex flex-col items-center">
            {renderTitle("large")}

            <p className="text-xl font-semibold md:hidden">Welcome to</p>
            {renderTitle("small")}
          </div>

          <MetadataRefetcher
            className="my-2"
            isLoading={isLoadingMetadata}
            isError={status === "error"}
            error={error}
            cooldown={cooldown}
            onRefetch={() => refetch()}
          />

          {/* <div className="mb-1 text-center text-light-default text-base font-normal">
            <span>Please join the version 3.7.1 survey and share you thoughts!</span>

            <a
              className="pb-1 w-6 h-6 inline-flex justify-center items-center align-middle"
              href="https://forms.gle/Gt4GViNVi1yoQn5n9"
              target="_blank"
            >
              <FaExternalLinkAlt />
            </a>
          </div> */}
        </>
      }
      {...props}
      closable={status === "success"}
    >
      <div className="h-full custom-scrollbar">
        <CollapseList
          items={[
            {
              heading: (expanded) => (
                <div className="flex items-center space-x-2">
                  <span>Updates</span>

                  {!expanded ? (
                    isLoadingMetadata ? (
                      <Skeleton className="w-28 h-4 rounded" />
                    ) : latestDate ? (
                      <span className="ml-2 px-1 text-sm rounded text-heading-color bg-surface-1">{latestDate}</span>
                    ) : null
                  ) : null}
                </div>
              ),
              body: (
                <div className="space-y-2 contains-inline-svg">
                  {isLoadingMetadata ? (
                    <div className="h-20 flex-center">
                      <LoadingSpin size="large" />
                    </div>
                  ) : data.updates.length ? (
                    data.updates.map(({ date, patch, content }, i) => (
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
          {isLoadingMetadata ? (
            <div className="ml-4 grid grid-cols-4">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="w-28 h-4 rounded" />
              ))}
            </div>
          ) : data.supporters.length ? (
            <ul className="ml-4 text-primary-1 columns-1 md:columns-2 xm:columns-3 lg:columns-4">
              {data.supporters.map((name, i) => (
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
    </Modal>
  );
};
