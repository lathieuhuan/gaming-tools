import type { AppWeapon } from "@/types";
import domPurify from "dompurify";
import { Array_, round } from "ron-utils";
import { clsx } from "rond";

const ERROR_WORD = "[Error]";

const typeToCls: Record<string, string> = {
  k: "text-bonus", // key
  v: "text-bonus font-bold", // value
  m: "text-max", // max
  n: "text-light-hint", // note
  ms: "text-primary-1", // milestone
  anemo: "text-anemo",
  cryo: "text-cryo",
  dendro: "text-dendro",
  electro: "text-electro",
  geo: "text-geo",
  hydro: "text-hydro",
  pyro: "text-pyro",
};

export const coloredText = (text: string | number, type = "") => {
  return `<span class="${typeToCls[type] || ""}">${text}</span>`;
};

const EMBEDDED_WORD_REGEXP = /\{.+?\}(?:#\[\w*\])?/g;

type BodyTransform = (body: string, type: string) => string;

export const parseDescription = (description: string, bodyTransform?: BodyTransform) => {
  return domPurify.sanitize(description).replace(EMBEDDED_WORD_REGEXP, (match) => {
    let [body, type = ""] = match.split("#");
    body = body.slice(1, -1);
    type = type.slice(1, -1);

    if (bodyTransform) {
      body = bodyTransform(body, type);
    }

    return coloredText(body, type);
  });
};

// ========== WEAPON ==========

const scaleRefi = (base: number, refi: number, increment = base / 3) =>
  round(base + increment * refi, 3);

export const parseWeaponDesc = (description: string, refi: number) => {
  return parseDescription(description, (body) => {
    let suffix = "";

    if (body.at(-1) === "%") {
      body = body.slice(0, -1);
      suffix = "%";
    }

    if (body.includes("^")) {
      const [base, increment] = body.split("^");
      return scaleRefi(+base, refi, increment ? +increment : undefined) + suffix;
    }

    if (body.includes("|")) {
      const value = body.split("|").at(refi - 1);
      return value !== undefined ? value + suffix : ERROR_WORD;
    }

    return body + suffix;
  });
};

export const parseWeaponModDesc = (
  parentDescs: AppWeapon["descriptions"],
  childDescs: string | number | (string | number)[] | undefined = 0,
  refi: number,
) => {
  if (parentDescs?.length) {
    const descFrags = Array_.toArray(childDescs).map((frag) =>
      typeof frag === "string" ? frag : parentDescs[frag],
    );

    return parseWeaponDesc(clsx(descFrags), refi);
  }

  return null;
};

// ========== ARTIFACT ==========

export const parseArtifactDesc = (
  parentDescs: string[],
  childDescs: string | number | (string | number)[],
) => {
  const descFrags = Array_.toArray(childDescs).map((frag) =>
    typeof frag === "string" ? frag : parentDescs[frag],
  );

  return parseDescription(clsx(descFrags));
};
