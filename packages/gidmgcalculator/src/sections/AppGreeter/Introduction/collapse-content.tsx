import { FaBars, FaDiscord, FaPuzzlePiece, FaRedditAlien } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { markYellow } from "@Src/components";

export const VersionRecap = (
  <div className="space-y-2 contains-inline-svg">
    <div>
      <h4 className="text-heading-color text-lg font-bold">General</h4>
      <ul className="mt-1 pl-4 space-y-1 list-disc">
        <li>Reduce options for artifact level to 0/4/8/12/16/20.</li>
        <li>Add name searching function for when selecting characters.</li>
        <li>
          Introduction, Download, and Upload are put into <FaBars /> Menu along with Guides and Settings (old version is
          Configurations in Setups Manager). See more of Settings in Guides.
        </li>
      </ul>
    </div>

    <div>
      <h4 className="text-heading-color text-lg font-bold">Calculator</h4>
      <ul className="mt-1 pl-4 space-y-1 list-disc">
        <li>Add a constellation control next to the character level control.</li>
        <li>Move target configuration place to Setups Manager column and give it a new design.</li>
        <li>
          Remove external infusions from teammates (e.g. Candace's EB, Chongyun's ES, Bennett's EB). In replace of them,
          Custom Infusion control is added to Resonance & Reactions buffs.
        </li>
        <li>
          All buffs & debuffs that do not need a condition to trigger are now auto applied (e.g. Yae's A4, Nahida's A4).
        </li>
        <li>Empower custom buffs. Custom buffs now can have negative values.</li>
        <li>Add quick action buttons to the setups dropdown on Setups Manager column.</li>
        <li>
          Teammates now can be equipped with weapons & artifacts which will enable according buffs/debuffs from these
          items.
        </li>
        <li>Put tracker button and expand button into one menu on Damage Results column.</li>
        <li>Show talent levels on the titles of talent damage result.</li>
        <li>Damage results that are equals to 0 will be displayed as "-".</li>
        <li>
          Hide all normal attack damage results when a stance-changing skill that uses different multipliers is
          activated (e.g. Childe's ES, Cyno's EB).
        </li>
      </ul>
    </div>

    <div>
      <h4 className="text-heading-color text-lg font-bold">User Data</h4>
      <ul className="mt-1 pl-4 space-y-1 list-disc">
        <li>Improve character sort in My Characters.</li>
        <li>
          Add <FaPuzzlePiece /> icon on owner label below Weapon and Artifact cards to indicate that the item is
          currently used in some saved setups, click/tap this icon to see what those setup are. You need to remove the
          item from those setups, or remove those setups, before removing the item itself.
        </li>
      </ul>
    </div>
  </div>
);

export const Notes = (
  <div>
    <p>
      - This App is not displayed well on Mobile and Devices that are less than 1024px in width, and maybe in Dark Mode
      too.
    </p>
    <p>- The results are not 100% correct, but the differences should be small.</p>
    <p>
      - Shield DMG Absorption is not increased by Shield Strength, because it needs different formulas and I'm lazy.
    </p>
  </div>
);

const CONTACTS = [
  {
    Icon: FaDiscord,
    href: "https://discord.com/",
    text: "Ronqueroc#2674",
  },
  {
    Icon: FaRedditAlien,
    href: "https://www.reddit.com/user/Ronqueroc",
    text: "u/Ronqueroc",
  },
  {
    Icon: MdEmail,
    href: "https://mail.google.com",
    text: "nothingthen11@gmail.com",
  },
];

export const About = (
  <div className="space-y-1">
    <p>
      - Hello, I'm {markYellow("Ronqueroc")} the owner of this App. I lost my job at a hotel due to the pandemic and
      started to learn programming on July 2020.
    </p>
    <p>
      - This App is for calculating DMG a character in game Genshin Impact can do with their attacks in a specific
      scenario (Setup). It is not affiliated with or endorsed by Hoyoverse.
    </p>
    <p>- Feel free to contact me if you encounter bugs or have any questions regarding the Calculator.</p>
    <ul className="pl-3 space-y-2">
      {CONTACTS.map(({ Icon, href, text }, i) => (
        <li key={text} className="flex items-center">
          <Icon className="mr-2 shrink-0" size="1.25rem" />
          <a href={href} rel="noreferrer" target="_blank">
            {text}
          </a>
        </li>
      ))}
    </ul>
    <p className="ml-3 text-hint-color">(yes the email address is real)</p>
  </div>
);
