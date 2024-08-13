import { BiLogInCircle } from "react-icons/bi";
import { FaCaretRight } from "react-icons/fa";
import { Button, clsx } from "rond";

import { GenshinImage } from "@Src/components";
import { useDispatch, useSelector } from "@Store/hooks";
import { changeOnFieldMember, selectActiveMember, selectOnFieldMember, updateSimulator } from "@Store/simulator-slice";
import { SimulationManager } from "@Simulator/ToolboxProvider";

interface PartyControlBarProps {
  className?: string;
  simulation: SimulationManager;
}
export function PartyControlBar({ className, simulation }: PartyControlBarProps) {
  const dispatch = useDispatch();
  const activeMemberCode = useSelector(selectActiveMember);
  const onFieldMemberCode = useSelector(selectOnFieldMember);

  const onClickMember = (code: number) => {
    dispatch(updateSimulator({ activeMember: code }));
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        {simulation?.partyData.map((data) => {
          return (
            <div key={data.code} className="relative">
              <GenshinImage
                className={clsx(
                  "w-14 h-14 rounded-circle shrink-0 cursor-default absolute top-0 right-0",
                  data.code === activeMemberCode && "bg-secondary-1"
                )}
                fallbackCls="p-2"
                imgCls="absolute"
                imgStyle={{
                  width: "160%",
                  maxWidth: "none",
                  top: "-64%",
                  left: "-35%",
                }}
                imgType="character"
                src={data.sideIcon}
                alt={data.name}
              />

              <div className="flex justify-end gap-2 cursor-default relative z-10 group">
                <div>
                  <div className="flex items-center relative">
                    <p className="font-semibold text-right truncate">{data.name}</p>
                    <span className="absolute right-full hidden group-hover:block">
                      <FaCaretRight />
                    </span>
                  </div>
                  {data.code !== onFieldMemberCode ? (
                    <div>
                      <Button
                        className="ml-auto mr-2 hover:text-primary-1"
                        title="Take the field"
                        size="medium"
                        boneOnly
                        icon={<BiLogInCircle className="text-2xl rotate-180" />}
                        onClick={() => {
                          dispatch(changeOnFieldMember(data.code));
                          onClickMember(data.code);
                        }}
                      />
                    </div>
                  ) : null}
                </div>

                <button className="w-14 h-14 shrink-0" onClick={() => onClickMember(data.code)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
