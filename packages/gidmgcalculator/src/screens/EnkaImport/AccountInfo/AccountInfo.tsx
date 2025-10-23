import { FaCaretRight } from "react-icons/fa";
import { Button, clsx, Skeleton } from "rond";

import { useDataImportState } from "../DataImportProvider";
import { RefreshButton } from "./RefreshButton";

type AccountInfoProps = {
  className?: string;
  isMobile?: boolean;
  onSeeBuilds?: () => void;
};

export function AccountInfo({ className, isMobile, onSeeBuilds }: AccountInfoProps) {
  const { data: genshinUser, isLoading, isError, error } = useDataImportState();
  const cls = ["p-3 rounded bg-dark-1", className];

  if (isLoading) {
    return (
      <div className={clsx(cls, "space-y-2")}>
        <div className="h-8 flex items-center">
          <Skeleton className="w-24 h-6 rounded-sm" />
        </div>
        <div className="h-6 flex items-center">
          <Skeleton className="w-8/10 h-4 rounded-sm" />
        </div>
      </div>
    );
  }

  const actions = (
    <div className="mt-3 flex justify-end gap-3">
      <RefreshButton />

      {isMobile && !isError && (
        <Button icon={<FaCaretRight className="text-2xl" />} onClick={onSeeBuilds} />
      )}
    </div>
  );

  if (genshinUser) {
    return (
      <div className={clsx(cls, "space-y-2")}>
        <p>
          <span className="text-2xl font-bold">{genshinUser.name}</span>
          <span className="text-xl text-light-4"> | AR {genshinUser.level}</span>
        </p>
        <p className="text-light-hint">{genshinUser.signature}</p>

        {actions}
      </div>
    );
  }

  if (error) {
    return (
      <div className={clsx(cls)}>
        <div className="py-4 text-danger-2 flex-center">Error: {error.message}</div>
        {actions}
      </div>
    );
  }
}
