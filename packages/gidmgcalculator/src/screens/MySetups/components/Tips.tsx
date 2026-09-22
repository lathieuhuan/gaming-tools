import { FaUnlink, FaWrench } from "react-icons/fa";

// Component
import { HighlightText } from "@/components/Text";

export function Tips() {
  return (
    <ul className="pl-4 pr-2 list-disc space-y-1 contains-inline-svg">
      <li>
        <HighlightText>Update setups</HighlightText>: When you press <FaWrench /> on a saved setup,
        you're pushing a <span className="text-danger-2">copy</span> of it to the Calculator, so
        don't forget to save the modified copy if you want to apply the changes to that setup.
      </li>
      <li>
        <HighlightText>Teammate details</HighlightText> on a setup can be viewed when you press a
        teammate icon. Here you can build a setup for that teammate based on the main setup. Party
        members and Target will be the same. Some modifiers will remain activated and keep their
        inputs.
      </li>
      <li>
        <HighlightText>Complex Setup</HighlightText> is the result of combining setups of the same 4
        party members. You can break this complex into individual setups again by pressing the{" "}
        <FaUnlink /> before its name. Now at teammate details you can switch to that setup.
      </li>
      <li>
        You CANNOT change teammates when modifying the direct copy of a setup that is in a complex.
        However you can make a copy of that copy in the Calculator and work on it.
      </li>
    </ul>
  );
}
