import { FaBars, FaCog } from "react-icons/fa";
import { Yellow, Red } from "@Src/components";

export function UserDataGuide() {
  return (
    <div className="space-y-1 contains-inline-svg">
      <p>
        - You can add and manage your characters and items in <Yellow>My Characters</Yellow>,{" "}
        <Yellow>My Weapons</Yellow>, <Yellow>My Artifacts</Yellow>.
      </p>
      <p>
        - You can save setups from the Calculator and view them in <Yellow>My Setups</Yellow>.
      </p>
      <p className="text-red-100">
        - Your data saved in the App is just temporary. If you wish it to be available in your next visit, you need to
        download your data and then upload it to the App again.
      </p>
      <p>
        - Or you can turn on "Auto save my database to browser's local storage" option in <FaCog /> Settings.
      </p>
      <p>
        - Open the <FaBars /> menu at the top right corner to <Yellow>download</Yellow> and <Yellow>upload</Yellow> your
        data.
      </p>
      <p>
        - Your saved data is <Red>limited</Red>. When creating new Setup in the Calculator, you should pick items that
        you already have if possible to reuse them and save space.
      </p>
    </div>
  );
}
