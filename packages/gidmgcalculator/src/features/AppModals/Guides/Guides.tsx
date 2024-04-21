import { FaBars, FaCog } from "react-icons/fa";
import { CollapseList, type ModalControl, Modal } from "rond";

import { Red, Yellow } from "@Src/components";
import { CalculatorGuide } from "./CalculatorGuide";

export function Guides(props: ModalControl) {
  return (
    <Modal title="Guides" preset="large" withHeaderDivider={false} bodyCls="pt-0" {...props}>
      <div className="h-full custom-scrollbar">
        <CollapseList
          items={[
            {
              heading: "Acronyms & Descriptions",
              body: (
                <div className="space-y-1">
                  <div>
                    <p>- Acronyms used in the App:</p>
                    <ul className="pl-8 mt-1 list-disc space-y-1">
                      <li>
                        <Yellow>NA</Yellow>: Normal Attacks
                      </li>
                      <li>
                        <Yellow>ES</Yellow>: Elemental Skill
                      </li>
                      <li>
                        <Yellow>EB</Yellow>: Elemental Burst
                      </li>
                      <li>
                        <Yellow>A</Yellow>: Ascension, e.g. A4 is talent unlocked at Acsension 4
                      </li>
                      <li>
                        <Yellow>C</Yellow>: Constellation, e.g. C1 is skill unlocked at Constellation 1
                      </li>
                    </ul>
                  </div>
                  <p>
                    - Descriptions for skills & items may not exactly the same as in-game descriptions. I took the
                    liberty to re-word it the way I find it more simple to understand.
                  </p>
                  <p>
                    - If you see above arcronyms in square brackets, they are for the name before them. E.g. "Nights of
                    Formal Focus [ES]" is Layla's Elemental Skill.
                  </p>
                  <p>
                    - Additionally, if you see a ~ before the acronym, it mean the name before it is part of the skill,
                    can be effect name, stack name... E.g. "Curtain of Slumber [~ES]" is the shield of Layla's Elemental
                    Skill.
                  </p>
                </div>
              ),
            },
            {
              heading: "Calculator",
              body: <CalculatorGuide />,
            },
            {
              heading: "User Data",
              body: (
                <div className="space-y-1 contains-inline-svg">
                  <p>
                    - You can add and manage your characters and items in <Yellow>My Characters</Yellow>,{" "}
                    <Yellow>My Weapons</Yellow>, <Yellow>My Artifacts</Yellow>.
                  </p>
                  <p>
                    - You can save setups from the Calculator and view them in <Yellow>My Setups</Yellow>.
                  </p>
                  <p className="text-danger-3">
                    - Your data saved in the App is just temporary. If you wish it to be available in your next visit,
                    you need to download your data and then upload it to the App again.
                  </p>
                  <p>
                    - Or you can turn on "Auto save my database to browser's local storage" option in <FaCog />{" "}
                    Settings.
                  </p>
                  <p>
                    - Open the <FaBars /> menu at the top right corner to <Yellow>download</Yellow> and{" "}
                    <Yellow>upload</Yellow> your data.
                  </p>
                  <p>
                    - Your saved data is <Red>limited</Red>. When creating new Setup in the Calculator, you should pick
                    items that you already have if possible to reuse them and save space.
                  </p>
                </div>
              ),
            },
            {
              heading: "Settings",
              body: (
                <div className="space-y-1 contains-inline-svg">
                  <p>
                    - The App settings can be change via <FaCog /> Settings on the <FaBars /> Menu. These settings are
                    saved in the browser's local storage.
                  </p>
                  <p>
                    - Be careful when the Calculator is under the effect of{" "}
                    <Yellow>Separate main character's info on each setup</Yellow> (level, constellation, talents) on
                    each setup. It can make things complicated.
                  </p>
                  <p>
                    - When the "Separate main character's info on each setup" option is deactivated. Info on the current
                    setup will be used for others. This setting will be reset to NOT activated at the start of every
                    calculating session (e.g. when select new main character).
                  </p>
                  <p>
                    - <Yellow>Auto save my database to browser's local storage</Yellow> will help you store your data
                    for the next visits. It takes less than 500KB to store 200 weapons & 800 artifacts. Those are
                    current limits of the user database.
                  </p>
                  <p className="text-danger-3">
                    - Change of "Auto save my database to browser's local storage" option can remove your current data
                    and works on the App.
                  </p>
                  <p>
                    - <Yellow>Default values</Yellow> will be used whenever a new character or item is created in your
                    data or in the Calculator tab.
                  </p>
                </div>
              ),
            },
          ]}
        />
      </div>
    </Modal>
  );
}
