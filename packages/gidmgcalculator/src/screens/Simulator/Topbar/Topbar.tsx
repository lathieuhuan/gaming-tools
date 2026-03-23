import { SidebarButton } from "../components/SidebarButton";
import { TopBarContent } from "./TopBarContent";

export function TopBar() {
  return (
    <div className="flex justify-center bg-dark-2">
      <div className="w-full h-16 px-4 flex items-center">
        <SidebarButton />
        <div className="mx-2 w-px h-6 bg-dark-line" />
        <TopBarContent className="grow" />
      </div>
    </div>
  );
}
