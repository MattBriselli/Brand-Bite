export type ArticleType = "Review" | "News" | "Limited-Time Offer" | "Deal";

export interface ReviewSpec {
  rating: number; // out of 10
  verdict: "Must Buy" | "Worth Trying" | "Solid Pick" | "Mixed Bag" | "Skip It";
  pricePaid: string;
  availability: string;
  pros: string[];
  cons: string[];
}

export type FoodCategory =
  | "Burgers & Sandwiches"
  | "Chicken & Wings"
  | "Tacos & Burritos"
  | "Pizza & Italian"
  | "Breakfast & Diners"
  | "Coffee & Drinks"
  | "Cookies & Sweets"
  | "Chips & Crisps"
  | "Frozen & Grocery";

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  type: ArticleType;
  brand: string;
  brandSlug: string;
  category: FoodCategory;
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
  segment:
    | "Fast Food"
    | "Casual & Diner"
    | "Coffee & Bakery"
    | "Packaged Snacks"
    | "Grocery";
  headquarters: string;
  signatureItem: string;
  description: string;
  accentColor: string;
}

export const BRANDS: BrandInfo[] = [
  {
    "name": "7 Brew Drive-Thru Coffee",
    "slug": "7-brew",
    "letter": "0-9",
    "segment": "Coffee & Bakery",
    "headquarters": "Fayetteville, AR",
    "signatureItem": "Blondie Espresso, 7 Energy & Seasonal Fizzes",
    "description": "High-speed drive-thru beverage stand famous for secret-menu flavor combinations, infused 7 Energy cans, and seasonal cold foam drops.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Aldi",
    "slug": "aldi",
    "letter": "A",
    "segment": "Grocery",
    "headquarters": "Batavia, IL",
    "signatureItem": "Aldi Finds, Clancy's Chips & Specially Selected Treats",
    "description": "Cult-favorite grocer dropping weekly Wednesday Aldi Finds across limited-batch cookies, seasonal dips, frozen appetizers, and Clancy's snack dupes.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Applebee's",
    "slug": "applebees",
    "letter": "A",
    "segment": "Casual & Diner",
    "headquarters": "Glendale, CA",
    "signatureItem": "Boneless Wings, Riblets & Mucho Cocktails",
    "description": "Neighborhood grill rolling out all-you-can-eat wing and riblet promotions, seasonal wing glazes, and holiday Dollarita/Mucho sips.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Arby's",
    "slug": "arbys",
    "letter": "A",
    "segment": "Fast Food",
    "headquarters": "Sandy Springs, GA",
    "signatureItem": "Smokehouse Brisket & Curly Fries",
    "description": "Known for slow-roasted beef, curly fries, Jamocha shakes, Potato Cakes, and rotating limited-time Wagyu and prime rib sandwiches.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Auntie Anne's",
    "slug": "auntie-annes",
    "letter": "A",
    "segment": "Coffee & Bakery",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Cinnamon Sugar Pretzel Nuggets & Lemonade Mixers",
    "description": "Mall and travel-plaza pretzel icon dropping sweet and spicy stuffed pretzel nuggets, Oreo toppings, and fruity lemonade refreshers.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Baskin-Robbins",
    "slug": "baskin-robbins",
    "letter": "B",
    "segment": "Coffee & Bakery",
    "headquarters": "Canton, MA",
    "signatureItem": "Flavor of the Month & Ice Cream Cakes",
    "description": "Classic 31-flavor scoop shop unveiling a brand-new Flavor of the Month every single month alongside holiday ice cream cakes and sundaes.",
    "accentColor": "#db2777"
  },
  {
    "name": "Ben & Jerry's",
    "slug": "ben-and-jerrys",
    "letter": "B",
    "segment": "Packaged Snacks",
    "headquarters": "South Burlington, VT",
    "signatureItem": "Topped & Core Pint Lineup",
    "description": "Super-premium ice cream pints famous for dense mix-ins, ganache-topped layers, and seasonal limited batches.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Blaze Pizza",
    "slug": "blaze-pizza",
    "letter": "B",
    "segment": "Fast Food",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Fast-Fire'd Artisanal Pizzas & Cheesy Bread",
    "description": "Build-your-own fast-casual pizzeria launching spicy hot-honey drizzles, cauliflower/keto crusts, and Pi Day $3.14 pizza events.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Bojangles",
    "slug": "bojangles",
    "letter": "B",
    "segment": "Fast Food",
    "headquarters": "Charlotte, NC",
    "signatureItem": "Cajun Filet Biscuit & Bo-Berry Desserts",
    "description": "Southern chicken-and-biscuits chain beloved for scratch buttermilk biscuits, Bo-Berry cobblers and cookies, and Pork Chop Griller returns.",
    "accentColor": "#d97706"
  },
  {
    "name": "Buc-ee's",
    "slug": "bucees",
    "letter": "B",
    "segment": "Casual & Diner",
    "headquarters": "Lake Jackson, TX",
    "signatureItem": "Sliced Smoked Brisket Sandwiches, Beaver Nuggets & Fudge",
    "description": "Texas-born travel center phenomenon famous for fresh-chopped brisket on the board, sweet corn-puff Beaver Nuggets, kolaches, and seasonal fudge flavors.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Buffalo Wild Wings",
    "slug": "buffalo-wild-wings",
    "letter": "B",
    "segment": "Casual & Diner",
    "headquarters": "Atlanta, GA",
    "signatureItem": "26+ Wing Sauces, Dry Rubs & B-Dubs GO",
    "description": "Sports-bar wing leader constantly rotating limited-edition sauces (Hot Honey, Bourbon, Doritos) and BOGO wing nights.",
    "accentColor": "#ca8a04"
  },
  {
    "name": "Burger King",
    "slug": "burger-king",
    "letter": "B",
    "segment": "Fast Food",
    "headquarters": "Miami, FL",
    "signatureItem": "Flame-Broiled Whopper Melts & Chicken Fries",
    "description": "Home of the Whopper, Chicken Fries, colorful movie-collab buns, and frequent international-inspired limited-time burger builds.",
    "accentColor": "#d97706"
  },
  {
    "name": "Captain D's",
    "slug": "captain-ds",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Nashville, TN",
    "signatureItem": "Batter-Dipped Fish, Lobster Rolls & Funnel Cake Stix",
    "description": "Fast-food seafood staple known for seasonal Lobster Rolls, Giant Fish Sandwiches, Coconut Shrimp, and sweet Funnel Cake Stix.",
    "accentColor": "#0369a1"
  },
  {
    "name": "Caribou Coffee",
    "slug": "caribou-coffee",
    "letter": "C",
    "segment": "Coffee & Bakery",
    "headquarters": "Minneapolis, MN",
    "signatureItem": "Crafted Press, Campfire Mocha & Waffle Sandwiches",
    "description": "Midwest coffeehouse favorite serving real melted-chocolate mochas, Iced Crafted Press coffees, and seasonal maple/pumpkin espresso drinks.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Carl's Jr.",
    "slug": "carls-jr",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Franklin, TN",
    "signatureItem": "Western Bacon Cheeseburger & El Diablo",
    "description": "West Coast charbroiled burger chain famous for over-the-top onion-ring burgers, jalapeno popper builds, and late-night munchie packs.",
    "accentColor": "#d97706"
  },
  {
    "name": "CAVA",
    "slug": "cava",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Washington, DC",
    "signatureItem": "Harissa Honey Chicken Bowls & Flavored Pita Chips",
    "description": "Mediterranean fast-casual sensation drawing massive lines for Grilled Steak bowls, crazy feta dips, and seasoned pita chip drops.",
    "accentColor": "#b45309"
  },
  {
    "name": "Checkers & Rally's",
    "slug": "checkers-rallys",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Tampa, FL",
    "signatureItem": "Famous Seasoned Fries, Big Buford & Funnel Cake Fries",
    "description": "Double drive-thru burger stand rolling out fry-seasoned chicken tenders, Mother Cruncher sandwiches, and indulgent Funnel Cake Fries.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Cheetos",
    "slug": "cheetos",
    "letter": "C",
    "segment": "Packaged Snacks",
    "headquarters": "Plano, TX",
    "signatureItem": "Flamin' Hot Crunchy, Puffs & Limited-Edition Shapes",
    "description": "Frito-Lay cheese-snack icon rolling out Flamin' Hot mashups, Buffalo and Pickle flavor drops, Pretzel Cheetos, and fast-food chain menu crossovers.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Chick-fil-A",
    "slug": "chick-fil-a",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "College Park, GA",
    "signatureItem": "Honey Pepper Pimento Sandwich & Seasonal Shakes",
    "description": "Beloved for pressure-cooked chicken sandwiches, waffle fries, Peach and Peppermint milkshakes, and seasonal frosted lemonades.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Chili's",
    "slug": "chilis",
    "letter": "C",
    "segment": "Casual & Diner",
    "headquarters": "Dallas, TX",
    "signatureItem": "Triple Dipper, Big Smasher & Margarita of the Month",
    "description": "Casual-dining powerhouse dominating food social media with Nashville Hot Mozzarella Sticks, the Big Smasher burger, and monthly margaritas.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Chipotle",
    "slug": "chipotle",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Newport Beach, CA",
    "signatureItem": "Chicken al Pastor, Smoked Brisket & Burrito Bowls",
    "description": "Fast-casual Mexican leader whose limited-time protein launches (Smoked Brisket, Carne Asada, Chicken al Pastor) spark nationwide hype.",
    "accentColor": "#78350f"
  },
  {
    "name": "Chips Ahoy!",
    "slug": "chips-ahoy",
    "letter": "C",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Chewy, Chunky & Candy-Loaded Limited Editions",
    "description": "Nabisco chocolate-chip cookie staple constantly releasing Hershey's, Reese's, M&M's, and caramel-drizzled mini and chewy limited-edition packs.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Church's Texas Chicken",
    "slug": "churchs-chicken",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Honey-Butter Biscuits & Smokehouse Fried Chicken",
    "description": "Bold Southern fried chicken chain releasing smoky bourbon-glazed chicken, spicy jalapeno bombers, and fruit cobblers.",
    "accentColor": "#b45309"
  },
  {
    "name": "Cinnabon",
    "slug": "cinnabon",
    "letter": "C",
    "segment": "Coffee & Bakery",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Classic Makara Cinnamon Rolls & Churro Swirls",
    "description": "World-famous bakery behind warm frosted cinnamon rolls, Cookie BonBites, Biscoff/Oreo Chillattas, and fast-food dessert collaborations.",
    "accentColor": "#1e3a8a"
  },
  {
    "name": "Cold Stone Creamery",
    "slug": "cold-stone",
    "letter": "C",
    "segment": "Coffee & Bakery",
    "headquarters": "Scottsdale, AZ",
    "signatureItem": "Granite-Slab Mix-In Ice Cream Creations",
    "description": "Super-premium scoop shop known for movie, Nintendo, and cookie-butter limited-time Creations folded on a frozen granite stone.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Costco",
    "slug": "costco",
    "letter": "C",
    "segment": "Grocery",
    "headquarters": "Issaquah, WA",
    "signatureItem": "Food Court Double Chunk Cookie, Chicken Bake & Bakery Drops",
    "description": "Warehouse giant whose $1.50 hot dog combo, new Food Court sandwiches/cookies, and giant Kirkland Signature bakery desserts spark instant nationwide buzz.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Cracker Barrel",
    "slug": "cracker-barrel",
    "letter": "C",
    "segment": "Casual & Diner",
    "headquarters": "Lebanon, TN",
    "signatureItem": "Hashbrown Casserole, Biscuits & Seasonal Pies",
    "description": "Country-store diner serving seasonal stuffed cheesecake pancakes, Cinnamon Roll Pie, and holiday fried-turkey platters.",
    "accentColor": "#92400e"
  },
  {
    "name": "Crumbl",
    "slug": "crumbl",
    "letter": "C",
    "segment": "Coffee & Bakery",
    "headquarters": "Lindon, UT",
    "signatureItem": "Weekly Rotating Pink-Box Cookies & Cakes",
    "description": "America's fastest-moving dessert LTO machine, dropping an entirely new lineup of oversized gourmet cookies, tres leches, and pies every Monday.",
    "accentColor": "#ec4899"
  },
  {
    "name": "Culver's",
    "slug": "culvers",
    "letter": "C",
    "segment": "Fast Food",
    "headquarters": "Prairie du Sac, WI",
    "signatureItem": "ButterBurgers, CurderBurger & Fresh Frozen Custard",
    "description": "Midwest favorite celebrated for seared-to-order ButterBurgers, Wisconsin cheese curds, CurderBurger drops, and Pretzel Haus Pub Burgers.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Dairy Queen",
    "slug": "dairy-queen",
    "letter": "D",
    "segment": "Fast Food",
    "headquarters": "Bloomington, MN",
    "signatureItem": "Blizzard of the Month & Signature Stackburgers",
    "description": "Soft-serve and burger icon releasing seasonal Summer and Fall Blizzard menus, Dipped Cones, and sauced chicken strip baskets.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Dave's Hot Chicken",
    "slug": "daves-hot-chicken",
    "letter": "D",
    "segment": "Fast Food",
    "headquarters": "Pasadena, CA",
    "signatureItem": "Nashville-Style Hot Chicken Sliders, Tenders & Bites",
    "description": "Rapidly expanding hot-chicken sensation serving Reaper-level spiced sliders, Dave's Bites, loaded fries, and slushers.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Del Taco",
    "slug": "del-taco",
    "letter": "D",
    "segment": "Fast Food",
    "headquarters": "Lake Forest, CA",
    "signatureItem": "Birria Ramen, Epic Burritos & Crinkle-Cut Fries",
    "description": "West Coast Mexican-and-burger drive-thru famous for birria ramen, crispy jumbo shrimp tacos, stuffed quesadilla tacos, and mini shakes.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Denny's",
    "slug": "dennys",
    "letter": "D",
    "segment": "Casual & Diner",
    "headquarters": "Spartanburg, SC",
    "signatureItem": "Grand Slams, Stuffed Pancakes & Pop-Culture Collabs",
    "description": "24/7 diner rolling out movie and gaming collab menus, Cinnamon Roll Pancakes, brisket melts, and value Everyday Slam bundles.",
    "accentColor": "#d97706"
  },
  {
    "name": "Domino's",
    "slug": "dominos",
    "letter": "D",
    "segment": "Fast Food",
    "headquarters": "Ann Arbor, MI",
    "signatureItem": "New York Style Crust, Loaded Tots & Lava Cakes",
    "description": "Global pizza delivery giant launching Stuffed Cheesy Breads, Loaded Tots, Five Cheese Mac & Cheese, and Emergency Pizza deals.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Doritos",
    "slug": "doritos",
    "letter": "D",
    "segment": "Packaged Snacks",
    "headquarters": "Plano, TX",
    "signatureItem": "Bold Flavored Tortilla Chips & Collisions",
    "description": "Frito-Lay's flagship tortilla chip brand constantly testing sweet-heat, tangy fusion, and late-night restaurant mashup flavors.",
    "accentColor": "#e11d48"
  },
  {
    "name": "Dunkin'",
    "slug": "dunkin",
    "letter": "D",
    "segment": "Coffee & Bakery",
    "headquarters": "Canton, MA",
    "signatureItem": "Seasonal Donuts, Cold Foam & Dunkin' Refreshers",
    "description": "America's morning ritual, dropping huge seasonal waves of specialty donuts, Munchkins buckets, Sparkd' Energy, and flavored iced coffees.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Dutch Bros Coffee",
    "slug": "dutch-bros",
    "letter": "D",
    "segment": "Coffee & Bakery",
    "headquarters": "Tempe, AZ",
    "signatureItem": "Rebel Energy Drinks, Golden Eagle & Boba Drops",
    "description": "Cult drive-thru coffee and energy chain releasing colorful monthly drink specials, popping boba toppings, and Soft Top cold foams.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Einstein Bros. Bagels",
    "slug": "einstein-bros",
    "letter": "E",
    "segment": "Coffee & Bakery",
    "headquarters": "Lakewood, CO",
    "signatureItem": "Gourmet Bagel Egg Sandwiches & Schmears",
    "description": "Fresh-baked bagel shop introducing Country Bagels & Gravy, Texas Brisket egg sandwiches, and sweet French Toast bagels.",
    "accentColor": "#b45309"
  },
  {
    "name": "El Pollo Loco",
    "slug": "el-pollo-loco",
    "letter": "E",
    "segment": "Fast Food",
    "headquarters": "Costa Mesa, CA",
    "signatureItem": "Citrus-Marinated Fire-Grilled Chicken & Tostadas",
    "description": "Fire-grilled Mexican chicken chain turning out Birria Crunchadillas, Double Pollo Salads, Stuffed Quesadillas, and seasonal horchatas.",
    "accentColor": "#d97706"
  },
  {
    "name": "Fazoli's",
    "slug": "fazolis",
    "letter": "F",
    "segment": "Fast Food",
    "headquarters": "Lexington, KY",
    "signatureItem": "Warm Garlic Breadsticks & Baked Pasta",
    "description": "Quick-service Italian drive-thru known for unlimited garlic breadsticks, Pizza Baked Spaghetti, and indulgent cheesecake slices.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Firehouse Subs",
    "slug": "firehouse-subs",
    "letter": "F",
    "segment": "Fast Food",
    "headquarters": "Jacksonville, FL",
    "signatureItem": "Hook & Ladder & Steamed Meatball Subs",
    "description": "Hot-sub specialist steaming hearty deli meats and cheeses for Pepperoni Pizza Meatball Subs, Smoked Brisket, and spicy barbecue builds.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "First Watch",
    "slug": "first-watch",
    "letter": "F",
    "segment": "Casual & Diner",
    "headquarters": "Bradenton, FL",
    "signatureItem": "Million Dollar Bacon & Seasonal Brunch Menus",
    "description": "Daytime brunch cafe unveiling five chef-driven seasonal menus a year featuring Barbacoa Chilaquiles, Lemon Ricotta Pancakes, and fresh juices.",
    "accentColor": "#15803d"
  },
  {
    "name": "Freddy's",
    "slug": "freddys",
    "letter": "F",
    "segment": "Fast Food",
    "headquarters": "Wichita, KS",
    "signatureItem": "Crispy-Edge Steakburgers, Shoestring Fries & Concretes",
    "description": "Steakburger and frozen-custard favorite serving Pretzel Bacon BBQ burgers, Prime Rib steakburgers, and seasonal pie concretes.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Habit Burger & Grill",
    "slug": "habit-burger",
    "letter": "H",
    "segment": "Fast Food",
    "headquarters": "Irvine, CA",
    "signatureItem": "Charburgers, Tempura Green Beans & Seasonal Shakes",
    "description": "Open-flame chargrilled burger chain (part of Yum! Brands) crafting French Onion Charburgers, Crispy Chicken Bites, and fruit shakes.",
    "accentColor": "#92400e"
  },
  {
    "name": "Hardee's",
    "slug": "hardees",
    "letter": "H",
    "segment": "Fast Food",
    "headquarters": "Franklin, TN",
    "signatureItem": "Made-From-Scratch Biscuits & Charbroiled Thickburgers",
    "description": "Midwest and Southern sibling to Carl's Jr. famous for Maple Biscuits, Frisco Burgers, Pork Chop Biscuits, and hand-breaded chicken tenders.",
    "accentColor": "#d97706"
  },
  {
    "name": "Hershey's",
    "slug": "hersheys",
    "letter": "H",
    "segment": "Packaged Snacks",
    "headquarters": "Hershey, PA",
    "signatureItem": "Seasonal Hershey's Kisses, Stuffed Bars & Bites",
    "description": "Classic American chocolate maker unveiling Sugar Cookie, Cinnamon Toast, and caramel-stuffed Kisses and bars for every major snack season.",
    "accentColor": "#78350f"
  },
  {
    "name": "Hungry Howie's",
    "slug": "hungry-howies",
    "letter": "H",
    "segment": "Fast Food",
    "headquarters": "Madison Heights, MI",
    "signatureItem": "Flavored Crust Pizza & Howie Bread",
    "description": "Home of the original Flavored Crust pizza, rotating bold limited-time edges like Dill Pickle, Hot Honey, and Bacon Cheddar.",
    "accentColor": "#eab308"
  },
  {
    "name": "IHOP",
    "slug": "ihop",
    "letter": "I",
    "segment": "Casual & Diner",
    "headquarters": "Glendale, CA",
    "signatureItem": "Buttermilk Pancakes, Stuffed French Toast & Pancake of the Month",
    "description": "Iconic all-day breakfast diner rolling out monthly limited-time pancake stacks, movie tie-in menus, crepes, and late-night value platters.",
    "accentColor": "#0369a1"
  },
  {
    "name": "Jack in the Box",
    "slug": "jack-in-the-box",
    "letter": "J",
    "segment": "Fast Food",
    "headquarters": "San Diego, CA",
    "signatureItem": "Two Tacos, Munchie Meals & Sourdough Jack",
    "description": "Unapologetic king of late-night fast-food mashups, Monster Tacos, Chicken Tater Melts, Red Bull infusions, and celebrity Munchie Meals.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Jersey Mike's",
    "slug": "jersey-mikes",
    "letter": "J",
    "segment": "Fast Food",
    "headquarters": "Manasquan, NJ",
    "signatureItem": "Mike's Way Cold Subs & Grilled Cheesesteaks",
    "description": "Fresh-sliced sub shop rolling out limited-time Pastrami, Smoky Southwestern Cheesesteaks, and spicy relish toppings.",
    "accentColor": "#1e3a8a"
  },
  {
    "name": "Jet's Pizza",
    "slug": "jets-pizza",
    "letter": "J",
    "segment": "Fast Food",
    "headquarters": "Sterling Heights, MI",
    "signatureItem": "8-Corner Detroit-Style Deep Dish & Turbo Crust",
    "description": "Crispy-cornered Detroit-style pizza chain introducing Popcorn Chicken Pizzas, Hot Honeypepperoni builds, and cinnamon sticks.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Jimmy John's",
    "slug": "jimmy-johns",
    "letter": "J",
    "segment": "Fast Food",
    "headquarters": "Champaign, IL",
    "signatureItem": "Toasted Subs, Picklewich & Seasonal Cookies",
    "description": "Freaky-fast sandwich shop making headlines with viral Picklewiches, Firecracker Wraps, new toasted sub builds, and stuffed cookies.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Jollibee",
    "slug": "jollibee",
    "letter": "J",
    "segment": "Fast Food",
    "headquarters": "West Covina, CA",
    "signatureItem": "Chickenjoy, Jolly Spaghetti & Peach Mango Pie",
    "description": "Cult-beloved Filipino-founded fried chicken chain celebrated for ultra-crispy Chickenjoy, sweet-style spaghetti, Ube Pies, and Aloha Burgers.",
    "accentColor": "#dc2626"
  },
  {
    "name": "KFC",
    "slug": "kfc",
    "letter": "K",
    "segment": "Fast Food",
    "headquarters": "Louisville, KY",
    "signatureItem": "Original Recipe Chicken, Saucy Nuggets & Mac Bowls",
    "description": "Colonel Sanders' fried chicken flagship dropping Chizza mashups, Sticky Chicky/Georgia Gold Saucy Nuggets, and cherry pie poppers.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Krispy Kreme",
    "slug": "krispy-kreme",
    "letter": "K",
    "segment": "Coffee & Bakery",
    "headquarters": "Charlotte, NC",
    "signatureItem": "Original Glazed & Pop-Culture Specialty Dozens",
    "description": "Iconic Hot Light doughnut shop rolling out monthly themed pastry collections (Hershey's, Biscoff, Warner Bros.) and $1 dozen promos.",
    "accentColor": "#be185d"
  },
  {
    "name": "Krystal",
    "slug": "krystal",
    "letter": "K",
    "segment": "Fast Food",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Steamed Square Sliders, Chili Cheese Pups & Glaze Bombs",
    "description": "Southern steamed-slider institution known for late-night sackfuls, biscuit scramblers, Side Chik tenders, and glazed donut sliders.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Lay's",
    "slug": "lays",
    "letter": "L",
    "segment": "Packaged Snacks",
    "headquarters": "Plano, TX",
    "signatureItem": "Do Us A Flavor & Global Street Food Chips",
    "description": "Classic and kettle-cooked potato chips featuring rotating restaurant collaborations, international street-food seasonings, and holiday bags.",
    "accentColor": "#ca8a04"
  },
  {
    "name": "Little Caesars",
    "slug": "little-caesars",
    "letter": "L",
    "segment": "Fast Food",
    "headquarters": "Detroit, MI",
    "signatureItem": "Crazy Puffs, Pretzel Crust Pizza & Crazy Bread",
    "description": "Value-and-novelty pizza innovator behind handheld Crazy Puffs, Cheddar Cheese Sauce Pretzel Crust returns, and Slices-N-Stix.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Long John Silver's",
    "slug": "long-john-silvers",
    "letter": "L",
    "segment": "Fast Food",
    "headquarters": "Louisville, KY",
    "signatureItem": "Battered Alaskan Pollock, Hushpuppies & Shrimp Baskets",
    "description": "Quick-service seafood classic rolling out Coconut Butterfly Shrimp, Lobster Bites, grilled salmon bowls, and extra-crunchies sides.",
    "accentColor": "#0369a1"
  },
  {
    "name": "M&M's",
    "slug": "mms",
    "letter": "M",
    "segment": "Packaged Snacks",
    "headquarters": "Newark, NJ",
    "signatureItem": "Peanut Butter Mega, Pop'd Freeze-Dried & Seasonal Mixes",
    "description": "Mars candy powerhouse debuting freeze-dried Pop'd candies, Toasty Holiday Peanut, Brownie Crunch, and yearly flavor-vote limited editions.",
    "accentColor": "#eab308"
  },
  {
    "name": "Marco's Pizza",
    "slug": "marcos-pizza",
    "letter": "M",
    "segment": "Fast Food",
    "headquarters": "Toledo, OH",
    "signatureItem": "Old World Pepperoni Magnifico & Pizzoli",
    "description": "Fast-growing pizza chain known for crispy-cupped Old World Pepperoni, handheld baked Pizzolis, and Mike's Hot Honey drizzles.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "McDonald's",
    "slug": "mcdonalds",
    "letter": "M",
    "segment": "Fast Food",
    "headquarters": "Chicago, IL",
    "signatureItem": "McCrispy Strips, Collector Sauces & McFlurry Drops",
    "description": "Global fast-food leader rolling out new chicken formats, nostalgic sauce drops, Collector Meals, and specialty beverage tests.",
    "accentColor": "#ea580c"
  },
  {
    "name": "MOD Pizza",
    "slug": "mod-pizza",
    "letter": "M",
    "segment": "Fast Food",
    "headquarters": "Bellevue, WA",
    "signatureItem": "Artisan Individual Pizzas & Seasonal No Name Cakes",
    "description": "Made-on-demand pizza shop famous for seasonal Pocket Pies and quarterly limited-edition No Name Cake dessert flavors.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Moe's Southwest Grill",
    "slug": "moes",
    "letter": "M",
    "segment": "Fast Food",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Homewrecker Burritos & Famous Queso",
    "description": "Southwestern fast-casual grill launching Tequila Lime Chicken, birria tacos, crunchwrap-style stacks, and Free Queso Day giveaways.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Mountain Dew",
    "slug": "mountain-dew",
    "letter": "M",
    "segment": "Packaged Snacks",
    "headquarters": "Purchase, NY",
    "signatureItem": "Baja Blast, VooDEW Mystery & Exclusive Chain Fountains",
    "description": "Undisputed king of limited-edition soda drops, from Taco Bell Baja Blast spin-offs and annual Halloween VooDEW mysteries to Summer Freeze cans.",
    "accentColor": "#16a34a"
  },
  {
    "name": "Noodles & Company",
    "slug": "noodles-and-company",
    "letter": "N",
    "segment": "Casual & Diner",
    "headquarters": "Broomfield, CO",
    "signatureItem": "Wisconsin Mac & Cheese & Global Noodle Bowls",
    "description": "Fast-casual noodle kitchen debuting Crispy Chicken Bacon Alfredos, Steak Stroganoff, and chef-curated baked mac-and-cheese bowls.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Oreo",
    "slug": "oreo",
    "letter": "O",
    "segment": "Packaged Snacks",
    "headquarters": "East Hanover, NJ",
    "signatureItem": "Limited Edition Sandwich Cookies",
    "description": "Nabisco's legendary sandwich cookie with dual-layer cremes, celebrity collabs, popping candy inclusions, and seasonal bakery drops.",
    "accentColor": "#1e3a8a"
  },
  {
    "name": "Panda Express",
    "slug": "panda-express",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Rosemead, CA",
    "signatureItem": "The Original Orange Chicken & Wok-Fired LTOs",
    "description": "American-Chinese fast-food giant frequently testing spicy Blazing Bourbon Chicken, Firecracker Steak & Shrimp, and dessert rangoons.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Panera Bread",
    "slug": "panera-bread",
    "letter": "P",
    "segment": "Coffee & Bakery",
    "headquarters": "St. Louis, MO",
    "signatureItem": "Croissant Toast Sandwiches, Bread Bowls & Bakery Sweets",
    "description": "Bakery-cafe chain rolling out seasonal soup bread bowls, Ciabatta Dippers, Croissant Toast melts, and Kitchen Sink cookies.",
    "accentColor": "#15803d"
  },
  {
    "name": "Papa Johns",
    "slug": "papa-johns",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Epic Stuffed Crust, Shaq-a-Roni & Papa Bites",
    "description": "Major pizza chain known for Garlic Epic Stuffed Crust, Crispy Cuppy 'Roni, Doritos Cool Ranch Papadias, and sweet Oreo Papa Bites.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Papa Murphy's",
    "slug": "papa-murphys",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Vancouver, WA",
    "signatureItem": "Take 'N' Bake Stuffed Pizzas & Holiday Shapes",
    "description": "Take-and-bake pizza chain celebrated for double-layered stuffed pizzas, Jack-O-Lantern Halloween pies, and Cinnamon Monkey Bread.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Paris Baguette",
    "slug": "paris-baguette",
    "letter": "P",
    "segment": "Coffee & Bakery",
    "headquarters": "Moonachie, NJ",
    "signatureItem": "Soft Cream Cakes, Mochi Donuts & Savory Croissants",
    "description": "Fast-growing bakery-cafe chain rolling out seasonal Biscoff, peppermint, strawberry soft cream cakes, king cream donuts, and specialty lattes.",
    "accentColor": "#1e3a8a"
  },
  {
    "name": "Pizza Hut",
    "slug": "pizza-hut",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Plano, TX",
    "signatureItem": "Stuffed Crust, Tavern Pizzas & Crispy Melts",
    "description": "Iconic red-roof pizza brand launching Chicago Tavern-Style pies, Big New Yorker returns, handheld Melts, and Cinnabon mini rolls.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Popeyes",
    "slug": "popeyes",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Miami, FL",
    "signatureItem": "Classic Chicken Sandwich, Glazed Wings & Biscuits",
    "description": "New Orleans-style fried chicken powerhouse specializing in bold marinades, flaky biscuits, glazed wing flavors, and chocolate beignets.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Portillo's",
    "slug": "portillos",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Oak Brook, IL",
    "signatureItem": "Italian Beef, Chicago Dogs & Chocolate Cake Shakes",
    "description": "Chicago street-food icon drawing fanfare for seasonal Cake Shake flavors (Lemon, Strawberry, Salted Caramel) and Rodeo Burgers.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Potbelly",
    "slug": "potbelly",
    "letter": "P",
    "segment": "Fast Food",
    "headquarters": "Chicago, IL",
    "signatureItem": "Toasted A Wreck Sandwiches, Hot Peppers & Shakes",
    "description": "Toasted-sandwich shop dropping Underground Menu subs, shortbread-cookie-on-straw shakes, and freshly baked seasonal cookies.",
    "accentColor": "#92400e"
  },
  {
    "name": "Pringles",
    "slug": "pringles",
    "letter": "P",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Hot Ones Collabs, Mingles Puffs & Gaming Flavors",
    "description": "Stackable crisp icon famous for fiery Hot Ones sauce collaborations, street-taco and carnival flavors, and bagged Pringles Mingles puffs.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Qdoba",
    "slug": "qdoba",
    "letter": "Q",
    "segment": "Fast Food",
    "headquarters": "San Diego, CA",
    "signatureItem": "3-Cheese Queso Bowls, Birria & Citrus Lime Shrimp",
    "description": "Mexican fast-casual chain offering free queso and guacamole on entrees plus rotating Birria, Habanero Lime Steak, and shrimp specials.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Reese's",
    "slug": "reeses",
    "letter": "R",
    "segment": "Packaged Snacks",
    "headquarters": "Hershey, PA",
    "signatureItem": "Big Cups with Mix-Ins, Chocolate Lava & Seasonal Shapes",
    "description": "Peanut-butter-and-chocolate juggernaut launching Caramel Big Cups, Chocolate Lava layers, Potato Chip/Pretzel stuffed cups, and Oreo/fast-food collabs.",
    "accentColor": "#ea580c"
  },
  {
    "name": "Shake Shack",
    "slug": "shake-shack",
    "letter": "S",
    "segment": "Fast Food",
    "headquarters": "New York, NY",
    "signatureItem": "ShackBurger, Black Truffle Menu & Hand-Spun Shakes",
    "description": "Fine-casual burger stand known for Angus smash burgers, crinkle-cut fries, Korean-style chicken runs, and seasonal custard shakes.",
    "accentColor": "#15803d"
  },
  {
    "name": "Sheetz",
    "slug": "sheetz",
    "letter": "S",
    "segment": "Casual & Diner",
    "headquarters": "Altoona, PA",
    "signatureItem": "Made-To-Order (MTO) Burgers, Appetizer Buckets & Shakes",
    "description": "Late-night convenience kitchen icon serving touchscreen MTO mac-and-cheese burgers, fried Wisconsin cheese curds, and over-the-top seasonal shakes.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Slim Chickens",
    "slug": "slim-chickens",
    "letter": "S",
    "segment": "Fast Food",
    "headquarters": "Fayetteville, AR",
    "signatureItem": "Hand-Breaded Tenders, 17 Sauces & Jar Desserts",
    "description": "Southern chicken-tender chain loved for chicken and waffles, 17 house dipping sauces, and layered Mason Jar cheesecake/brownie desserts.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Smashburger",
    "slug": "smashburger",
    "letter": "S",
    "segment": "Fast Food",
    "headquarters": "Denver, CO",
    "signatureItem": "Smashed Angus Burgers, SmashFries & Haagen-Dazs Shakes",
    "description": "Fast-casual burger grill searing Wagyu burgers, Scorchin' Hot Crispy Chicken sandwiches, rosemary SmashFries, and thick malt shakes.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Smoothie King",
    "slug": "smoothie-king",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Dallas, TX",
    "signatureItem": "Smoothie Bowls & Seasonal Fruit Blends",
    "description": "Smoothie and acai-bowl chain rolling out crunchy-topped Smoothie Bowls, celebrity blends, and pumpkin/watermelon seasonal lineups.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Sonic Drive-In",
    "slug": "sonic",
    "letter": "S",
    "segment": "Fast Food",
    "headquarters": "Oklahoma City, OK",
    "signatureItem": "Cherry Limeades, Smashers, Tots & Master Shakes",
    "description": "Carhop drive-thru paradise unleashing nonstop monthly slush float mashups, Groovy Fries, Double Sonic Smashers, and buttery toast snacks.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Starbucks",
    "slug": "starbucks",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Seattle, WA",
    "signatureItem": "Cortados, Shaken Espressos, Cold Foams & Refreshers",
    "description": "Specialty coffee giant introducing seasonal espresso builds, flavored cold foams, boba-style Refreshers, and bakery pastries year-round.",
    "accentColor": "#047857"
  },
  {
    "name": "Subway",
    "slug": "subway",
    "letter": "S",
    "segment": "Fast Food",
    "headquarters": "Miami, FL",
    "signatureItem": "Subway Series Subs & Footlong Sidekicks",
    "description": "Sandwich giant expanding beyond subs with Cinnabon Footlong Churros, Auntie Anne's Footlong Pretzels, Footlong Cookies, and dippers.",
    "accentColor": "#15803d"
  },
  {
    "name": "Swig",
    "slug": "swig",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Lehi, UT",
    "signatureItem": "Dirty Sodas, Reviver Energy & Pink Sugar Cookies",
    "description": "Pioneer of the viral Dirty Soda craze, mixing fountain sodas with coconut cream, fruit purees, and rotating seasonal drink menus.",
    "accentColor": "#e11d48"
  },
  {
    "name": "Taco Bell",
    "slug": "taco-bell",
    "letter": "T",
    "segment": "Fast Food",
    "headquarters": "Irvine, CA",
    "signatureItem": "Street Chalupas, Nacho Fries & Baja Blast",
    "description": "Fast-food menu innovator known for toasted cheese shells, Nacho Fries waves, Baja Blast freezes/pies, and Discovery Luxe Boxes.",
    "accentColor": "#7e22ce"
  },
  {
    "name": "Taco John's",
    "slug": "taco-johns",
    "letter": "T",
    "segment": "Fast Food",
    "headquarters": "Cheyenne, WY",
    "signatureItem": "Potato Oles, Fried Chicken Tacos & Nachos Navidad",
    "description": "Midwest/Mountain West Mexican chain beloved for crispy seasoned Potato Oles, Alaska Flounder Tacos, and holiday Nachos Navidad.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Takis",
    "slug": "takis",
    "letter": "T",
    "segment": "Packaged Snacks",
    "headquarters": "Coppell, TX",
    "signatureItem": "Fuego, Blue Heat & Dragon Sweet Chili Rolled Tortilla Chips",
    "description": "High-intensity rolled tortilla chip brand expanding into Dragon Sweet Chili, Zombie Habanero, Intense Nacho, chicharrones, and Wendy's/fast-food mashups.",
    "accentColor": "#7e22ce"
  },
  {
    "name": "Tim Hortons",
    "slug": "tim-hortons",
    "letter": "T",
    "segment": "Coffee & Bakery",
    "headquarters": "Miami, FL",
    "signatureItem": "Timbits, Iced Capp & Dream Donuts",
    "description": "Coffee-and-bakehouse favorite serving Iced Capps, stuffed Dream Donuts, savory flatbread pizzas, and seasonal Timbits buckets.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Trader Joe's",
    "slug": "trader-joes",
    "letter": "T",
    "segment": "Grocery",
    "headquarters": "Monrovia, CA",
    "signatureItem": "Private-Label Frozen Appetizers & Seasonal Snacks",
    "description": "Cult-favorite neighborhood grocer packing its freezer aisles and snack shelves with inventive small-batch seasonal creations.",
    "accentColor": "#047857"
  },
  {
    "name": "Tropical Smoothie Cafe",
    "slug": "tropical-smoothie-cafe",
    "letter": "T",
    "segment": "Coffee & Bakery",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Island Smoothies, Tropic Bowls & Toasted Flatbreads",
    "description": "Fast-casual smoothie and cafe brand rotating Watermelon Mojito smoothies, acai bowls, and chipotle chicken flatbreads.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Wawa",
    "slug": "wawa",
    "letter": "W",
    "segment": "Casual & Diner",
    "headquarters": "Wawa, PA",
    "signatureItem": "Hoagiefest Subs, Hot Turkey Gobbler & Sizzli Breakfast",
    "description": "East Coast convenience-deli legend beloved for summer Hoagiefest, Thanksgiving Hot Turkey Gobbler bowls/hoagies, evening pizzas, and handcrafted refreshers.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Wendy's",
    "slug": "wendys",
    "letter": "W",
    "segment": "Fast Food",
    "headquarters": "Dublin, OH",
    "signatureItem": "Spicy Chicken, Baconator, Saucy Nuggs & Frosty Swirls",
    "description": "Fresh never-frozen square beef burgers, fiery chicken sandwiches, Saucy Nuggs, pop-culture meals, and swirled Frosty desserts.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Whataburger",
    "slug": "whataburger",
    "letter": "W",
    "segment": "Fast Food",
    "headquarters": "San Antonio, TX",
    "signatureItem": "Patty Melt, Honey Butter Chicken Biscuit & Dr Pepper Shake",
    "description": "Texas burger institution rotating fan-favorite All-Time Favorites (Monterey Melt, Sweet & Spicy Bacon Burger) and specialty shakes.",
    "accentColor": "#ea580c"
  },
  {
    "name": "White Castle",
    "slug": "white-castle",
    "letter": "W",
    "segment": "Fast Food",
    "headquarters": "Columbus, OH",
    "signatureItem": "The Original Slider, Chicken Rings & Crave Cases",
    "description": "America's original slider chain steaming Jalapeno Cheese Sliders, Crispy Chicken Rings, French Toast Sliders, and dessert-on-a-stick LTOs.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Wienerschnitzel",
    "slug": "wienerschnitzel",
    "letter": "W",
    "segment": "Fast Food",
    "headquarters": "Irvine, CA",
    "signatureItem": "Chili Cheese Dogs, Corn Dogs & Tastee Freez Shakes",
    "description": "World's largest hot-dog chain constantly inventing playful chili-dog mashups, pastrami dogs, and cereal-topped Tastee Freez shakes.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Wingstop",
    "slug": "wingstop",
    "letter": "W",
    "segment": "Fast Food",
    "headquarters": "Addison, TX",
    "signatureItem": "Lemon Pepper Wings, Chicken Sandwich & Ranch",
    "description": "Flavor-obsessed wing powerhouse dropping limited-time dry rubs and glazes (Hot Honey, Sweet Chili Glaze, Carolina Gold) with house ranch.",
    "accentColor": "#15803d"
  },
  {
    "name": "Zaxby's",
    "slug": "zaxbys",
    "letter": "Z",
    "segment": "Fast Food",
    "headquarters": "Athens, GA",
    "signatureItem": "Chicken Fingerz, Zax Sauce & Fried Pickles",
    "description": "Southern chicken-finger favorite rolling out Philly Cheesesteak Egg Rolls, Giant Quesadillas, Funnel Cakes, and spicy signature sauces.",
    "accentColor": "#1e3a8a"
  }
];

// Original BrandBite editorial dispatches & first-hand taste tests.
// Never add fabricated taste-test scores; roundups omit `review` until tasted in person.
export const ARTICLES: Article[] = [
  {
    id: "roundup-christmas-2026-drops",
    slug: "2026-holiday-fast-food-and-snack-drops",
    title: "2026 Christmas & Holiday Fast-Food Menu Drops and Snack Aisle Guide",
    subtitle:
      "From Krispy Kreme's Rudolph Doughnuts and McDonald's Home Alone Meal to Chick-fil-A's Peppermint Cream Cold Brew and Trader Joe's Holiday Ice Cream Sandwiches — everything festive hitting drive-thrus and shelves right now.",
    type: "Limited-Time Offer",
    brand: "Holiday Menu Guide",
    brandSlug: "krispy-kreme",
    category: "Cookies & Sweets",
    publishedAt: "2026-11-27",
    publishedDateFormatted: "Nov 27, 2026",
    author: "BrandBite Desk",
    image: "/images/posts/christmas-2026-roundup.png",
    imageAlt:
      "Festive holiday spread of reindeer doughnuts, peppermint cream cold brew, holiday burger box, and seasonal cookies",
    excerpt:
      "Holiday season has officially taken over fast-food menus and grocery aisles. Here are the biggest Christmas 2026 limited-time drops worth putting on your radar across Krispy Kreme, McDonald's, Burger King, Chick-fil-A, Wendy's, Trader Joe's, and Hershey's.",
    tags: ["christmas", "holiday-2026", "lto", "krispy-kreme", "mcdonalds", "chick-fil-a", "snacks"],
    isFeatured: true,
    body: [
      "The Thanksgiving leftovers are barely packed away, which means fast-food drive-thrus and grocery snack aisles have officially flipped the switch to full Christmas mode. Across the 101 chains and snack makers we track daily on BrandBite, this year's holiday wave leans hard into nostalgia collabs, peppermint drinks, and over-the-top seasonal sweets.",
      "1. Krispy Kreme — Rudolph the Red-Nosed Reindeer Doughnut Collection: Krispy Kreme kicked off the season with a themed Rudolph assortment featuring reindeer-decorated glazed and filled doughnuts alongside festive holiday sprinkles. It's an easy centerpiece box for office parties or weekend coffee runs.",
      "2. McDonald's — The Home Alone Meal & Burger King — Peanuts Holiday Meal: Nostalgia rules the burger drive-thrus this December. McDonald's rolled out a Home Alone-themed meal, while Burger King countered with its Peanuts Holiday Meal complete with festive Snoopy toys and collectible merch. Meanwhile, Wendy's dropped Holiday Boxes bundled with retro beanies.",
      "3. Chick-fil-A — Peppermint Cream Cold Brew & Chicken Tortilla Soup: On the sip-and-warm-up front, Chick-fil-A paired its brand-new Peppermint Cream Cold Brew with the winter return of fan-favorite Chicken Tortilla Soup. Over on the bakery side, Paris Baguette also unveiled its full 2026 Holiday Menu of soft cream cakes and seasonal pastries.",
      "4. Grocery & Snack Aisle Standouts: If you're doing a holiday Target, Aldi, or Trader Joe's run, keep an eye out for Trader Joe's new holiday ice cream sandwiches and seasonal cold foam, Hershey's Kisses Strawberry Sugar Cookie, M&M's Holiday Blend in movie-inspired holiday packaging, and Coca-Cola's classic Sundblom Santa bottles.",
      "Spotted a regional Christmas shake, seasonal doughnut, or holiday chip flavor at your local store? Hit Submit a Sighting at the top of BrandBite to put it straight onto the live feed — and stay tuned for our first hands-on holiday taste-test verdicts!",
    ],
  },
];

export const CATEGORIES = [
  "All Categories",
  "Burgers & Sandwiches",
  "Chicken & Wings",
  "Tacos & Burritos",
  "Pizza & Italian",
  "Breakfast & Diners",
  "Coffee & Drinks",
  "Cookies & Sweets",
  "Chips & Crisps",
  "Frozen & Grocery",
] as const;

export const ARTICLE_TYPES: ("All" | ArticleType)[] = [
  "All",
  "Review",
  "News",
  "Limited-Time Offer",
  "Deal",
];
