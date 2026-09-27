import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import YAML from "yaml";
import {
  visibleSections,
  ordered,
  localUrl,
  validateContent,
  isSquareReady,
} from "../src/lib/content.mjs";
const read = (name) =>
  JSON.parse(
    readFileSync(
      new URL(`../src/content/${name}.json`, import.meta.url),
      "utf8",
    ),
  );
const business = read("business"),
  homepage = read("homepage"),
  food = read("food");
test("all editable content passes production validation", () =>
  assert.deepEqual(validateContent(business, homepage, food), []));
test("adding, hiding, removing and reordering sections preserves content", () => {
  const draft = structuredClone(homepage.sections);
  draft[0].enabled = false;
  draft[1].order = 500;
  draft.push({ ...draft[2], id: "special", order: -10 });
  draft.splice(3, 1);
  const result = visibleSections(draft);
  assert.equal(result[0].id, "special");
  assert.equal(result.at(-1).id, homepage.sections[1].id);
  assert(!result.some((s) => s.id === homepage.sections[0].id));
  assert(!result.some((s) => s.id === homepage.sections[3].id));
  assert.equal(result.length, homepage.sections.length - 1);
});
test("food categories can be reordered without changing the source", () => {
  const items = structuredClone(food.categories);
  items.at(-1).order = -1;
  assert.equal(ordered(items)[0].name, items.at(-1).name);
  assert.notEqual(items[0].name, items.at(-1).name);
});
test("root and GitHub project paths preserve anchors and external URLs", () => {
  assert.equal(
    localUrl("/media/logo.png", "/moon-foods/"),
    "/moon-foods/media/logo.png",
  );
  assert.equal(localUrl("/media/logo.png", "/"), "/media/logo.png");
  assert.equal(localUrl("#food", "/moon-foods/"), "#food");
  assert.equal(
    localUrl("https://example.square.site/", "/moon-foods/"),
    "https://example.square.site/",
  );
  assert.equal(isSquareReady("[SQUARE_ORDERING_URL]"), false);
  assert.equal(isSquareReady("https://example.square.site/"), true);
});
test("invalid sections and unsafe button links fail before deployment", () => {
  const draft = structuredClone(homepage);
  draft.sections.push({
    ...draft.sections[0],
    buttonUrl: "javascript:alert(1)",
  });
  const errors = validateContent(business, draft, food);
  assert(errors.some((s) => s.includes("unique")));
  assert(errors.some((s) => s.includes("Unsafe")));
});
test("Pages CMS exposes every stored field and workflow uses official actions", () => {
  const cms = YAML.parse(
    readFileSync(new URL("../.pages.yml", import.meta.url), "utf8"),
  );
  const businessFields = cms.content
    .find((c) => c.name === "business")
    .fields.map((f) => f.name);
  assert.deepEqual([...businessFields].sort(), Object.keys(business).sort());
  for (const [name, data, key] of [
    ["homepage", homepage, "sections"],
    ["food", food, "categories"],
  ]) {
    const list = cms.content.find((c) => c.name === name).fields[0];
    assert.equal(list.list, true);
    assert.deepEqual(
      list.fields.map((f) => f.name).sort(),
      Object.keys(data[key][0]).sort(),
    );
  }
  const workflow = YAML.parse(
    readFileSync(
      new URL("../.github/workflows/deploy.yml", import.meta.url),
      "utf8",
    ),
  );
  assert(workflow.on.push.branches.includes("main"));
  assert.equal(workflow.permissions.pages, "write");
  assert(
    workflow.jobs.build.steps.some((s) => s.uses === "withastro/action@v6"),
  );
  assert.equal(workflow.jobs.deploy.steps[0].uses, "actions/deploy-pages@v5");
});
