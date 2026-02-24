import { useState } from "react";
import { ClassValue, clsx, ExclamationCircleSvg } from "rond";

import { EnkaLogo } from "@/assets/icons";
import { TabHeader } from "../components/TabHeader";
import { AccountInfo } from "./AccountInfo";
import { ProfileInfo } from "./ProfileInfo";
import { SearchBar } from "./SearchBar";

type SectionCoverProps = {
  className?: ClassValue;
};

export function SectionCover({ className }: SectionCoverProps) {
  const [profile, setProfile] = useState<string>("");

  return (
    <div className={clsx("p-4 flex flex-col gap-6 shrink-0 overflow-auto", className)}>
      <div className="flex justify-between">
        <TabHeader sub="Use in-game UID">
          <h2 className="font-bold text-heading">Import data</h2>
        </TabHeader>

        <div className="flex flex-col items-end">
          <p className="text-light-hint text-sm">Powered by</p>
          <a
            className="text-light-2 flex items-center gap-1"
            href="https://enka.network"
            target="_blank"
          >
            <EnkaLogo className="text-xl" />
            <span className="text-lg font-bold">Enka.Network</span>
          </a>
        </div>
      </div>

      <SearchBar onSearchProfile={setProfile} />
      <ProfileInfo profile={profile} />
      <AccountInfo />

      <div className="p-3 rounded-lg bg-dark-1 flex items-start gap-2">
        <div className="h-6 flex items-center shrink-0">
          <ExclamationCircleSvg className="text-xl" />
        </div>
        <span className="text-light-4">
          Artifacts with rarity less than 4-star are not supported.
        </span>
      </div>
    </div>
  );
}
