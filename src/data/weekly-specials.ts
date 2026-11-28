export type RotationCadence = "Weekly Drop" | "Monthly Drop" | "Seasonal";

export interface WeeklySpecial {
  id: string;
  brand: string;
  brandSlug: string;
  cadence: RotationCadence;
  headline: string;
  flavors?: string[];
  promoCode?: string;
  summary: string;
  windowLabel: string;
  goneByLabel?: string; // Prominent sardonic expiration callout (only when brand end date is verified!)
  verifiedAt: string;
  expiresAt?: string; // ISO date — expired dated specials auto-hide so nothing ever goes stale
  menuUrl: string;
  linkKind: "menu" | "site"; // Honest button label: "Live Menu" vs "Visit Site"
  accentColor: string;
}

export const WEEKLY_SPECIALS: WeeklySpecial[] = [
  {
    id: "crumbl-nov-23-2026",
    brand: "Crumbl",
    brandSlug: "crumbl",
    cadence: "Weekly Drop",
    headline: "Thanksgiving Week Rotating Lineup",
    flavors: [
      "Biscoff® Pie",
      "Cookies & Cream Pie",
      "Peanut Butter Cup Skillet ft. REESE'S",
      "Strawberry Cake",
      "Cornbread",
      "Caramel Pumpkin Cake",
    ],
    summary:
      "Crumbl's live weekly pink-box lineup — six rotating pies & cookies alongside Milk Chocolate Chip and Pink Sugar through Saturday night.",
    windowLabel: "Nov 23 – Nov 28",
    goneByLabel: "Try it before it's gone — ends Sat, Nov 28.",
    verifiedAt: "Nov 27, 2026",
    expiresAt: "2026-11-29T05:00:00Z",
    menuUrl: "https://crumblcookies.com/",
    linkKind: "menu",
    accentColor: "#ec4899",
  },
  {
    id: "popup-bagels-nov-2026",
    brand: "PopUp Bagels",
    brandSlug: "popup-bagels",
    cadence: "Weekly Drop",
    headline: "Sabatino Truffle & Brown Butter Sage Schmears",
    flavors: [
      "Sabatino Truffle Cream Cheese",
      "Brown Butter Sage Parmesan Butter",
    ],
    summary:
      "Hot whole bagels paired with PopUp Bagels' Thanksgiving-week Schmear of the Week lineup.",
    windowLabel: "This Week",
    goneByLabel: "Try it before it's gone — ends Sun, Nov 29.",
    verifiedAt: "Nov 27, 2026",
    expiresAt: "2026-12-01T05:00:00Z",
    menuUrl: "https://www.popupbagels.com/menu",
    linkKind: "menu",
    accentColor: "#d97706",
  },
  {
    id: "trader-joes-whats-new-nov-2026",
    brand: "Trader Joe's",
    brandSlug: "trader-joes",
    cadence: "Weekly Drop",
    headline: "What's New & Holiday Aisle Drops",
    flavors: [
      "Gingerbread Mini Sheet Cake",
      "Candy Cane Joe-Joe's",
      "Orange Grove Hard Cheese",
      "Turkey & Stuffing En Croute",
      "Mini Cranberry Pistachio Biscotti",
    ],
    summary:
      "Trader Joe's rotates limited-run bakery treats, frozen shortcuts, and holiday snacks onto its What's New shelf every week while store stock lasts.",
    windowLabel: "Updated Weekly",
    goneByLabel: "Available while your local store's stock lasts.",
    verifiedAt: "Nov 27, 2026",
    expiresAt: "2027-01-05T05:00:00Z",
    menuUrl: "https://www.traderjoes.com/home/products/whats-new",
    linkKind: "menu",
    accentColor: "#047857",
  },
  {
    id: "insomnia-ctc-menu",
    brand: "Insomnia Cookies",
    brandSlug: "insomnia-cookies",
    cadence: "Seasonal",
    headline: "Cinnamon Toast Crunch Limited Menu",
    flavors: ["Cinnamon Toast Crunch Cookies & Treats"],
    summary:
      "Late-night warm cookies and treats infused with Cinnamon Toast Crunch cereal — live across participating bakeries.",
    windowLabel: "On Menus Now",
    verifiedAt: "Nov 27, 2026",
    expiresAt: "2027-01-05T05:00:00Z",
    menuUrl: "https://insomniacookies.com/menu",
    linkKind: "menu",
    accentColor: "#7c3aed",
  },
  {
    id: "krispy-kreme-rudolph",
    brand: "Krispy Kreme",
    brandSlug: "krispy-kreme",
    cadence: "Seasonal",
    headline: "Rudolph the Red-Nosed Reindeer Collection",
    flavors: ["Rudolph-Decorated & Holiday Sprinkle Doughnuts"],
    summary:
      "Festive reindeer-themed glazed and filled doughnuts rolling out nationwide starting Nov 28 while supplies last.",
    windowLabel: "Starts Nov 28",
    goneByLabel: "Try it before it's gone — runs through Dec 25.",
    verifiedAt: "Nov 27, 2026",
    expiresAt: "2026-12-26T05:00:00Z",
    menuUrl: "https://www.krispykreme.com/menu/doughnuts",
    linkKind: "menu",
    accentColor: "#15803d",
  },
  {
    id: "jenis-holiday-pints",
    brand: "Jeni's Splendid Ice Creams",
    brandSlug: "jenis-ice-cream",
    cadence: "Seasonal",
    headline: "Holiday Pint Drops ($20 Off 6+ Pints)",
    promoCode: "TAKE20",
    summary:
      "Seasonal small-batch holiday pints plus $20 off 6+ pints with free shipping using code TAKE20 directly on Jeni's flavor menu.",
    windowLabel: "Holiday 2026 Run",
    verifiedAt: "Nov 27, 2026",
    expiresAt: "2027-01-10T05:00:00Z",
    menuUrl: "https://jenis.com/collections/all-flavors",
    linkKind: "menu",
    accentColor: "#dc2626",
  },
  {
    id: "dirty-dough-menu",
    brand: "Dirty Dough",
    brandSlug: "dirty-dough",
    cadence: "Weekly Drop",
    headline: "Super-Stuffed Cookie Menu",
    flavors: ["The Reverse", "Brookie", "Cookies n' Creme", "Peanut Butter Pie"],
    summary:
      "Layered, center-stuffed gourmet cookies alongside cinnamon rolls, waffle bites, and dirty drinks.",
    windowLabel: "On Menus Now",
    verifiedAt: "Nov 27, 2026",
    menuUrl: "https://www.dirtydoughcookies.com/menu/",
    linkKind: "menu",
    accentColor: "#b45309",
  },
  {
    id: "salt-and-straw-monthly",
    brand: "Salt & Straw",
    brandSlug: "salt-and-straw",
    cadence: "Monthly Drop",
    headline: "Monthly 5-Flavor Limited Ice Cream Series",
    summary:
      "Five small-batch culinary flavors rotating on the first Friday of every month in scoop shops and nationwide shipping.",
    windowLabel: "Rotates Monthly",
    verifiedAt: "Nov 27, 2026",
    menuUrl: "https://saltandstraw.com/",
    linkKind: "site",
    accentColor: "#0f766e",
  },
  {
    id: "magnolia-bakery-monthly",
    brand: "Magnolia Bakery",
    brandSlug: "magnolia-bakery",
    cadence: "Monthly Drop",
    headline: "Banana Pudding Flavor of the Month",
    summary:
      "Magnolia Bakery rotates a specialty Banana Pudding flavor every month alongside seasonal holiday cupcakes.",
    windowLabel: "Rotates Monthly",
    verifiedAt: "Nov 27, 2026",
    menuUrl: "https://www.magnoliabakery.com/",
    linkKind: "site",
    accentColor: "#be185d",
  },
];
