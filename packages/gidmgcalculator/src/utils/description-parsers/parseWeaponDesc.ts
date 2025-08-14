import { round } from "rond";
import { wrapText } from "./utils";

const scaleRefi = (base: number, refi: number, increment = base / 3) => round(base + increment * refi, 3);

export const parseWeaponDesc = (description: string, refi: number) => {
  return description.replace(/\{[\w \-,.%'"^$]+\}(#\[[kvm]\])?/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type?.slice(1, -1);
    let suffix = "";

    if (body[body.length - 1] === "%") {
      body = body.slice(0, -1);
      suffix = "%";
    }

    if (body.includes("^")) {
      const [base, increment] = body.split("^");
      return wrapText(scaleRefi(+base, refi, increment ? +increment : undefined) + suffix, type);
    }
    if (body.includes("$")) {
      const values = body.split("$");
      return wrapText(values[refi - 1] + suffix, type);
    }
    return wrapText(body + suffix, type);
  });
};
