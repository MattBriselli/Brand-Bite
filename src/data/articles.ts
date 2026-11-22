export type ArticleType = "Review" | "News" | "Limited-Time Offer" | "Deal";

export interface NutritionFacts {
  servingSize: string;
  calories: number;
  caloriesFromFat: number;
  totalFat: string;
  saturatedFat: string;
  transFat: string;
  cholesterol: string;
  sodium: string;
  totalCarbs: string;
  dietaryFiber: string;
  sugars: string;
  protein: string;
}

export interface ReviewSpec {
  rating: number; // out of 10
  verdict: "Must Buy" | "Worth Trying" | "Solid Pick" | "Mixed Bag" | "Skip It";
  pricePaid: string;
  availability: string;
  pros: string[];
  cons: string[];
  nutrition: NutritionFacts;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  type: ArticleType;
  brand: string;
  brandSlug: string;
  category:
    | "Burgers & Sandwiches"
    | "Tacos & Burritos"
    | "Chicken & Wings"
    | "Cookies & Sweets"
    | "Chips & Crisps"
    | "Coffee & Drinks"
    | "Frozen & Grocery";
  publishedAt: string;
  publishedDateFormatted: string;
  author: string;
  image: string | null;
  imageAlt: string;
  excerpt: string;
  tags: string[];
  isFeatured?: boolean;
  ltoEndDate?: string;
  dealCode?: string;
  review?: ReviewSpec;
  body: string[];
}

export interface BrandInfo {
  name: string;
  slug: string;
  letter: string;
  segment: "Fast Food" | "Packaged Snacks" | "Coffee & Bakery" | "Grocery";
  headquarters: string;
  signatureItem: string;
  description: string;
  accentColor: string;
}

export const BRANDS: BrandInfo[] = [
  {
    name: "Arby's",
    slug: "arbys",
    letter: "A",
    segment: "Fast Food",
    headquarters: "Sandy Springs, GA",
    signatureItem: "Smokehouse Brisket & Curly Fries",
    description:
      "Known for slow-roasted beef, curly fries, Jamocha shakes, and rotating limited-time Wagyu and prime rib sandwiches.",
    accentColor: "#b91c1c",
  },
  {
    name: "Ben & Jerry's",
    slug: "ben-and-jerrys",
    letter: "B",
    segment: "Packaged Snacks",
    headquarters: "South Burlington, VT",
    signatureItem: "Topped & Core Pint Lineup",
    description:
      "Super-premium ice cream pints famous for dense mix-ins, ganache-topped layers, and seasonal limited batches.",
    accentColor: "#0284c7",
  },
  {
    name: "Burger King",
    slug: "burger-king",
    letter: "B",
    segment: "Fast Food",
    headquarters: "Miami, FL",
    signatureItem: "Flame-Broiled Whopper Melts",
    description:
      "Home of the Whopper, Chicken Fries, and frequent international-inspired limited-time burger builds.",
    accentColor: "#d97706",
  },
  {
    name: "Chick-fil-A",
    slug: "chick-fil-a",
    letter: "C",
    segment: "Fast Food",
    headquarters: "College Park, GA",
    signatureItem: "Honey Pepper Pimento Chicken Sandwich",
    description:
      "Beloved for pressure-cooked chicken sandwiches, waffle fries, seasonal fruit milkshakes, and frosted lemonades.",
    accentColor: "#dc2626",
  },
  {
    name: "Culver's",
    slug: "culvers",
    letter: "C",
    segment: "Fast Food",
    headquarters: "Prairie du Sac, WI",
    signatureItem: "ButterBurgers & Fresh Frozen Custard",
    description:
      "Midwest favorite celebrated for seared-to-order ButterBurgers, Wisconsin cheese curds, and Pretzel Haus Pub Burgers.",
    accentColor: "#1d4ed8",
  },
  {
    name: "Doritos",
    slug: "doritos",
    letter: "D",
    segment: "Packaged Snacks",
    headquarters: "Plano, TX",
    signatureItem: "Bold Flavored Tortilla Chips",
    description:
      "Frito-Lay's flagship tortilla chip brand constantly testing sweet-heat, tangy fusion, and late-night mashup flavors.",
    accentColor: "#e11d48",
  },
  {
    name: "Krispy Kreme",
    slug: "krispy-kreme",
    letter: "K",
    segment: "Coffee & Bakery",
    headquarters: "Charlotte, NC",
    signatureItem: "Original Glazed & Seasonal Dozens",
    description:
      "Iconic doughnut shop rolling out themed limited-edition pastry collections and BOGO Hot Light promotions.",
    accentColor: "#be185d",
  },
  {
    name: "Lay's",
    slug: "lays",
    letter: "L",
    segment: "Packaged Snacks",
    headquarters: "Plano, TX",
    signatureItem: "Do Us A Flavor & Global Street Food Chips",
    description:
      "Classic and kettle-cooked potato chips featuring rotating restaurant collaborations and regional flavor drops.",
    accentColor: "#ca8a04",
  },
  {
    name: "McDonald's",
    slug: "mcdonalds",
    letter: "M",
    segment: "Fast Food",
    headquarters: "Chicago, IL",
    signatureItem: "McCrispy Strips & Collector Sauces",
    description:
      "Global fast-food leader rolling out new chicken formats, nostalgic sauce drops, and specialty beverage tests.",
    accentColor: "#ea580c",
  },
  {
    name: "Oreo",
    slug: "oreo",
    letter: "O",
    segment: "Packaged Snacks",
    headquarters: "East Hanover, NJ",
    signatureItem: "Limited Edition Sandwich Cookies",
    description:
      "Nabisco's legendary sandwich cookie with dual-layer cremes, popping candy inclusions, and bakery-inspired seasonal drops.",
    accentColor: "#1e3a8a",
  },
  {
    name: "Popeyes",
    slug: "popeyes",
    letter: "P",
    segment: "Fast Food",
    headquarters: "Miami, FL",
    signatureItem: "Louisiana Bone-In Wings & Crispy Tenders",
    description:
      "New Orleans-style fried chicken powerhouse specializing in bold marinades, flaky biscuits, and glazed wing flavors.",
    accentColor: "#ea580c",
  },
  {
    name: "Shake Shack",
    slug: "shake-shack",
    letter: "S",
    segment: "Fast Food",
    headquarters: "New York, NY",
    signatureItem: "Black Truffle & Korean Style Menu Runs",
    description:
      "Fine-casual burger stand known for Angus smash burgers, crinkle-cut fries, and hand-spun seasonal custard shakes.",
    accentColor: "#15803d",
  },
  {
    name: "Starbucks",
    slug: "starbucks",
    letter: "S",
    segment: "Coffee & Bakery",
    headquarters: "Seattle, WA",
    signatureItem: "Cortados, Shaken Espressos & Cold Foams",
    description:
      "Specialty coffee giant introducing seasonal espresso builds, cold foams, and bakery case pastries year-round.",
    accentColor: "#047857",
  },
  {
    name: "Taco Bell",
    slug: "taco-bell",
    letter: "T",
    segment: "Fast Food",
    headquarters: "Irvine, CA",
    signatureItem: "Street Chalupas & Cantina Chicken Menu",
    description:
      "Fast-food menu innovator known for toasted cheese shells, Baja Blast freezes, and Cravings Box value bundles.",
    accentColor: "#7e22ce",
  },
  {
    name: "Trader Joe's",
    slug: "trader-joes",
    letter: "T",
    segment: "Grocery",
    headquarters: "Monrovia, CA",
    signatureItem: "Private-Label Frozen Appetizers & Snacks",
    description:
      "Cult-favorite neighborhood grocer packing its freezer aisles and snack shelves with inventive small-batch creations.",
    accentColor: "#047857",
  },
  {
    name: "Wendy's",
    slug: "wendys",
    letter: "W",
    segment: "Fast Food",
    headquarters: "Dublin, OH",
    signatureItem: "Spicy Chicken & Frosty Swirl Collabs",
    description:
      "Fresh never-frozen square beef burgers, fiery chicken sandwiches, Saucy Nuggs, and swirled Frosty desserts.",
    accentColor: "#dc2626",
  },
];

// Original BrandBite editorial reviews — empty until real first-hand taste tests are published.
export const ARTICLES: Article[] = [];

export const CATEGORIES = [
  "All Categories",
  "Burgers & Sandwiches",
  "Tacos & Burritos",
  "Chicken & Wings",
  "Cookies & Sweets",
  "Chips & Crisps",
  "Coffee & Drinks",
  "Frozen & Grocery",
] as const;

export const ARTICLE_TYPES: ("All" | ArticleType)[] = [
  "All",
  "Review",
  "News",
  "Limited-Time Offer",
  "Deal",
];
