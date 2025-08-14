import { wrapText } from "./utils";

export const parseArtifactDesc = (description: string) => {
  return description.replace(/\{[\w \-,%]+\}#\[[kvm]\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type?.slice(1, -1);
    return wrapText(body, type);
  });
};
