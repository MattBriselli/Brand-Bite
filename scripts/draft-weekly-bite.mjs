import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FEED_PATH = path.resolve(__dirname, "../src/data/live-feed.json");
const DRAFT_PATH = path.resolve(__dirname, "../weekly-bite-draft.md");

async function generateWeeklyBiteDraft() {
  const raw = await fs.readFile(FEED_PATH, "utf8");
  const feed = JSON.parse(raw);
  const items = feed.items || [];

  const ltos = items.filter((i) => i.type === "Limited-Time Offer").slice(0, 6);
  const deals = items.filter((i) => i.type === "Deal").slice(0, 4);
  const snacks = items
    .filter(
      (i) =>
        i.category === "Cookies & Sweets" ||
        i.category === "Chips & Crisps" ||
        i.category === "Frozen & Grocery"
    )
    .slice(0, 5);
  const reviewsAndNews = items
    .filter((i) => i.type === "Review" || i.type === "News")
    .slice(0, 5);

  const issueDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formatBullet = (item) =>
    `- **${item.brand} — [${item.title}](${item.url})** *(${item.sourceName})*\n  ${item.excerpt}`;

  const md = `# The Weekly Bite — ${issueDate}

*Hey friends — happy Friday! Here is what dropped across fast-food menus and snack aisles this week.*

---

## 🍔 Matt's Bite of the Week
> *[Write 2–3 quick sentences here on something good you ate, spotted, or want to try this weekend!]*

---

## 🔥 Top Limited-Time Menu Drops
${ltos.length > 0 ? ltos.map(formatBullet).join("\n\n") : "- *No major LTO headlines in the current window.*"}

---

## 💸 Weekend Deals & Value Alerts
${deals.length > 0 ? deals.map(formatBullet).join("\n\n") : "- *Check the live wire at https://brandbite-feed.web.app/?type=Deal#feed for new weekend promos.*"}

---

## 🛒 Snack Aisle, Bakery & Sweet Drops
${snacks.length > 0 ? snacks.map(formatBullet).join("\n\n") : "- *Browse snack updates at https://brandbite-feed.web.app.*"}

---

## 📰 More Fast-Food Wire Highlights
${reviewsAndNews.map(formatBullet).join("\n\n")}

---

Browse all **87 chains & snack brands** anytime on **[BrandBite](https://brandbite-feed.web.app)**.

*You are receiving **The Weekly Bite** because you signed up at brandbite-feed.web.app. Don't want Friday menu roundups anymore? [Unsubscribe in one click here]({{ unsubscribe_url }}).*
`;

  await fs.writeFile(DRAFT_PATH, md, "utf8");
  console.log(`Drafted The Weekly Bite (${items.length} live items scanned) -> ${DRAFT_PATH}`);
}

generateWeeklyBiteDraft().catch((err) => {
  console.error("Failed to draft newsletter:", err);
  process.exit(1);
});
