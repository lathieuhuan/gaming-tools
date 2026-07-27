import "rond";

declare module "rond" {
  interface DefaultImageFallbackProps {
    className?: string;
    type: "character" | "weapon" | "artifact" | "unknown";
  }
}
