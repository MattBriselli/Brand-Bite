export type RotationCadence = "Weekly Drop" | "Monthly Drop" | "Seasonal";

export interface WeeklySpecial {
  id: string;
  brand: string;
  brandSlug: string;
  cadence: RotationCadence;
  headline: string;
  summary: string;
  windowLabel: string;
  menuUrl: string;
  accentColor: string;
}

export const WEEKLY_SPECIALS: WeeklySpecial[] = [
  {
    id: "crumbl-weekly-lineup",
    brand: "Crumbl",
    brandSlug: "crumbl",
    cadence: "Weekly Drop",
    headline: "Weekly Rotating Cookie & Dessert Menu",
    summary:
      "Crumbl resets its pink-box lineup every Monday morning with limited-run cookies, pies, and specialty desserts that disappear Saturday night.",
    windowLabel: "Rotates Every Monday",
    menuUrl: "https://crumblcookies.com/",
    accentColor: "#ec4899",
  },
  {
    id: "popup-bagels-schmear",
    brand: "PopUp Bagels",
    brandSlug: "popup-bagels",
    cadence: "Weekly Drop",
    headline: "Schmear of the Week (Grip, Rip & Dip)",
    summary:
      "Fresh-baked whole bagels paired with PopUp Bagels' rotating weekly specialty schmear and butter collaborations.",
    windowLabel: "Rotates Weekly",
    menuUrl: "https://www.popupbagels.com/",
    accentColor: "#d97706",
  },
  {
    id: "insomnia-ctc-menu",
    brand: "Insomnia Cookies",
    brandSlug: "insomnia-cookies",
    cadence: "Seasonal",
    headline: "Cinnamon Toast Crunch Limited Menu",
    summary:
      "Late-night warm cookies and treats infused with Cinnamon Toast Crunch cereal — live across participating bakeries for a limited run.",
    windowLabel: "On Menus Now",
    menuUrl: "https://insomniacookies.com/",
    accentColor: "#7c3aed",
  },
  {
    id: "chip-city-weekly",
    brand: "Chip City",
    brandSlug: "chip-city",
    cadence: "Weekly Drop",
    headline: "Weekly Rotating Thick Cookie Lineup",
    summary:
      "Thick, gooey bakery-style cookies rotating every week across NYC and East Coast shops — from seasonal holiday bakes to nostalgic cereal flavors.",
    windowLabel: "Rotates Weekly",
    menuUrl: "https://chipcitycookies.com/",
    accentColor: "#2563eb",
  },
  {
    id: "krispy-kreme-rudolph",
    brand: "Krispy Kreme",
    brandSlug: "krispy-kreme",
    cadence: "Seasonal",
    headline: "Rudolph the Red-Nosed Reindeer Doughnut Collection",
    summary:
      "Holiday-decorated Rudolph and festive sprinkle doughnuts rolling out nationwide starting Nov 28 while supplies last.",
    windowLabel: "Holiday 2026 Run",
    menuUrl: "https://www.krispykreme.com/",
    accentColor: "#15803d",
  },
  {
    id: "dirty-dough-weekly",
    brand: "Dirty Dough",
    brandSlug: "dirty-dough",
    cadence: "Weekly Drop",
    headline: "Weekly Stuffed Cookie Specials",
    summary:
      "Layered, center-stuffed cookies with rotating weekly feature flavors alongside Dirty Dough's core lineup.",
    windowLabel: "Rotates Weekly",
    menuUrl: "https://dirtydoughcookies.com/",
    accentColor: "#b45309",
  },
  {
    id: "salt-and-straw-monthly",
    brand: "Salt & Straw",
    brandSlug: "salt-and-straw",
    cadence: "Monthly Drop",
    headline: "Monthly 5-Flavor Limited Ice Cream Series",
    summary:
      "Five wildly creative small-batch seasonal flavors rotating on the first Friday of every month in scoop shops and nationwide shipping.",
    windowLabel: "Rotates Monthly",
    menuUrl: "https://saltandstraw.com/",
    accentColor: "#0f766e",
  },
  {
    id: "jenis-seasonal-pints",
    brand: "Jeni's Splendid Ice Creams",
    brandSlug: "jenis-ice-cream",
    cadence: "Seasonal",
    headline: "Holiday & Limited-Batch Pint Collection",
    summary:
      "Seasonal small-batch pints and scoop-shop exclusives dropping for the winter holiday window.",
    windowLabel: "Holiday 2026 Run",
    menuUrl: "https://jenis.com/",
    accentColor: "#dc2626",
  },
];
