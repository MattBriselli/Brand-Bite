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
  image: string;
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
    description: "Known for slow-roasted beef, curly fries, Jamocha shakes, and rotating limited-time Wagyu and prime rib sandwiches.",
    accentColor: "#b91c1c",
  },
  {
    name: "Ben & Jerry's",
    slug: "ben-and-jerrys",
    letter: "B",
    segment: "Packaged Snacks",
    headquarters: "South Burlington, VT",
    signatureItem: "Topped & Core Pint Lineup",
    description: "Super-premium ice cream pints famous for dense mix-ins, ganache-topped layers, and seasonal limited batches.",
    accentColor: "#0284c7",
  },
  {
    name: "Burger King",
    slug: "burger-king",
    letter: "B",
    segment: "Fast Food",
    headquarters: "Miami, FL",
    signatureItem: "Flame-Broiled Whopper Melts",
    description: "Home of the Whopper, Chicken Fries, and frequent international-inspired limited-time burger builds.",
    accentColor: "#d97706",
  },
  {
    name: "Chick-fil-A",
    slug: "chick-fil-a",
    letter: "C",
    segment: "Fast Food",
    headquarters: "College Park, GA",
    signatureItem: "Honey Pepper Pimento Chicken Sandwich",
    description: "beloved for pressure-cooked chicken sandwiches, waffle fries, seasonal fruit milkshakes, and frosted lemonades.",
    accentColor: "#dc2626",
  },
  {
    name: "Culver's",
    slug: "culvers",
    letter: "C",
    segment: "Fast Food",
    headquarters: "Prairie du Sac, WI",
    signatureItem: "ButterBurgers & Fresh Frozen Custard",
    description: "Midwest favorite celebrated for seared-to-order ButterBurgers, Wisconsin cheese curds, and Pretzel Haus Pub Burgers.",
    accentColor: "#1d4ed8",
  },
  {
    name: "Doritos",
    slug: "doritos",
    letter: "D",
    segment: "Packaged Snacks",
    headquarters: "Plano, TX",
    signatureItem: "Bold Flavored Tortilla Chips",
    description: "Frito-Lay's flagship tortilla chip brand constantly testing sweet-heat, tangy fusion, and late-night mashup flavors.",
    accentColor: "#e11d48",
  },
  {
    name: "Krispy Kreme",
    slug: "krispy-kreme",
    letter: "K",
    segment: "Coffee & Bakery",
    headquarters: "Charlotte, NC",
    signatureItem: "Original Glazed & Seasonal Dozens",
    description: "Iconic doughnut shop rolling out themed limited-edition pastry collections and BOGO Hot Light promotions.",
    accentColor: "#be185d",
  },
  {
    name: "Lay's",
    slug: "lays",
    letter: "L",
    segment: "Packaged Snacks",
    headquarters: "Plano, TX",
    signatureItem: "Do Us A Flavor & Global Street Food Chips",
    description: "Classic and kettle-cooked potato chips featuring rotating restaurant collaborations and regional flavor drops.",
    accentColor: "#ca8a04",
  },
  {
    name: "McDonald's",
    slug: "mcdonalds",
    letter: "M",
    segment: "Fast Food",
    headquarters: "Chicago, IL",
    signatureItem: "McCrispy Strips & Collector Sauces",
    description: "Global fast-food leader rolling out new chicken formats, nostalgic sauce drops, and CosMc's-inspired beverage tests.",
    accentColor: "#ea580c",
  },
  {
    name: "Oreo",
    slug: "oreo",
    letter: "O",
    segment: "Packaged Snacks",
    headquarters: "East Hanover, NJ",
    signatureItem: "Limited Edition Sandwich Cookies",
    description: "Nabisco's legendary sandwich cookie with dual-layer cremes, popping candy inclusions, and bakery-inspired seasonal drops.",
    accentColor: "#1e3a8a",
  },
  {
    name: "Popeyes",
    slug: "popeyes",
    letter: "P",
    segment: "Fast Food",
    headquarters: "Miami, FL",
    signatureItem: "Louisiana Bone-In Wings & Crispy Tenders",
    description: "New Orleans-style fried chicken powerhouse specializing in bold marinades, flaky biscuits, and glazed wing flavors.",
    accentColor: "#ea580c",
  },
  {
    name: "Shake Shack",
    slug: "shake-shack",
    letter: "S",
    segment: "Fast Food",
    headquarters: "New York, NY",
    signatureItem: "Black Truffle & Korean Style Menu Runs",
    description: "Fine-casual burger stand known for Angus smash burgers, crinkle-cut fries, and hand-spun seasonal custard shakes.",
    accentColor: "#15803d",
  },
  {
    name: "Starbucks",
    slug: "starbucks",
    letter: "S",
    segment: "Coffee & Bakery",
    headquarters: "Seattle, WA",
    signatureItem: "Cortados, Shaken Espressos & Cold Foams",
    description: "Specialty coffee giant introducing seasonal espresso builds, cold foams, and bakery case pastries year-round.",
    accentColor: "#047857",
  },
  {
    name: "Taco Bell",
    slug: "taco-bell",
    letter: "T",
    segment: "Fast Food",
    headquarters: "Irvine, CA",
    signatureItem: "Cheesy Street Chalupas & Cantina Menu",
    description: "The undisputed king of fast-food menu innovation, toasted cheese shells, freeze flavors, and Cravings Box value bundles.",
    accentColor: "#7e22ce",
  },
  {
    name: "Trader Joe's",
    slug: "trader-joes",
    letter: "T",
    segment: "Grocery",
    headquarters: "Monrovia, CA",
    signatureItem: "Private-Label Frozen Appetizers & Snacks",
    description: "Cult-favorite neighborhood grocer packing its freezer aisles and snack shelves with inventive small-batch creations.",
    accentColor: "#047857",
  },
  {
    name: "Wendy's",
    slug: "wendys",
    letter: "W",
    segment: "Fast Food",
    headquarters: "Dublin, OH",
    signatureItem: "Spicy Chicken & Frosty Swirl Collabs",
    description: "Fresh never-frozen square beef burgers, fiery chicken sandwiches, Saucy Nuggs, and swirled Frosty desserts.",
    accentColor: "#dc2626",
  },
];

export const ARTICLES: Article[] = [
  {
    id: "art-1",
    slug: "review-taco-bell-toasted-cheddar-street-chalupas",
    title: "[SAMPLE] Review: Taco Bell — Toasted Cheddar Street Chalupas (Steak & Slow-Roasted Chicken)",
    subtitle: "Two bite-sized cheddar-crusted shells stuffed with onion, cilantro, and Creamy Jalapeno Ranch.",
    type: "Review",
    brand: "Taco Bell",
    brandSlug: "taco-bell",
    category: "Tacos & Burritos",
    publishedAt: "2026-11-13",
    publishedDateFormatted: "November 13, 2026",
    author: "Sample Author",
    image: "/images/taco-bell-street-chalupa.svg",
    imageAlt: "Illustration of Taco Bell Toasted Cheddar Street Chalupas with melted cheese crust and cilantro",
    excerpt:
      "[SAMPLE] Taco Bell doubles down on street-taco proportions with a two-pack of miniature chalupa shells fried with a layer of aged cheddar baked directly into the outer flatbread.",
    tags: ["Taco Bell", "Chalupa", "Steak", "Limited Time", "Fast Food Review"],
    isFeatured: true,
    ltoEndDate: "December 24, 2026",
    review: {
      rating: 8.8,
      verdict: "Must Buy",
      pricePaid: "$5.49 (2-pack)",
      availability: "Nationwide Limited-Time Offer (Fall/Winter 2026)",
      pros: [
        "Deeply savory, lacy fried cheddar exterior stays crisp even after a 10-minute drive home",
        "Fresh diced white onion and cilantro cut through the rich jalapeno ranch sauce",
        "Generous portion of cantina-style slow-roasted shredded chicken in each mini shell",
      ],
      cons: [
        "At $5.49 a la carte, ordering them outside the $9 Discovery Luxe Box feels steep",
        "Grease pools slightly at the bottom fold of the foil wrapper",
      ],
      nutrition: {
        servingSize: "2 Street Chalupas (218g)",
        calories: 570,
        caloriesFromFat: 280,
        totalFat: "31g",
        saturatedFat: "10g",
        transFat: "0.5g",
        cholesterol: "75mg",
        sodium: "1190mg",
        totalCarbs: "44g",
        dietaryFiber: "4g",
        sugars: "4g",
        protein: "28g",
      },
    },
    body: [
      "Taco Bell's latest limited-time drop combines two of its most reliable crowd-pleasers: the blistered cheddar shell technology from the Toasted Cheddar Chalupa and the double-layered, onion-and-cilantro-forward build of last summer's Cheesy Street Chalupas. Sold in pairs for $5.49 with your choice of marinated grilled steak or slow-roasted cantina chicken, they aim to replicate the two-bite satisfaction of a food-truck taco with unmistakable Taco Bell indulgence.",
      "Right out of the foil pouch, the aroma of toasted sharp cheddar hits first. Unlike a standard Chalupa Supreme where the flatbread puffs into a pillowy chew, these smaller 4.5-inch shells fry up noticeably stiffer and crispier. A thin layer of mozzarella and pepper jack cheese binds the outer cheddar-crusted shell to an inner warm tortilla, creating a contrasting crunch-then-chew bite that holds up remarkably well.",
      "Inside, Taco Bell skips the shredded iceberg lettuce and diced tomatoes entirely. Instead, the protein is dressed with a zesty Creamy Jalapeno Ranch sauce and crowned with a hefty pinch of raw diced white onions and fresh cilantro leaves. That restraint pays off: you actually taste the charred edges of the steak and the smoky, citrus-marinated chicken rather than a mouthful of wet lettuce.",
      "Overall, the Toasted Cheddar Street Chalupas earn one of our highest fast-food scores of the season. Grab them inside the $9 Discovery Box while they're on the menu board—they're crunchy, savory, and balanced by real aromatics.",
    ],
  },
  {
    id: "art-2",
    slug: "review-culvers-roasted-garlic-pretzel-pub-burger",
    title: "[SAMPLE] Review: Culver's — Roasted Garlic & Wisconsin Cheddar Pretzel Haus Pub Burger",
    subtitle: "Crisp-edged double ButterBurger patties meet a warm soft pretzel bun and garlic-herb cheese sauce.",
    type: "Review",
    brand: "Culver's",
    brandSlug: "culvers",
    category: "Burgers & Sandwiches",
    publishedAt: "2026-11-12",
    publishedDateFormatted: "November 12, 2026",
    author: "Sample Author",
    image: "/images/culvers-roasted-garlic-pub-burger.svg",
    imageAlt: "Illustration of Culver's Roasted Garlic Pretzel Haus Pub Burger with double patties and cheddar sauce",
    excerpt:
      "[SAMPLE] Culver's brings back its fan-favorite Pretzel Haus Pub series with a new roasted garlic and aged white cheddar cheese sauce, pickled red onions, and thick-cut bacon.",
    tags: ["Culver's", "Burger", "Pretzel Bun", "Cheese", "Fast Food Review"],
    ltoEndDate: "December 31, 2026",
    review: {
      rating: 9.1,
      verdict: "Must Buy",
      pricePaid: "$7.89 (Double)",
      availability: "Participating Culver's locations through December 31, 2026",
      pros: [
        "Soft Bavarian-style pretzel bun has genuine chew and coarse salt crunch without feeling dense",
        "Tangy pickled red onions slice right through the rich white cheddar and roasted garlic sauce",
        "Fresh-seared beef patties deliver signature lacy, caramelized edges",
      ],
      cons: [
        "Extremely high sodium count (1,480mg for the Double)",
        "Cheese sauce cools quickly if you don't eat it immediately in the dining room or car",
      ],
      nutrition: {
        servingSize: "1 Double Burger (294g)",
        calories: 840,
        caloriesFromFat: 430,
        totalFat: "48g",
        saturatedFat: "21g",
        transFat: "1.5g",
        cholesterol: "135mg",
        sodium: "1480mg",
        totalCarbs: "52g",
        dietaryFiber: "3g",
        sugars: "7g",
        protein: "49g",
      },
    },
    body: [
      "Whenever Culver's rotates a Pub Burger onto the menu, expectations are sky-high. The Wisconsin chain's Pretzel Haus Pub Burger has long been the gold standard for fast-food pretzel buns, and this late-autumn variation swaps the traditional mustard bistro sauce for a mellow, slow-roasted garlic mayo paired with warm aged Wisconsin cheddar sauce.",
      "The star of the build is the interplay between the sharp cheddar sauce, a slice of real mild cheddar, and a tangle of bright pink pickled red onions. Many fast-food garlic burgers lean on harsh garlic powder that lingers for hours; here, the garlic notes taste sweet, buttery, and oven-roasted.",
      "Stacked onto two seared-to-order beef patties with two strips of smoky thick-cut bacon, every bite hits salty, tangy, and umami notes in lockstep. If you have a Culver's within driving distance, put this at the top of your lunch rotation before it disappears at year's end.",
    ],
  },
  {
    id: "art-3",
    slug: "review-oreo-strawberry-shortcake-confetti-cookies",
    title: "[SAMPLE] Review: Nabisco — Limited Edition Strawberry Shortcake Cake Batter Oreo Cookies",
    subtitle: "Golden Oreo wafers sandwiching dual-layer strawberry shortcake and confetti cake batter creme.",
    type: "Review",
    brand: "Oreo",
    brandSlug: "oreo",
    category: "Cookies & Sweets",
    publishedAt: "2026-11-11",
    publishedDateFormatted: "November 11, 2026",
    author: "Sample Author",
    image: "/images/oreo-strawberry-shortcake.svg",
    imageAlt: "Illustration of Strawberry Shortcake Oreo cookies with pink creme and colorful sprinkles",
    excerpt:
      "[SAMPLE] Nabisco pairs its buttery Golden wafer with a side-by-side swirl of fruity strawberry creme and crunchy shortcake-crumb cake batter filling.",
    tags: ["Oreo", "Nabisco", "Cookies", "Strawberry", "Snack Review"],
    review: {
      rating: 8.2,
      verdict: "Worth Trying",
      pricePaid: "$4.79 (10.68 oz pack)",
      availability: "Limited Edition at major grocery and mass retailers nationwide",
      pros: [
        "Tiny shortcake cookie pearls embedded in the creme add a nostalgic ice-cream-bar crunch",
        "Golden vanilla wafer complements the berry flavor far better than chocolate would",
        "Double-Stuf thickness ensures the dual cremes don't get lost",
      ],
      cons: [
        "Sweetness level ramps up fast—two cookies feels like plenty in one sitting",
        "Smaller 10.68-ounce package size compared to standard family trays",
      ],
      nutrition: {
        servingSize: "2 cookies (29g)",
        calories: 140,
        caloriesFromFat: 55,
        totalFat: "6g",
        saturatedFat: "1.5g",
        transFat: "0g",
        cholesterol: "0mg",
        sodium: "95mg",
        totalCarbs: "21g",
        dietaryFiber: "0g",
        sugars: "13g",
        protein: "1g",
      },
    },
    body: [
      "Fruit-flavored Oreos can be hit-or-miss when paired with the classic bitter cocoa wafer, which is why Nabisco smartly opted for its Golden vanilla wafer as the foundation for the new Limited Edition Strawberry Shortcake Cake Batter Oreo.",
      "Peeling back the resealable top pull-tab reveals a vivid aroma reminiscent of Good Humor Strawberry Shortcake ice cream bars. That similarity isn't an accident: embedded directly inside the pink strawberry half of the creme are tiny, crunchy shortcake cookie bits that mimic the crumbly coating of the classic frozen novelty.",
      "The other half of the filling is a rich yellow cake-batter creme flecked with rainbow sprinkles. Eaten together, you get a bright pop of sweet-tart berry upfront followed by a warm vanilla-buttercream finish. Dunked in cold milk for four seconds, the Golden wafer softens into actual shortcake territory.",
    ],
  },
  {
    id: "art-4",
    slug: "news-mcdonalds-mccrispy-strips-creamy-chili-dip-nationwide",
    title: "[SAMPLE] News: McDonald's Expands McCrispy Chicken Strips & Creamy Chili Dip With New 6-Piece Box",
    subtitle: "Black-pepper-forward whole-muscle tenderloins get a larger sharing tier and two limited-time dipping cups.",
    type: "News",
    brand: "McDonald's",
    brandSlug: "mcdonalds",
    category: "Chicken & Wings",
    publishedAt: "2026-11-10",
    publishedDateFormatted: "November 10, 2026",
    author: "Sample Author",
    image: "/images/mcdonalds-mccrispy-strips-sauce.svg",
    imageAlt: "Illustration of McDonald's McCrispy Chicken Strips in red carton with Creamy Chili dipping sauce",
    excerpt:
      "[SAMPLE] Following strong demand for the 3-piece and 4-piece orders, McDonald's is adding a 6-piece McCrispy Strips box alongside a limited-edition Smoky Honey Mustard and Creamy Chili sauce.",
    tags: ["McDonald's", "Chicken Strips", "Fast Food News", "Dipping Sauce"],
    body: [
      "McDonald's is expanding its permanent chicken tender lineup this month with the rollout of a new 6-piece McCrispy Strips Meal and a pair of limited-time dipping sauces designed specifically to pair with the coarse black-pepper breading.",
      "Made with 100% whole-muscle white meat chicken tenderloins coated in a ridged, golden-brown batter, McCrispy Strips marked McDonald's long-awaited return to the chicken tender category after the pandemic-era retirement of Buttermilk Crispy Tenders. Starting November 16, customers will be able to order a 6-piece box ($8.49 suggested price, varies by market) that includes two sauce cups.",
      "Joining the signature Savory Chili McCrispy Strip Dip is a limited-run Roasted Garlic Parmesan dip and a Sweet Heat Peach glaze. Both sauces will remain in restaurants through mid-January while supplies last.",
    ],
  },
  {
    id: "art-5",
    slug: "review-trader-joes-spicy-tempura-seaweed-kimbap",
    title: "[SAMPLE] Review: Trader Joe's — Spicy Tempura Crunch & Gochujang Tofu Kimbap",
    subtitle: "The viral freezer-aisle Korean rice roll gets a fiery, crispy sequel with pickled radish and burdock root.",
    type: "Review",
    brand: "Trader Joe's",
    brandSlug: "trader-joes",
    category: "Frozen & Grocery",
    publishedAt: "2026-11-09",
    publishedDateFormatted: "November 09, 2026",
    author: "Sample Author",
    image: "/images/trader-joes-spicy-tempura-kimbap.svg",
    imageAlt: "Illustration of Trader Joe's sliced Spicy Tempura Kimbap rolls with vegetables and glazed tofu",
    excerpt:
      "[SAMPLE] After the original Frozen Kimbap spent months flying off freezer shelves, Trader Joe's introduces a spicy gochujang-glazed variation with tempura crunch.",
    tags: ["Trader Joe's", "Frozen Food", "Korean", "Spicy", "Grocery Review"],
    review: {
      rating: 8.9,
      verdict: "Must Buy",
      pricePaid: "$3.99 (8.1 oz roll)",
      availability: "Trader Joe's freezer aisle nationwide",
      pros: [
        "Pre-sliced nine-piece tray steams evenly in the microwave in just 2 minutes",
        "Pickled yellow radish (danmuji) and burdock root retain an impressive crisp-tender snap",
        "Sweet-and-spicy gochujang glaze packs legitimate warmth without overpowering the sesame oil rice",
      ],
      cons: [
        "Tempura batter flakes soften slightly during microwave steaming unless crisped in a skillet",
        "Frequently subject to two-per-customer store limits due to high turnover",
      ],
      nutrition: {
        servingSize: "1 full roll / 9 pieces (230g)",
        calories: 410,
        caloriesFromFat: 110,
        totalFat: "12g",
        saturatedFat: "1.5g",
        transFat: "0g",
        cholesterol: "0mg",
        sodium: "890mg",
        totalCarbs: "64g",
        dietaryFiber: "5g",
        sugars: "9g",
        protein: "11g",
      },
    },
    body: [
      "Few grocery items in recent memory have sparked the kind of freezer-aisle scavenger hunts that Trader Joe's original Tofu & Vegetable Kimbap achieved. Now, Trader Joe's has followed up its sleeper hit with a Spicy Tempura Crunch & Gochujang Tofu Kimbap—and at $3.99 for a nine-piece pre-sliced roll, it might be even better than the original.",
      "Like its predecessor, the roll is imported from South Korea and packaged in a segmented plastic tray that steams the sesame-oil-seasoned short-grain rice to fluffy perfection in two minutes flat. Once cooled for 60 seconds, the rice tightens up and holds together cleanly with chopsticks.",
      "Inside the roasted seaweed wrapper, strips of braised tofu are tossed in a fermented gochujang chili paste alongside sauteed greens, sweet carrots, crunchy burdock root, and tangy yellow pickled radish. Pro tip: sear the steamed slices face-down in a lightly oiled nonstick skillet for 45 seconds per side to wake up the toasted sesame aroma.",
    ],
  },
  {
    id: "art-6",
    slug: "lto-wendys-ghost-pepper-ranch-bacon-jalapeno-chicken",
    title: "[SAMPLE] Limited-Time Offer: Wendy's Debuts Double-Glazed Habanero & Ghost Pepper Ranch Chicken Sandwich",
    subtitle: "Pickled jalapeno coins, crispy fried onions, American & Pepper Jack cheese, and dual spicy sauces.",
    type: "Limited-Time Offer",
    brand: "Wendy's",
    brandSlug: "wendys",
    category: "Chicken & Wings",
    publishedAt: "2026-11-08",
    publishedDateFormatted: "November 08, 2026",
    author: "Sample Author",
    image: "/images/wendys-ghost-pepper-ranch-chicken.svg",
    imageAlt: "Illustration of Wendy's Spicy Habanero and Ghost Pepper Ranch Chicken Sandwich",
    excerpt:
      "[SAMPLE] Wendy's turns up the thermostat for late fall by layering its classic Spicy Chicken fillet with warm habanero glaze, Ghost Pepper Ranch, and sliced jalapenos.",
    tags: ["Wendy's", "Spicy Chicken", "Ghost Pepper", "Limited Time"],
    ltoEndDate: "December 20, 2026",
    review: {
      rating: 8.4,
      verdict: "Worth Trying",
      pricePaid: "$6.99 (Sandwich only)",
      availability: "Limited-Time Offer at US Wendy's locations through December 20, 2026",
      pros: [
        "Genuine multi-layered heat from cayenne breading, ghost pepper ranch, and fresh jalapeno slices",
        "Crispy fried onion tanglers add welcome crunch alongside the applewood smoked bacon",
        "Pepper Jack cheese melts nicely over the hot chicken breast",
      ],
      cons: [
        "Dual sauces can make the bottom bun slide around halfway through eating",
        "Nearly $7 for the sandwich alone before adding fries and a drink",
      ],
      nutrition: {
        servingSize: "1 Sandwich (268g)",
        calories: 720,
        caloriesFromFat: 340,
        totalFat: "38g",
        saturatedFat: "11g",
        transFat: "0.5g",
        cholesterol: "95mg",
        sodium: "1620mg",
        totalCarbs: "56g",
        dietaryFiber: "3g",
        sugars: "8g",
        protein: "36g",
      },
    },
    body: [
      "Wendy's Ghost Pepper Ranch has quietly evolved from a cult dipping cup into a full-fledged menu pillar. For this winter limited-time offer, Wendy's pairs that smoky, slow-building ranch with a sticky sweet-habanero glaze brushed directly onto its Spicy Chicken breast fillet.",
      "Unlike many fast-food items that promise heat and deliver mild paprika, this build packs a respectable punch. You get immediate vinegar brightness and crunch from three thick slices of pickled jalapeno, followed by the creamy, lingering burn of ghost pepper and the fruity sweetness of habanero.",
      "Our only word of caution: grab extra napkins. Between the glaze on the chicken and the ranch on the toasted bun, it's a wonderfully messy two-hander.",
    ],
  },
  {
    id: "art-7",
    slug: "review-doritos-korean-bbq-hot-honey-collisions",
    title: "[SAMPLE] Review: Doritos Collisions — Korean Chargrill BBQ & Tangy Hot Honey Tortilla Chips",
    subtitle: "Two distinct chip flavors share one bag: smoky bulgogi-style soy-garlic and floral chili-honey.",
    type: "Review",
    brand: "Doritos",
    brandSlug: "doritos",
    category: "Chips & Crisps",
    publishedAt: "2026-11-06",
    publishedDateFormatted: "November 06, 2026",
    author: "Sample Author",
    image: "/images/doritos-korean-bbq-hot-honey.svg",
    imageAlt: "Illustration of Doritos Korean BBQ and Hot Honey tortilla chips with seasoning",
    excerpt:
      "[SAMPLE] Doritos brings back its dual-flavor Collisions format with a savory-sweet pairing that shines brightest when you eat two chips at once.",
    tags: ["Doritos", "Chips", "Korean BBQ", "Hot Honey", "Snack Review"],
    review: {
      rating: 8.6,
      verdict: "Worth Trying",
      pricePaid: "$4.29 (9.25 oz bag)",
      availability: "Grocery stores, convenience stores, and Target nationwide",
      pros: [
        "Korean BBQ chip nails the roasted sesame, brown sugar, and charred soy-garlic profile",
        "Hot Honey chip delivers floral sweetness first before a clean red-pepper tingle kicks in",
        "Generous seasoning coverage across almost every chip in the bag",
      ],
      cons: [
        "Because both chips share the bag, a bit of flavor dust cross-pollinates between the two varieties",
      ],
      nutrition: {
        servingSize: "About 11 chips (28g)",
        calories: 150,
        caloriesFromFat: 70,
        totalFat: "8g",
        saturatedFat: "1g",
        transFat: "0g",
        cholesterol: "0mg",
        sodium: "210mg",
        totalCarbs: "18g",
        dietaryFiber: "1g",
        sugars: "2g",
        protein: "2g",
      },
    },
    body: [
      "The beauty of a Doritos Collisions bag is that you effectively get three snacks in one: Flavor A on its own, Flavor B on its own, and the intended mashup when you stack one of each together.",
      "The darker, reddish-brown triangles are the Korean Chargrill BBQ chips. They open with an unmistakable hit of toasted sesame oil, garlic powder, ginger, and caramelized soy sauce—easily one of the most convincing Asian-inspired savory seasonings Frito-Lay has produced in years.",
      "The lighter golden-orange triangles carry the Tangy Hot Honey seasoning, which leans into wildflower honey sweetness and apple cider vinegar tang before finishing with a cayenne warmth. Stacked together, the honey amplifies the chargrill notes into a sticky-rib-glaze flavor profile that disappears by the handful.",
    ],
  },
  {
    id: "art-8",
    slug: "news-starbucks-salted-pistachio-cortado-iced-oatmilk-foam",
    title: "[SAMPLE] News: Starbucks Adds Brown-Butter Pistachio Cortado & Iced Pistachio Matcha Crème for Winter",
    subtitle: "Hot 8-ounce Blonde Espresso cortados and salted brown-butter pistachio cold foam return earlier than usual.",
    type: "News",
    brand: "Starbucks",
    brandSlug: "starbucks",
    category: "Coffee & Drinks",
    publishedAt: "2026-11-05",
    publishedDateFormatted: "November 05, 2026",
    author: "Sample Author",
    image: "/images/starbucks-pistachio-cortado-foam.svg",
    imageAlt: "Illustration of Starbucks Iced Pistachio drink topped with salted brown-butter cold foam",
    excerpt:
      "[SAMPLE] Starbucks expands its espresso-forward Cortado platform with a new Salted Brown-Butter Pistachio Oatmilk Cortado alongside an Iced Pistachio Matcha Crème.",
    tags: ["Starbucks", "Coffee", "Pistachio", "Cortado", "Menu News"],
    body: [
      "After the breakout success of its Blonde Espresso Cortado menu earlier this year, Starbucks is giving its beloved winter pistachio sauce an espresso-centric upgrade.",
      "Headlining the preview lineup is the Salted Brown-Butter Pistachio Oatmilk Cortado: three ristretto shots of Starbucks Blonde Espresso combined with steamed oatmilk, sweet pistachio sauce, and a dusting of salted brown-butter cookie topping served exclusively in an 8-ounce short cup.",
      "For cold-beverage fans, the chain is also launching an Iced Pistachio Crème Matcha Latte crowned with an extra-thick layer of Pistachio Cream Cold Foam, letting customers pair nutty pistachio notes with ceremonial-grade matcha.",
    ],
  },
  {
    id: "art-9",
    slug: "deal-krispy-kreme-1-dollar-original-glazed-dozen-berry-shortcake",
    title: "[SAMPLE] Deal Alert: Get a $1 Original Glazed Dozen at Krispy Kreme With Any Specialty Dozen This Weekend",
    subtitle: "Plus a first look at the new Berry Shortcake & Biscoff Cookie Butter Swirl Doughnut collection.",
    type: "Deal",
    brand: "Krispy Kreme",
    brandSlug: "krispy-kreme",
    category: "Cookies & Sweets",
    publishedAt: "2026-11-04",
    publishedDateFormatted: "November 04, 2026",
    author: "Sample Author",
    image: "/images/krispy-kreme-berry-shortcake-dozen.svg",
    imageAlt: "Illustration of Krispy Kreme glazed doughnut with strawberry icing and cookie butter drizzle",
    excerpt:
      "[SAMPLE] Krispy Kreme Rewards members can score an Original Glazed dozen for just $1 when purchasing any full-priced dozen online or in-shop using code SWEETDOZEN.",
    tags: ["Krispy Kreme", "Deal", "Doughnuts", "Promo Code", "Limited Time"],
    ltoEndDate: "November 17, 2026",
    dealCode: "SWEETDOZEN",
    body: [
      "If you're hosting a weekend gathering or stocking the office breakroom, Krispy Kreme is running one of its best value promotions of the month: buy any full-priced dozen (including the new Berry Shortcake & Cookie Butter Specialty Dozen) and add a dozen Original Glazed doughnuts for just $1.",
      "To redeem the offer in-shop, scan your Krispy Kreme Rewards barcode at the register; for online pickup or delivery orders through the Krispy Kreme app, enter promo code SWEETDOZEN at checkout through Sunday, November 17.",
      "The featured specialty box includes four Strawberry Shortcake Kreme Filled doughnuts, four Biscoff Cookie Butter Iced Rings, and four Chocolate Iced Glazed doughnuts.",
    ],
  },
  {
    id: "art-10",
    slug: "review-popeyes-sweet-smoky-chipotle-glazed-wings",
    title: "[SAMPLE] Review: Popeyes — Sweet & Smoky Chipotle Bone-In Wings",
    subtitle: "Crispy marinated chicken wings tossed in a smoky adobo-honey glaze with a side of buttermilk ranch.",
    type: "Review",
    brand: "Popeyes",
    brandSlug: "popeyes",
    category: "Chicken & Wings",
    publishedAt: "2026-11-02",
    publishedDateFormatted: "November 02, 2026",
    author: "Sample Author",
    image: "/images/popeyes-sweet-smoky-chipotle-wings.svg",
    imageAlt: "Illustration of Popeyes Sweet and Smoky Chipotle Glazed Bone-In Chicken Wings",
    excerpt:
      "[SAMPLE] Popeyes adds a seventh flavor to its permanent wing roster, balancing its fiery ghost pepper marinade with a sticky, molasses-rich chipotle glaze.",
    tags: ["Popeyes", "Chicken Wings", "Chipotle", "Fast Food Review"],
    review: {
      rating: 7.9,
      verdict: "Solid Pick",
      pricePaid: "$5.99 (6-piece order)",
      availability: "Permanent menu addition at participating US Popeyes locations",
      pros: [
        "Breading stays remarkably craggy and audibly crunchy beneath the sticky chipotle sauce",
        "Underlying ghost pepper dry rub in the batter prevents the sweet glaze from tasting cloying",
        "At $5.99 for six bone-in wings, it's still one of the better wing values in fast food",
      ],
      cons: [
        "Wing drumettes and flats are on the smaller side",
        "Sauce coverage was uneven on two of the six pieces in our order",
      ],
      nutrition: {
        servingSize: "6 Wings (210g)",
        calories: 680,
        caloriesFromFat: 390,
        totalFat: "43g",
        saturatedFat: "13g",
        transFat: "1g",
        cholesterol: "185mg",
        sodium: "1540mg",
        totalCarbs: "31g",
        dietaryFiber: "2g",
        sugars: "14g",
        protein: "41g",
      },
    },
    body: [
      "Popeyes continues to expand its wing lineup at a rapid clip. Every bone-in wing at Popeyes starts with the same base—marinated in mild ghost pepper spices and hand-battered—before getting tossed in a finishing sauce or dry rub. The newest entrant, Sweet & Smoky Chipotle, aims squarely at fans who want campfire smokiness without overwhelming heat.",
      "The sauce itself is dark mahogany and viscous, clinging to the craggy ridges of the fried skin. You taste brown sugar, smoked paprika, and dried chipotle pepper in adobo right away, followed by the savory garlic-and-pepper kick of Popeyes' base breading.",
      "While the individual wings are relatively petite compared to a dedicated wing pub, the shatteringly crisp crust holds up better than almost any fast-food competitor.",
    ],
  },
];

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
