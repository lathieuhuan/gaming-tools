import { FaChevronRight } from "react-icons/fa";
import { Checkbox, CollapseSpace, Table } from "rond";

type OverwriteOptionProps = {
  visible: boolean;
  label: string;
  name: string;
  expanded: boolean;
  /** Compare rows */
  children: React.ReactNode;
  onClickSeeDetails: () => void;
};

export function OverwriteOption({ visible, label, name, expanded, children, onClickSeeDetails }: OverwriteOptionProps) {
  if (!visible) return null;

  return (
    <div>
      <div className="px-4 flex items-center justify-between">
        <Checkbox className="mr-4" name={name}>
          {label}
        </Checkbox>

        <div className="flex items-center">
          <FaChevronRight className={"text-xs" + (expanded ? " rotate-90" : "")} />
          <span
            className={"ml-1 text-sm cursor-pointer " + (expanded ? "text-bonus" : "text-light-1")}
            onClick={onClickSeeDetails}
          >
            See details
          </span>
        </div>
      </div>

      <CollapseSpace active={expanded}>
        <div className="pt-2 flex justify-center">
          <div style={{ maxWidth: "18rem" }}>
            <Table>
              <Table.Tr>
                <Table.Th />
                <Table.Th className="text-primary-1">Old</Table.Th>
                <Table.Th className="text-primary-1">New</Table.Th>
              </Table.Tr>

              {children}
            </Table>
          </div>
        </div>
      </CollapseSpace>
    </div>
  );
}
