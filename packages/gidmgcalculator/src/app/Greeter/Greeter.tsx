import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { FaDiscord } from "react-icons/fa";
import { Button, clsx, Modal, Skeleton } from "rond";

import { appDataQueryOptions } from "@/services/app-data";
import { useSettingsStore } from "@Store/settings";
import { updateUI, useUIStore } from "@Store/ui";

// Components
import { AppDataRefetcher } from "./AppDataRefetcher";
import { Introduction } from "./Introduction";

export const Greeter = () => {
  const appModalType = useUIStore((state) => state.appModalType);
  const { data, isLoading, isSuccess, isError, error, refetch } = useQuery(appDataQueryOptions);

  useLayoutEffect(() => {
    if (isSuccess) {
      updateUI({ appReady: true });
    }
  }, [isSuccess]);

  useLayoutEffect(() => {
    updateUI({ appModalType: "INTRO" });

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { askBeforeUnload } = useSettingsStore.getState();

      if (askBeforeUnload) {
        e.preventDefault();
        return (e.returnValue = "Are you sure you want to exit?");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
      // close shared data channel if this component can be unmounted
    };
  }, []);

  const renderIntroTitle = (screen: "small" | "large") => {
    const config =
      screen === "small"
        ? {
            title: "GI DMG Calculator",
            cls: "text-xlp md:hidden",
            patchCls: "text-sm",
            skeletonCls: "h-3.5",
          }
        : {
            title: "Welcome to GI DMG Calculator",
            cls: "text-2xl hidden md:block",
            patchCls: "text-base",
            skeletonCls: "h-4",
          };
    const version = data?.version;

    return (
      <h1 className={clsx("text-heading text-center font-bold relative", config.cls)}>
        {config.title}
        <span className={clsx("absolute top-0 left-full ml-2 text-light-hint", config.patchCls)}>
          {isLoading ? (
            <Skeleton className={clsx("w-14 rounded", config.skeletonCls)} />
          ) : version ? (
            <span>v{version}</span>
          ) : null}
        </span>
      </h1>
    );
  };

  return (
    <Modal
      active={appModalType === "INTRO"}
      preset="large"
      withHeaderDivider={false}
      bodyCls="pt-0 flex flex-col"
      title={
        <>
          <div className="flex flex-col items-center">
            {renderIntroTitle("large")}

            <p className="text-xl font-semibold md:hidden">Welcome to</p>
            {renderIntroTitle("small")}
          </div>

          <AppDataRefetcher
            className="my-2"
            isLoading={isLoading}
            isError={isError}
            error={error?.message}
            cooldown={error?.data.cooldown}
            onRefetch={() => void refetch()}
          />

          {/* <div className="mb-1 text-center text-light-1 text-base font-normal">
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
      closable={isSuccess}
      onClose={() => updateUI({ appModalType: "" })}
    >
      <Introduction className="grow" data={data} loading={isLoading} />

      <div className="mt-4 flex justify-end">
        <a href="https://discord.gg/gRxYCHqAAC" target="_blank">
          <Button icon={<FaDiscord />}>Discord</Button>
        </a>
      </div>
    </Modal>
  );
};
