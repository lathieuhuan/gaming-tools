import domPurify from "dompurify";
import { wrapText } from "./utils";

export const parseDescription = (description: string) => {
  return domPurify.sanitize(description).replace(/\{.+?\}#\[\w*\]/g, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    return wrapText(body, type);
  });
};
