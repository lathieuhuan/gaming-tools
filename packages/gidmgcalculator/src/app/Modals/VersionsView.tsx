import { cn, OverflowWatcher } from "rond";

import { EXPORTED_SETUP_VERSION, LEGACY_EXPORTED_SETUP_VERSION } from "@/constants/config";

export function VersionsView({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-[5rem_1fr_1fr] gap-2 text-center text-heading font-bold uppercase">
        <span>Version</span>
        <span>Release</span>
        <span>EOS</span>
      </div>

      <div className="h-px bg-dark-line/80" />

      <OverflowWatcher
        className="grow custom-scrollbar"
        wrapCls="grid grid-cols-[5rem_1fr_1fr] gap-2"
        overflowedCls="pr-4"
      >
        <FeatureVersionsView
          label="Exported/shared setup data"
          versions={[
            {
              value: LEGACY_EXPORTED_SETUP_VERSION,
              eosDate: "Oct 1, 2026",
            },
            {
              value: EXPORTED_SETUP_VERSION,
              releaseDate: "May 29, 2026",
            },
          ]}
        />
        <FeatureVersionsView
          label="Download/Upload user data file"
          versions={[
            {
              value: "3.1",
              eosDate: "Oct 1, 2026",
            },
            {
              value: "4",
              releaseDate: "Dec 2025",
              eosDate: "Dec 1, 2027",
            },
            {
              value: "5",
              releaseDate: "Feb 2026",
              eosDate: "Feb 1, 2027",
            },
            {
              value: "6",
              releaseDate: "Jun 2026",
            },
          ]}
        />
        <FeatureVersionsView
          label="Auto-saved user data"
          versions={[
            {
              value: "0",
              eosDate: "Oct 1, 2026",
            },
            {
              value: "4",
              releaseDate: "Dec 2025",
              eosDate: "Dec 1, 2027",
            },
            {
              value: "5",
              releaseDate: "Dec 2025",
              eosDate: "Dec 1, 2027",
            },
            {
              value: "6",
              releaseDate: "Feb 2026",
              eosDate: "Feb 1, 2027",
            },
            {
              value: "7",
              releaseDate: "Jun 2026",
            },
          ]}
        />
      </OverflowWatcher>
    </div>
  );
}

type Version = {
  value: string | number;
  releaseDate?: string;
  eosDate?: string;
};

function FeatureVersionsView(props: { label: string; versions: Version[] }) {
  return (
    <div className="contents">
      <p className="col-span-full text-light-hint">{props.label}</p>

      {props.versions.map((version) => (
        <div key={version.value} className="contents text-right">
          <span className="text-primary-1 text-center font-semibold">{version.value}</span>
          <span className="text-light-hint">{version.releaseDate || "-"}</span>
          <span>{version.eosDate || "-"}</span>
        </div>
      ))}
    </div>
  );
}
