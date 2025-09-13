import { useLayoutEffect, useRef, useState } from "react";
import { clsx, Modal, Skeleton } from "rond";

import type { AppMetadata } from "./types";

import { $AppData, $AppSettings } from "@/services";
import { useDispatch, useSelector } from "@Store/hooks";
import { updateUI } from "@Store/ui-slice";
import { GreeterService } from "./_logic/GreeterService";

// Components
import { Introduction } from "./Introduction";
import { MetadataRefetcher } from "./MetadataRefetcher";

function useGreeter() {
  const ref = useRef<GreeterService>();
  if (!ref.current) {
    ref.current = new GreeterService($AppData);
  }
  return ref.current;
}

type State = {
  status: "loading" | "success" | "error";
  error?: string;
  cooldown?: number;
  metadata?: AppMetadata;
};

export const Greeter = () => {
  const dispatch = useDispatch();
  const appModalType = useSelector((state) => state.ui.appModalType);
  const greeter = useGreeter();

  const [state, setState] = useState<State>({
    status: "loading",
  });

  const isLoading = state.status === "loading";

  const getMetadata = async () => {
    if (state.status !== "loading") {
      setState({
        status: "loading",
      });
    }

    const error = await greeter.fetchAllData();

    if (error) {
      setState({
        status: "error",
        error: error.message,
        cooldown: error.cooldown,
      });
    } else {
      setState({
        status: "success",
        metadata: greeter.metadataInfo,
      });
      dispatch(updateUI({ appReady: true }));
    }
  };

  useLayoutEffect(() => {
    dispatch(updateUI({ appModalType: "INTRO" }));
    getMetadata();

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if ($AppSettings.get("askBeforeUnload")) {
        e.preventDefault();
        return (e.returnValue = "Are you sure you want to exit?");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload, { capture: true });

    return () => {
      greeter.endShift();
      window.removeEventListener("beforeunload", handleBeforeUnload, { capture: true });
    };
  }, []);

  const renderIntroTitle = (screen: "small" | "large") => {
    const config =
      screen === "small"
        ? {
            title: "GI DMG Calculator",
            cls: "text-1.5xl md:hidden",
            patchCls: "text-sm",
            skeletonCls: "h-3.5",
          }
        : {
            title: "Welcome to GI DMG Calculator",
            cls: "text-2xl hidden md:block",
            patchCls: "text-base",
            skeletonCls: "h-4",
          };
    const version = state.metadata?.version;

    return (
      <h1 className={clsx("text-heading-color text-center font-bold relative", config.cls)}>
        {config.title}
        <span className={clsx("absolute top-0 left-full ml-2 text-hint-color", config.patchCls)}>
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
      bodyCls="pt-0"
      title={
        <>
          <div className="flex flex-col items-center">
            {renderIntroTitle("large")}

            <p className="text-xl font-semibold md:hidden">Welcome to</p>
            {renderIntroTitle("small")}
          </div>

          <MetadataRefetcher
            className="my-2"
            isLoading={isLoading}
            isError={state.status === "error"}
            error={state.error}
            cooldown={state.cooldown}
            onRefetch={getMetadata}
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
      closable={state.status === "success"}
      onClose={() => dispatch(updateUI({ appModalType: "" }))}
    >
      <Introduction metadata={state.metadata} loading={isLoading} />
    </Modal>
  );
};
