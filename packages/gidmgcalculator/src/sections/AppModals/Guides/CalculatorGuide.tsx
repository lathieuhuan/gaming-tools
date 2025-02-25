import { FaBalanceScaleLeft, FaChevronDown, FaCopy, FaSave, FaSyncAlt, FaShareAlt } from "react-icons/fa";
import { SiTarget } from "react-icons/si";
import { MdMoreVert } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { BiImport } from "react-icons/bi";
import { TrashCanSvg } from "rond";

import { markGreen, markYellow } from "@Src/components";

interface ListProps {
  children: React.ReactNode;
}

export function ListDecimal(props: ListProps) {
  return <ul className="mt-1 pl-4 list-decimal space-y-1" {...props} />;
}

export function ListDisc(props: ListProps) {
  return <ul className="mt-1 list-disc list-inside space-y-1" {...props} />;
}

export function CalculatorGuide() {
  const quickActions = [
    { Icon: TrashCanSvg, desc: "Remove the setup" },
    { Icon: FaShareAlt, desc: "Encode the setup to share it with others" },
    { Icon: FaSave, desc: "Save the setup to My Setups" },
    { Icon: FaCopy, desc: "Duplicate the setup" },
    { Icon: FaBalanceScaleLeft, desc: "Toggle the setup for comparison" },
    {
      Icon: SiTarget,
      desc: "Select the standard setup, all other setups will be compared to this one.",
    },
  ];

  return (
    <div className="-ml-1 -mr-2 contains-inline-svg">
      <p>The Calculator contains 4 columns, from left to right they are:</p>
      <ListDecimal>
        <li>
          {markGreen("Character Overview")} displays general information and attributes summary of the character,
          details of the weapon, attributes summary and set bonuses of the artifacts, levels of the constellation and
          talents. Here you can:
          <ListDisc>
            <li>
              Switch the {markYellow("main character")} to be calculated by pressing <FaSyncAlt /> or the character's
              icon. Change the character level.
            </li>
            <li>
              Change weapon level and refinement via dropdown selects <FaChevronDown />
            </li>
            <li>
              Change {markYellow("talent levels")} via dropdown selects <FaChevronDown />. Change{" "}
              {markYellow("constellation level")} by pressing their icons.
            </li>
          </ListDisc>
        </li>
        <li>
          {markGreen("Modifiers Manager")}.
          <ListDisc>
            <li>
              Modifiers are {markYellow("Buffs")} applied to the character and {markYellow("Debuffs")} applied to the
              target coming from various sources such as teammates, weapons, artifacts...
            </li>
            <li>
              Every modifier that needs a condition to trigger will have a control in the Modifers Manager which helps
              you activate / deactivate and adjust the modifier.
            </li>
            <li>
              For example, as teammate Rosaria can give CRIT Rate bonus based on her CRIT Rate when using Elemental
              Burst. In Modifier Manager, go to Buffs/Party, look for Rosaria's section and you will see a checkbox to
              toggle this buff and an input to enter her CRIT Rate for calculation.
            </li>
            <li>
              For the modifier control to appear its source need to be present, e.g. you need to add a catalyst-wielding
              teammate and give them Thrilling Tales of Dragon Slayers to have it buff control available.
            </li>
          </ListDisc>
        </li>
        <li>
          {markGreen("Setups Manager")}. Here you can
          <ListDisc>
            <li>
              Make changes to {markYellow("Teammates")}, {markYellow("Weapon")}, {markYellow("Artifacts")}, and{" "}
              {markYellow("Target")}. Press the item / character icons to switch them. Press 2 icons at the bottom right
              corner to select items from your data <i>(see User Data guide section below)</i>.
            </li>
            <li>
              Switch setups and perform quick actions to setups, or open the full manager with <IoDocumentText /> and do
              the management there. Icons meaning:
              <ul className="mt-1 pl-2 space-y-1">
                {quickActions.map((action, i) => {
                  return (
                    <li key={i} className="flex items-center">
                      <action.Icon />
                      <span className="ml-2">{action.desc}</span>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li>
              You can {markYellow("import a setup")} in 2 ways: (1) Open the full manager, choose <BiImport /> Import
              then paste the code, choose Proceed. (2) Follow the link which contains the code.
            </li>
          </ListDisc>
        </li>
        <li>
          {markGreen("Calculation Results")}. With the menu <MdMoreVert className="text-xl" /> you can
          <ListDisc>
            <li>
              Call the {markYellow("Tracker")} to inspect the calculation details: what buffs and debuffs are used,
              their values, sources...
            </li>
            <li>Expand the results for better view when comparing many setups (not available on small devices).</li>
          </ListDisc>
        </li>
      </ListDecimal>
    </div>
  );
}
