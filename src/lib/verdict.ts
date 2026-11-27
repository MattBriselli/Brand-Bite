import type { ReviewSpec } from "@/data/articles";

export function verdictBadgeClasses(verdict: ReviewSpec["verdict"]): string {
  switch (verdict) {
    case "Must Buy":
      return "bg-emerald-600 text-white";
    case "Worth Trying":
      return "bg-[#c2410c] text-white";
    case "Solid Pick":
      return "bg-sky-600 text-white";
    case "Mixed Bag":
      return "bg-amber-600 text-white";
    case "Skip It":
      return "bg-red-600 text-white";
  }
}
