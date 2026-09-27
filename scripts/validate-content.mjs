import { readFileSync, existsSync } from "node:fs";
import { validateContent } from "../src/lib/content.mjs";
const read = (name) =>
  JSON.parse(readFileSync(`src/content/${name}.json`, "utf8"));
const business = read("business"),
  home = read("homepage"),
  food = read("food");
const errors = validateContent(business, home, food);
for (const item of [
  business.logo,
  business.socialImage,
  ...home.sections.map((s) => s.image),
  ...food.categories.map((c) => c.image),
]) {
  if (
    item &&
    (!item.startsWith("/src/assets/uploads/") ||
      item.includes("..") ||
      !existsSync(item.slice(1)))
  )
    errors.push(`Upload the image to src/assets/uploads first: ${item}`);
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `Content valid: ${home.sections.length} sections, ${food.categories.length} food categories.`,
);
