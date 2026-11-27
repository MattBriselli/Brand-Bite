import fs from "node:fs/promises";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTICLES_PATH = path.resolve(__dirname, "../src/data/articles.ts");
const PUBLIC_REVIEWS_DIR = path.resolve(__dirname, "../public/images/reviews");

const FOOD_CATEGORIES = [
  "Burgers & Sandwiches",
  "Chicken & Wings",
  "Tacos & Burritos",
  "Pizza & Italian",
  "Breakfast & Diners",
  "Coffee & Drinks",
  "Cookies & Sweets",
  "Chips & Crisps",
  "Frozen & Grocery",
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function suggestVerdict(score) {
  if (score >= 9.0) return "Must Buy";
  if (score >= 7.5) return "Worth Trying";
  if (score >= 6.0) return "Solid Pick";
  if (score >= 4.0) return "Mixed Bag";
  return "Skip It";
}

function splitList(raw) {
  return raw
    .split(/[;|]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function runWizard() {
  const rl = readline.createInterface({ input, output });
  try {
    console.log("\n🍔 BrandBite Original Review Publisher (Zero Fake Content)\n");

    const brandName = (await rl.question("1. Brand / Chain Name (e.g. Taco Bell): ")).trim();
    if (!brandName) throw new Error("Brand name is required.");

    const defaultBrandSlug = slugify(brandName);
    const brandSlugInput = (
      await rl.question(`2. Brand Slug [${defaultBrandSlug}]: `)
    ).trim();
    const brandSlug = brandSlugInput || defaultBrandSlug;

    const title = (
      await rl.question("3. Review Headline (e.g. Taco Bell Crispy Chicken Nuggets Review): ")
    ).trim();
    if (!title) throw new Error("Headline is required.");

    const subtitle = (
      await rl.question("4. Short Subtitle / Deck: ")
    ).trim();

    console.log("\nFood Categories:");
    FOOD_CATEGORIES.forEach((c, idx) => console.log(`  ${idx + 1}) ${c}`));
    const catIdxRaw = (await rl.question("5. Pick Category # [1]: ")).trim();
    const catIdx = Number.parseInt(catIdxRaw || "1", 10) - 1;
    const category = FOOD_CATEGORIES[catIdx] || FOOD_CATEGORIES[0];

    const ratingRaw = (await rl.question("6. Craveability Score out of 10 (e.g. 8.5): ")).trim();
    const rating = Number.parseFloat(ratingRaw);
    if (!Number.isFinite(rating) || rating < 1 || rating > 10) {
      throw new Error("Score must be between 1.0 and 10.0.");
    }

    const autoVerdict = suggestVerdict(rating);
    const verdictInput = (
      await rl.question(
        `7. Verdict (Must Buy | Worth Trying | Solid Pick | Mixed Bag | Skip It) [${autoVerdict}]: `
      )
    ).trim();
    const verdict = verdictInput || autoVerdict;

    const pricePaid = (await rl.question("8. Exact Price Paid (e.g. $5.99): ")).trim() || "Varies";
    const availability =
      (await rl.question("9. Availability [Nationwide Limited-Time Offer]: ")).trim() ||
      "Nationwide Limited-Time Offer";

    const slug = slugify(title);
    const photoPathRaw = (
      await rl.question("10. Local Photo Path (drag file here, or press Enter to skip): ")
    )
      .trim()
      .replace(/^['"]|['"]$/g, "");

    let imagePublicPath = null;
    if (photoPathRaw) {
      const resolvedPhoto = path.resolve(photoPathRaw.replace(/^~/, process.env.HOME || ""));
      const ext = path.extname(resolvedPhoto).toLowerCase() || ".jpg";
      await fs.mkdir(PUBLIC_REVIEWS_DIR, { recursive: true });
      const destFile = path.join(PUBLIC_REVIEWS_DIR, `${slug}${ext}`);
      await fs.copyFile(resolvedPhoto, destFile);
      imagePublicPath = `/images/reviews/${slug}${ext}`;
      console.log(`   ✔ Copied photo -> public${imagePublicPath}`);
    }

    const prosRaw = await rl.question("11. What Hits / Pros (separate items with ';' ): ");
    const consRaw = await rl.question("12. What Misses / Cons (separate items with ';' ): ");

    console.log("\n13. Enter review paragraphs (press Enter on an empty line when finished):");
    const body = [];
    while (true) {
      const para = (await rl.question(`   Paragraph ${body.length + 1}: `)).trim();
      if (!para) break;
      body.push(para);
    }
    if (body.length === 0) {
      throw new Error("At least one review paragraph is required.");
    }

    const tagsRaw = await rl.question("14. Optional tags (comma-separated, e.g. chicken, lto, nuggets): ");
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    const now = new Date();
    const isoDate = now.toISOString().slice(0, 10);
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newArticle = {
      id: `review-${slug}`,
      slug,
      title,
      subtitle: subtitle || body[0].slice(0, 140),
      type: "Review",
      brand: brandName,
      brandSlug,
      category,
      publishedAt: isoDate,
      publishedDateFormatted: formattedDate,
      author: "Matt",
      image: imagePublicPath,
      imageAlt: `${brandName} — ${title}`,
      excerpt: body[0].slice(0, 240),
      tags,
      isFeatured: true,
      review: {
        rating: Number(rating.toFixed(1)),
        verdict,
        pricePaid,
        availability,
        pros: splitList(prosRaw),
        cons: splitList(consRaw),
      },
      body,
    };

    const src = await fs.readFile(ARTICLES_PATH, "utf8");
    const serialized = JSON.stringify(newArticle, null, 2);

    let updated;
    if (src.includes("export const ARTICLES: Article[] = [];")) {
      updated = src.replace(
        "export const ARTICLES: Article[] = [];",
        `export const ARTICLES: Article[] = [\n${serialized},\n];`
      );
    } else if (src.includes("export const ARTICLES: Article[] = [")) {
      updated = src.replace(
        "export const ARTICLES: Article[] = [",
        `export const ARTICLES: Article[] = [\n${serialized},`
      );
    } else {
      throw new Error("Could not find ARTICLES array in src/data/articles.ts");
    }

    await fs.writeFile(ARTICLES_PATH, updated, "utf8");
    console.log(`\n✅ Added review "${title}" -> /reviews/${slug}`);
    console.log("   Next: run `npm run build`, `npm run draft-socials`, then `git add -A && git commit && git push`!\n");
  } finally {
    rl.close();
  }
}

runWizard().catch((err) => {
  console.error("\n❌ Cancelled:", err.message);
  process.exit(1);
});
