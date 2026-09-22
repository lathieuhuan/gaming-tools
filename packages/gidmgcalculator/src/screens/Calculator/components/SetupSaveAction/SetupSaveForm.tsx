import { ComponentProps, FormEvent, useState } from "react";
import { ExactOmit, Input } from "rond";

import type { CalcSetup } from "@/logic/calculator";

import { SCREEN_PATH } from "@/constants";
import { useRouter } from "@/lib/router";
import { useDispatch } from "@Store/hooks";
import { saveSetupThunk } from "@Store/thunks";

type SetupSaveFormProps = ExactOmit<
  ComponentProps<"form">,
  "className" | "children" | "onSubmit"
> & {
  setup: CalcSetup;
  isNewSetup: boolean;
  initialName: string;
  onFinish?: () => void;
};

export function SetupSaveForm({
  setup,
  isNewSetup,
  initialName,
  onFinish,
  ...props
}: SetupSaveFormProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [input, setInput] = useState(initialName);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const setupName = input.trim();

    if (setupName === "") {
      return;
    }

    dispatch(saveSetupThunk(setup, setupName));

    router.navigate({ to: SCREEN_PATH.SETUPS });

    onFinish?.();
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit} {...props}>
      <p className="mb-2 text-light-hint">
        {isNewSetup ? "Do you want to save this setup as" : "Do you want to update this setup"}
      </p>
      <Input
        className="text-center font-semibold"
        size="large"
        autoFocus
        value={input}
        maxLength={34}
        onChange={setInput}
      />
    </form>
  );
}
