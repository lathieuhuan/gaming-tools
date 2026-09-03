import { BiImport } from "react-icons/bi";
import {
  FaBalanceScaleLeft,
  FaChevronDown,
  FaCopy,
  FaInfoCircle,
  FaSave,
  FaShareAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { MdMoreVert } from "react-icons/md";
import { SiTarget } from "react-icons/si";
import { TrashCanSvg } from "rond";

import { HighlightText, PositiveText } from "@/components/Text";

const LIST_DECIMAL_CLS = "mt-1 pl-4 list-decimal space-y-1";
const LIST_ALPHABET_CLS = "mt-1 pl-4 list-[upper-alpha] space-y-1";
const LIST_DISC_CLS = "mt-1 list-disc list-inside space-y-1";

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
      <ul className={LIST_DECIMAL_CLS}>
        <li>
          <PositiveText>Character Overview</PositiveText>
          <ul className={LIST_ALPHABET_CLS}>
            <li>
              <PositiveText>General information</PositiveText>:
              <ul className={LIST_DISC_CLS}>
                <li>
                  Change character: pressing <FaSyncAlt /> or the character's avatar.
                </li>
                <li>
                  Change character's level and constellation: select in the respective dropdown{" "}
                  <FaChevronDown />.
                </li>
                <li>
                  Toggle character's enhanced state (if available): press the label beside the
                  character's rarity. For example <HighlightText>Hexerei</HighlightText>.
                </li>
              </ul>
            </li>
            <li>
              <PositiveText>Attributes</PositiveText>: hover or press (mobile) the HP/ATK/DEF rows
              to see the breakdown of their values: base + bonus.
            </li>
            <li>
              <PositiveText>Weapon</PositiveText>: change weapon level and refinement via their
              respective dropdown <FaChevronDown />.
            </li>
            <li>
              <PositiveText>Artifacts</PositiveText>: see the attributes summary and set bonuses.
            </li>
            <li>
              <PositiveText>Constellation</PositiveText>:
              <ul className={LIST_DISC_CLS}>
                <li>Change constellation level by pressing their icons.</li>
                <li>
                  Read the constellation description by pressing its title or icon <FaInfoCircle />.
                </li>
              </ul>
            </li>
            <li>
              <PositiveText>Talents</PositiveText>:
              <ul className={LIST_DISC_CLS}>
                <li>
                  Change talent levels via dropdown selects <FaChevronDown />.
                </li>
                <li>
                  Read the talent description by pressing icon <FaInfoCircle />.
                </li>
              </ul>
            </li>
          </ul>
        </li>

        <li>
          <PositiveText>Modifiers Manager</PositiveText>.
          <ul className={LIST_DISC_CLS}>
            <li>
              Modifiers are <HighlightText>Buffs</HighlightText> applied to the character and{" "}
              <HighlightText>Debuffs</HighlightText> applied to the target coming from various
              sources such as teammates, weapons, artifacts...
            </li>
            <li>
              Every modifier that needs a condition to trigger will have a control in the Modifers
              Manager which helps you activate / deactivate and adjust the modifier.
            </li>
            <li>
              For example, as teammate Rosaria can give CRIT Rate bonus based on her CRIT Rate when
              using Elemental Burst. In Modifier Manager, go to Buffs/Party, look for Rosaria's
              section and you will see a checkbox to toggle this buff and an input to enter her CRIT
              Rate for calculation.
            </li>
            <li>
              For the modifier control to appear its source need to be present, e.g. you need to add
              a catalyst-wielding teammate and give them Thrilling Tales of Dragon Slayers to have
              its buff control available.
            </li>
          </ul>
        </li>
        <li>
          <PositiveText>Setups Manager</PositiveText>. Here you can
          <ul className={LIST_DISC_CLS}>
            <li>
              Make changes to <HighlightText>Teammates</HighlightText>,{" "}
              <HighlightText>Weapon</HighlightText>, <HighlightText>Artifacts</HighlightText>, and{" "}
              <HighlightText>Target</HighlightText>. Press the item / character icons to switch
              them. Press 2 icons at the bottom right corner to select items from your data{" "}
              <i>(see User Data guide section below)</i>.
            </li>
            <li>
              Switch setups and perform quick actions to setups, or open the full manager with{" "}
              <IoDocumentText /> and do the management there. Icons meaning:
              <ul className="mt-1 pl-4 space-y-1">
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
              You can <HighlightText>import a setup</HighlightText> in 2 ways: (1) Open the full
              manager, choose <BiImport /> Import then paste the code, choose Proceed. (2) Follow
              the link which contains the code.
            </li>
          </ul>
        </li>
        <li>
          <PositiveText>Calculation Results</PositiveText>. With the menu{" "}
          <MdMoreVert className="text-xl" /> you can
          <ul className={LIST_DISC_CLS}>
            <li>
              Call the <HighlightText>Tracker</HighlightText> to inspect the calculation details:
              what buffs and debuffs are used, their values, sources...
            </li>
            <li>
              Expand the results for better view when comparing many setups (not available on small
              devices).
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}
