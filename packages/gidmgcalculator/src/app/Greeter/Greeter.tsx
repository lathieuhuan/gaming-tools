import { useQuery } from "@tanstack/react-query";
import { useLayoutEffect } from "react";
import { FaDiscord } from "react-icons/fa";
import { Button, Modal, Skeleton } from "rond";

import { appDataQueryOptions } from "@/services/app-data";
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

  return (
    <Modal
      active={appModalType === "INTRO"}
      preset="large"
      withHeaderDivider={false}
      bodyCls="pt-0 flex flex-col"
      title={
        <>
          <div className="text-heading">
            <h1 className="text-center text-2xl font-bold hidden md:block">
              Welcome to GI DMG Calculator
            </h1>

            <div className="flex flex-col items-center md:hidden">
              <p className="text-xl">Welcome to</p>
              <h1 className="text-xlp font-bold">GI DMG Calculator</h1>
            </div>
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

      <div className="mt-4 flex items-end justify-between">
        {isLoading ? (
          <Skeleton className="w-12 h-4 rounded" />
        ) : (
          <span className="text-light-hint text-base leading-4">{data?.version}</span>
        )}

        <a href="https://discord.gg/gRxYCHqAAC" target="_blank">
          <Button icon={<FaDiscord />}>Discord</Button>
        </a>
      </div>
    </Modal>
  );
};
