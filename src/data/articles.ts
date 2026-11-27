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
  },
  {
    "name": "Dirty Dough",
    "slug": "dirty-dough",
    "letter": "D",
    "segment": "Coffee & Bakery",
    "headquarters": "Tempe, AZ",
    "signatureItem": "Layered Center-Stuffed Weekly Cookies",
    "description": "Stuffed-cookie chain famous for weekly rotating multi-layer flavors filled with fudge, caramel, cream cheese, and cereal fillings.",
    "accentColor": "#b45309"
  },
  {
    "name": "Duck Donuts",
    "slug": "duck-donuts",
    "letter": "D",
    "segment": "Coffee & Bakery",
    "headquarters": "Mechanicsburg, PA",
    "signatureItem": "Warm Made-to-Order Vanilla Cake Donuts & Seasonal Boxes",
    "description": "Made-to-order warm cake donut shop rolling out seasonal holiday assortments, maple bacon glazes, and limited-time toppings.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Gideon's Bakehouse",
    "slug": "gideons-bakehouse",
    "letter": "G",
    "segment": "Coffee & Bakery",
    "headquarters": "Orlando, FL",
    "signatureItem": "Half-Pound Monthly Limited-Edition Cookies & Cake Slices",
    "description": "Cult Florida bakery famous for nearly half-pound cookies and a new limited-edition monthly flavor drop that sells out daily.",
    "accentColor": "#181512"
  },
  {
    "name": "Insomnia Cookies",
    "slug": "insomnia-cookies",
    "letter": "I",
    "segment": "Coffee & Bakery",
    "headquarters": "Philadelphia, PA",
    "signatureItem": "Warm Late-Night Cookies, Deluxe Flavors & Cereal Collabs",
    "description": "Late-night warm cookie delivery icon dropping frequent limited-edition collabs, seasonal deluxe cookies, and holiday gift boxes.",
    "accentColor": "#7c3aed"
  },
  {
    "name": "Jeni's Splendid Ice Creams",
    "slug": "jenis-ice-cream",
    "letter": "J",
    "segment": "Packaged Snacks",
    "headquarters": "Columbus, OH",
    "signatureItem": "Seasonal Small-Batch Pints & Gooey Butter Cake",
    "description": "Artisanal scoop shop and grocery freezer favorite releasing cult seasonal pint collections, holiday flavors, and chef collaborations.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Levain Bakery",
    "slug": "levain-bakery",
    "letter": "L",
    "segment": "Coffee & Bakery",
    "headquarters": "New York, NY",
    "signatureItem": "6-Ounce Thick Cookies & Seasonal Limited Drops",
    "description": "Iconic NYC bakery famous for crisp-outside, gooey-inside 6-ounce cookies and seasonal bakery & grocery freezer releases.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Nothing Bundt Cakes",
    "slug": "nothing-bundt-cakes",
    "letter": "N",
    "segment": "Coffee & Bakery",
    "headquarters": "Addison, TX",
    "signatureItem": "Pop-Up Limited-Time Bundtlets & Cream Cheese Frosting",
    "description": "Specialty bundt bakery dropping short-run Pop-Up Flavors (like Oreo Cookies & Cream and seasonal holiday cakes) throughout the year.",
    "accentColor": "#7e22ce"
  },
  {
    "name": "PopUp Bagels",
    "slug": "popup-bagels",
    "letter": "P",
    "segment": "Coffee & Bakery",
    "headquarters": "Westport, CT / New York, NY",
    "signatureItem": "Hot Whole Bagels & Weekly Rotating Schmear of the Week",
    "description": "Viral 'Grip, Rip & Dip' bagel phenomenon dropping a brand-new weekly specialty schmear and brand collaboration every week.",
    "accentColor": "#d97706"
  },
  {
    "name": "Salt & Straw",
    "slug": "salt-and-straw",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Portland, OR",
    "signatureItem": "Monthly 5-Flavor Limited-Edition Ice Cream Series",
    "description": "Small-batch scoop shop unveiling five brand-new culinary seasonal ice cream flavors on the first Friday of every single month.",
    "accentColor": "#0f766e"
  },
  {
    "name": "Andy's Frozen Custard",
    "slug": "andys-frozen-custard",
    "letter": "A",
    "segment": "Coffee & Bakery",
    "headquarters": "Springfield, MO",
    "signatureItem": "Monthly Seasonal Concretes, Jackhammers & Frozen Custard",
    "description": "Drive-thru frozen custard chain dropping rotating seasonal concretes, pumpkin pie blends, and limited-time sundaes.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Baked by Melissa",
    "slug": "baked-by-melissa",
    "letter": "B",
    "segment": "Coffee & Bakery",
    "headquarters": "New York, NY",
    "signatureItem": "Monthly Limited-Edition Bite-Size Cupcake Packs",
    "description": "NYC mini-cupcake bakery releasing rotating monthly flavor assortments and brand collaborations.",
    "accentColor": "#ec4899"
  },
  {
    "name": "Ben & Jerry's",
    "slug": "ben-and-jerrys",
    "letter": "B",
    "segment": "Packaged Snacks",
    "headquarters": "South Burlington, VT",
    "signatureItem": "Limited Batch Pints, Core Flavors & Scoop Shop Drops",
    "description": "Iconic Vermont ice cream maker launching Limited Batch pints, Sundae flavors, and loaded bakery mix-ins.",
    "accentColor": "#0284c7"
  },
  {
    "name": "Magnolia Bakery",
    "slug": "magnolia-bakery",
    "letter": "M",
    "segment": "Coffee & Bakery",
    "headquarters": "New York, NY",
    "signatureItem": "Banana Pudding Flavor of the Month & Classic Cupcakes",
    "description": "Beloved NYC bakery unveiling a brand-new specialty Banana Pudding Flavor of the Month alongside seasonal holiday bakes.",
    "accentColor": "#be185d"
  },
  {
    "name": "Milk Bar",
    "slug": "milk-bar",
    "letter": "M",
    "segment": "Coffee & Bakery",
    "headquarters": "New York, NY",
    "signatureItem": "Cereal Milk Soft Serve, Truffles & Seasonal Collaborations",
    "description": "Christina Tosi's cult bakery dropping seasonal bakery treats, grocery cookie packs, and limited-time flavor collaborations.",
    "accentColor": "#db2777"
  },
  {
    "name": "Shipley Do-Nuts",
    "slug": "shipley-donuts",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Houston, TX",
    "signatureItem": "Hot Glazed Donuts, Kolaches & Seasonal Holiday Boxes",
    "description": "Southern donut and kolache staple rolling out seasonal holiday donut collections and limited-time filled flavors.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Sidecar Doughnuts",
    "slug": "sidecar-doughnuts",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Costa Mesa, CA",
    "signatureItem": "Small-Batch Rotating Monthly & Daily Gourmet Doughnuts",
    "description": "California craft doughnut shop frying hourly batches with a rotating lineup of monthly seasonal flavors and cake doughnuts.",
    "accentColor": "#b45309"
  },
  {
    "name": "Sprinkles Cupcakes",
    "slug": "sprinkles-cupcakes",
    "letter": "S",
    "segment": "Coffee & Bakery",
    "headquarters": "Beverly Hills, CA",
    "signatureItem": "Rotating Weekly/Monthly Limited-Edition Cupcakes & Cupcake ATMs",
    "description": "Famous bakery and Cupcake ATM brand rotating limited-time seasonal cupcakes and pop-culture collaborations every month.",
    "accentColor": "#e11d48"
  },
  {
    "name": "Tiff's Treats",
    "slug": "tiffs-treats",
    "letter": "T",
    "segment": "Coffee & Bakery",
    "headquarters": "Austin, TX",
    "signatureItem": "Warm Delivered Cookies & Monthly Flavor of the Month",
    "description": "Warm cookie delivery favorite releasing a new limited-edition Flavor of the Month and holiday cookie boxes.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Van Leeuwen",
    "slug": "van-leeuwen",
    "letter": "V",
    "segment": "Packaged Snacks",
    "headquarters": "Brooklyn, NY",
    "signatureItem": "Seasonal Small-Batch Ice Cream & Viral Limited-Edition Pints",
    "description": "Brooklyn-born scoop shop and grocery freezer standout famous for seasonal flavors and viral limited-edition pint collabs.",
    "accentColor": "#ca8a04"
  },
  {
    "name": "Voodoo Doughnut",
    "slug": "voodoo-doughnut",
    "letter": "V",
    "segment": "Coffee & Bakery",
    "headquarters": "Portland, OR",
    "signatureItem": "Over-the-Top Seasonal Doughnuts & Pink Box Assortments",
    "description": "Portland cult doughnut chain dropping bold seasonal flavors, holiday pink boxes, and limited-edition filled creations.",
    "accentColor": "#ec4899"
  },
  {
    "name": "Pop-Tarts",
    "slug": "pop-tarts",
    "letter": "P",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Frosted Toaster Pastries, Crunchy Poppers & Limited-Edition Collabs",
    "description": "Toaster-pastry icon constantly testing boundaries with wild seasonal frostings, crunchy poppers, and viral brand collaborations.",
    "accentColor": "#2563eb"
  },
  {
    "name": "Eggo",
    "slug": "eggo",
    "letter": "E",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Homestyle Waffles, Fully Loaded Waffles & Seasonal Breakfast Drops",
    "description": "Freezer-aisle breakfast giant expanding beyond classic waffles with stuffed Fully Loaded varieties, protein lines, and seasonal collabs.",
    "accentColor": "#eab308"
  },
  {
    "name": "La Colombe",
    "slug": "la-colombe",
    "letter": "L",
    "segment": "Coffee & Bakery",
    "headquarters": "Philadelphia, PA",
    "signatureItem": "Draft Latte Cans, Cold Brew & Cafe Seasonal Drinks",
    "description": "Specialty coffee roaster and grocery-cooler staple famed for frothy canned Draft Lattes, seasonal flavors, and café drinks.",
    "accentColor": "#1e3a8a"
  },
  {
    "name": "Cheez-It",
    "slug": "cheez-it",
    "letter": "C",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Baked Cheese Crackers, Extra Toasty, Snap'd & Fast-Food Collabs",
    "description": "Baked-cheese cracker titan rolling out bold Crunch/Snap'd flavors, fast-food mashups, and limited-edition cheesy snack formats.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Goldfish",
    "slug": "goldfish",
    "letter": "G",
    "segment": "Packaged Snacks",
    "headquarters": "Camden, NJ",
    "signatureItem": "Cheddar Crackers, Flavor Blasted, Crisps & Sweet Grahams",
    "description": "Pepperidge Farm's smiling cracker staple launching spicy collabs, potato-style Goldfish Crisps, and seasonal sweet graham drops.",
    "accentColor": "#f97316"
  },
  {
    "name": "Ritz",
    "slug": "ritz",
    "letter": "R",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Buttery Crackers, Toasted Chips & Flavored Bits Sandwiches",
    "description": "Buttery cracker legend constantly expanding into seasoned Toasted Chips, bold Drizzle/Bits flavors, and spicy limited runs.",
    "accentColor": "#b91c1c"
  },
  {
    "name": "Little Debbie",
    "slug": "little-debbie",
    "letter": "L",
    "segment": "Packaged Snacks",
    "headquarters": "Collegedale, TN",
    "signatureItem": "Christmas Tree Cakes, Cosmic Brownies & Seasonal Snack Cakes",
    "description": "Snack-cake powerhouse behind cult-favorite Christmas Tree Cakes, seasonal ice cream pints, and nostalgic limited-time bakes.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Hostess",
    "slug": "hostess",
    "letter": "H",
    "segment": "Packaged Snacks",
    "headquarters": "Lenexa, KS",
    "signatureItem": "Twinkies, Donettes, Ding Dongs & Seasonal Bakery Packs",
    "description": "Classic packaged bakery brand dropping seasonal Donettes flavors, filled Twinkies variations, and limited-time snack cake runs.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Pillsbury",
    "slug": "pillsbury",
    "letter": "P",
    "segment": "Packaged Snacks",
    "headquarters": "Minneapolis, MN",
    "signatureItem": "Shape Sugar Cookies, Cinnamon Rolls & Refrigerated Dough Drops",
    "description": "Refrigerated-dough staple famous for seasonal Shape Sugar Cookies, limited-edition cinnamon roll icings, and holiday baking kits.",
    "accentColor": "#2563eb"
  },
  {
    "name": "Kit Kat",
    "slug": "kit-kat",
    "letter": "K",
    "segment": "Packaged Snacks",
    "headquarters": "Hershey, PA",
    "signatureItem": "Crisp Wafer Bars, Duos & Limited-Edition Seasonal Flavors",
    "description": "Crisp wafer candy giant unleashing seasonal flavors, dessert-inspired Duos, and limited-edition holiday shapes year-round.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Sour Patch Kids",
    "slug": "sour-patch-kids",
    "letter": "S",
    "segment": "Packaged Snacks",
    "headquarters": "Chicago, IL",
    "signatureItem": "Sour-Then-Sweet Gummies, Glow Ups & Wild Flavor Mashups",
    "description": "Sour gummy favorite constantly launching mystery flavors, soda/cereal crossovers, and seasonal candy aisle takeovers.",
    "accentColor": "#16a34a"
  },
  {
    "name": "Coca-Cola",
    "slug": "coca-cola",
    "letter": "C",
    "segment": "Packaged Snacks",
    "headquarters": "Atlanta, GA",
    "signatureItem": "Coca-Cola Creations, Seasonal Zero Sugar & Limited Soda Drops",
    "description": "Beverage titan rolling out experimental Coca-Cola Creations, retro flavor revivals, and holiday spiced/creamy limited editions.",
    "accentColor": "#dc2626"
  },
  {
    "name": "Pepsi",
    "slug": "pepsi",
    "letter": "P",
    "segment": "Packaged Snacks",
    "headquarters": "Purchase, NY",
    "signatureItem": "Wild Cherry & Cream, Limited-Edition Colas & Viral Collabs",
    "description": "Cola powerhouse dropping playful limited-time flavors, dessert-inspired twists, and pop-culture soda collaborations.",
    "accentColor": "#1d4ed8"
  },
  {
    "name": "Dr Pepper",
    "slug": "dr-pepper",
    "letter": "D",
    "segment": "Packaged Snacks",
    "headquarters": "Frisco, TX",
    "signatureItem": "23-Flavor Soda, Creamy Coconut, Blackberry & Limited Drops",
    "description": "Cult-favorite 23-flavor soda sparking supermarket hunts with viral limited runs like Creamy Coconut, Strawberries & Cream, and Blackberry.",
    "accentColor": "#7f1d1d"
  }
];

// Original BrandBite editorial dispatches & first-hand taste tests.
// Never add fabricated taste-test scores; roundups omit `review` until tasted in person.
export const ARTICLES: Article[] = [
  {
    id: "roundup-black-friday-2026-deals",
    slug: "black-friday-2026-fast-food-deals",
    title: "Black Friday 2026 Fast-Food Deals Worth Leaving the Couch For",
    subtitle:
      "Forget fighting strangers over discounted air fryers — here's the quick cheat sheet on free Dunkin' donuts, Carl's Jr. & Hardee's 'Snack Friday', Church's chicken deals, and drive-thru app promos.",
    type: "Deal",
    brand: "Black Friday Deals",
    brandSlug: "dunkin",
    category: "Burgers & Sandwiches",
    publishedAt: "2026-11-27",
    publishedDateFormatted: "Nov 27, 2026",
    author: "BrandBite Desk",
    image: "/images/posts/black-friday-2026-deals.jpg",
    imageAlt:
      "Overhead spread of a stacked double cheeseburger, crispy chicken tenders, curly fries, glazed holiday donut, and iced coffee",
    excerpt:
      "You don't need another 75-inch TV. You need discounted burgers, free donuts, and an excuse to stop eating leftover turkey. Here are the Black Friday 2026 food deals actually worth a drive-thru detour.",
    tags: ["black-friday", "deals", "dunkin", "carls-jr", "burger-king", "arbys", "chipotle"],
    isFeatured: true,
    dealCode: "BLKFRI",
    body: [
      "Somewhere out there, people are wrestling over 40%-off blenders. Meanwhile, the real Black Friday economy is happening in the drive-thru lane — and unlike a smart toaster, you're actually going to use a discounted cheeseburger.",
      "1. [7-Eleven / 7NOW Delivery](https://www.7-eleven.com/7now) — Free Large Pizza & $25 Off Cyber Monday (Codes Inside): On Black Friday (Nov 27), get a free large pizza with any $30+ 7NOW delivery order using promo code `BLKFRI` at checkout (participating 7-Eleven, Speedway, and Stripes locations). Bookmark Cyber Monday (Nov 30) too: take $25 off delivery orders of $50+ with code `LOADUP`.",
      "2. [Dunkin' Rewards](https://www.dunkindonuts.com/en/dunkinrewards) — Free Donut Fridays & 'Donutcracker' Merch: Dunkin' is bringing back Free Donut Fridays starting Black Friday (Nov 27 through Dec 11), giving Rewards members a free Classic Donut with any beverage purchase — plus limited-edition Donutcracker holiday merch. Finally, a doorbuster that doesn't require assembling furniture.",
      "3. [Arby's Loaded Rewards](https://www.arbys.com/rewards/) — $1 Any-Size Fries: Loaded Rewards members can grab any size fries for $1 on Black Friday with a $5 minimum purchase. Curly fries for a buck is about the only inflation hedge left.",
      "4. [Carl's Jr.](https://www.carlsjr.com/) & [Hardee's](https://www.hardees.com/) — 'Snack Friday' (Nov 27–29): Both chains skipped the subtlety and declared it Snack Friday, rolling out member discounts on select menu items and gift cards all weekend.",
      "5. [Church's Texas Chicken](https://www.churchs.com/), [Burger King](https://www.bk.com/), [Chipotle](https://www.chipotle.com/) & [Mrs. Fields](https://www.mrsfields.com/): Church's is running Black Friday through Cyber Monday fried-chicken savings to help you retire leftover turkey early; check the Burger King and Chipotle apps for weekend promos, and hit Mrs. Fields for holiday cookie promos and online Cookie Cake discounts.",
      "Want more as Cyber Monday drops hit? Filter the live feed by Deals or Last Day — we track new promo codes and limited-time menus live all weekend.",
    ],
  },
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
    image: "/images/posts/christmas-2026-roundup.jpg",
    imageAlt:
      "Festive holiday spread of reindeer doughnuts, peppermint cream cold brew, holiday burger box, and seasonal cookies",
    excerpt:
      "Holiday season has officially taken over fast-food menus and grocery aisles. Here are the biggest Christmas 2026 limited-time drops worth putting on your radar across Krispy Kreme, McDonald's, Burger King, Chick-fil-A, Wendy's, Trader Joe's, and Hershey's.",
    tags: ["christmas", "holiday-2026", "lto", "krispy-kreme", "mcdonalds", "chick-fil-a", "snacks"],
    isFeatured: true,
    body: [
      "The Thanksgiving leftovers are barely packed away, which means fast-food drive-thrus and grocery snack aisles have officially flipped the switch to full Christmas mode. Across the over a hundred chains and snack makers we track daily on BrandBite, this year's holiday wave leans hard into nostalgia collabs, peppermint drinks, and over-the-top seasonal sweets.",
      "1. [Krispy Kreme](https://www.krispykreme.com/) — Rudolph the Red-Nosed Reindeer Doughnut Collection: Krispy Kreme kicked off the season with a themed Rudolph assortment featuring reindeer-decorated glazed and filled doughnuts alongside festive holiday sprinkles. It's an easy centerpiece box for office parties or weekend coffee runs.",
      "2. [McDonald's](https://www.mcdonalds.com/) Home Alone Meal, [Burger King](https://www.bk.com/) Peanuts Meal & [Wendy's](https://www.wendys.com/) Holiday Boxes: Nostalgia rules the burger drive-thrus this December. McDonald's rolled out a Home Alone-themed meal, Burger King countered with its Peanuts Holiday Meal complete with Snoopy toys and merch, and Wendy's dropped Holiday Boxes bundled with retro beanies.",
      "3. [Chick-fil-A](https://www.chick-fil-a.com/) Peppermint Cream Cold Brew & [Paris Baguette](https://parisbaguette.com/) Holiday Menu: On the sip-and-warm-up front, Chick-fil-A paired its new Peppermint Cream Cold Brew with the winter return of Chicken Tortilla Soup, while Paris Baguette unveiled its full 2026 Holiday Menu of soft cream cakes and seasonal pastries.",
      "4. Grocery & Snack Aisle Standouts: On your next [Trader Joe's](https://www.traderjoes.com/) or [Aldi](https://www.aldi.us/) run, watch for Trader Joe's Euro-Christmas ice cream sandwiches and seasonal cold foam, [Hershey's](https://www.hersheyland.com/) Kisses Strawberry Sugar Cookie, M&M's Holiday Blend, and Coca-Cola's classic Sundblom Santa bottles.",
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
