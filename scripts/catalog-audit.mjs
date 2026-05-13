import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

const sourceFiles = {
  productCatalog: "src/data/productCatalog.ts",
  rcParts: "src/data/rcParts.ts",
  sourcedCatalog: "src/data/sourcedCatalogProducts.ts",
  sourcedWizard: "src/data/sourcedWizardProducts.ts",
  sourcedWheel: "src/data/sourcedWheelProducts.ts"
};

const electronicsCategoryMap = {
  servo: "servos",
  gyro: "gyros",
  motor: "motors",
  esc: "escs",
  tire: "tires",
  wheel: "frontWheels"
};

const supportPattern = /\b(pin|pins|shaft|shafts|screw|screws|nut|nuts|washer|washers|shim|shims|spacer|spacers|bearing|bearings|bushing|bushings|rod end|rod ends|ball cup|ball cups|mount|bracket|adapter|holder|post|posts|retainer|protector|cover|tape|decal|tool|grease|oil|fluid|spring end|cap|o-?ring|x-?ring|hub weight|weight|fan|capacitor|wire|connector)\b/i;

const tuneRelevantCategories = new Set([
  "chassis",
  "decks",
  "dampers",
  "springs",
  "frontKnuckles",
  "rearHubCarriers",
  "frontAxles",
  "rearAxles",
  "frontToeBlocks",
  "rearToeBlocks",
  "frontLowerArms",
  "rearLowerArms",
  "frontUpperArms",
  "rearUpperArms",
  "differentials",
  "frontWheels",
  "rearWheels",
  "tires",
  "servos",
  "gyros",
  "motors",
  "escs"
]);

function readSource(file) {
  const absolute = path.join(root, file);
  return ts.createSourceFile(file, fs.readFileSync(absolute, "utf8"), ts.ScriptTarget.Latest, true);
}

function propName(node) {
  if (ts.isIdentifier(node)) return node.text;
  if (ts.isStringLiteral(node) || ts.isNumericLiteral(node)) return node.text;
  return node.getText();
}

function literal(node) {
  if (!node) return undefined;
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal).filter((value) => value !== undefined);
  return node.getText();
}

function objectRecord(node) {
  const record = {};
  if (!ts.isObjectLiteralExpression(node)) return record;
  node.properties.forEach((property) => {
    if (ts.isPropertyAssignment(property)) record[propName(property.name)] = literal(property.initializer);
  });
  return record;
}

function arrayObjects(file, variableName) {
  const source = readSource(file);
  const results = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText() === variableName && node.initializer && ts.isArrayLiteralExpression(node.initializer)) {
      node.initializer.elements.forEach((element) => {
        if (ts.isObjectLiteralExpression(element)) results.push(objectRecord(element));
      });
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return results;
}

function catalogItemsFromCalls(file) {
  const source = readSource(file);
  const results = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText() === "catalogItem" && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
      results.push(objectRecord(node.arguments[0]));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return results;
}

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b\d+(?:\.\d+)?\s*mm\b/g, " ")
    .replace(/\boff(?:set)?\s*[+-]?\s*\d+(?:\.\d+)?\b/g, " ")
    .replace(/\b\d+\s*offset\b/g, " ")
    .replace(/\b(1[-/ ]?10|1\/10|rc|r\/c|rims?|wheels?|wheel|drift|for|pack|pcs?|pieces|set|outlet|replacement|option|parts?|genuine|high performance)\b/g, " ")
    .replace(/[*_]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function groupBy(items, keyFn) {
  const groups = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });
  return Array.from(groups.entries()).filter(([, items]) => items.length > 1).sort((a, b) => b[1].length - a[1].length);
}

function wrongCategoryReason(item) {
  const category = item.category;
  const text = `${item.productName} ${item.modelNumber} ${item.notes ?? ""}`;
  if (!tuneRelevantCategories.has(category)) return "";
  if (supportPattern.test(text)) return "support/hardware/accessory wording in tune-relevant category";
  if (category === "frontUpperArms" && !/upper arm|upper link/i.test(text)) return "not an actual front upper arm";
  if (category === "rearUpperArms" && !/upper arm|upper link/i.test(text)) return "not an actual rear upper arm";
  if ((category === "frontLowerArms" || category === "rearLowerArms") && !/lower arm|h arm|a arm/i.test(text)) return "not an actual lower arm";
  if (category === "frontKnuckles" && !/knuckle|steering block|upright/i.test(text)) return "not a knuckle/upright";
  if (category === "rearHubCarriers" && !/rear hub|hub carrier|rear upright|rear knuckle|upright/i.test(text)) return "not a rear hub carrier/upright";
  if (category === "gyros" && !/gyro|gyd|revox|sgs|dp-?302|yg-?302/i.test(text)) return "not a standalone gyro";
  if (category === "escs" && /fan|capacitor|program|mount|plate|cover/i.test(text)) return "ESC accessory in ESC category";
  if (category === "motors" && /mount|plate|fan|rotor|stator|screw/i.test(text)) return "motor accessory in motor category";
  if (category === "servos" && /horn|mount|saver|case/i.test(text)) return "servo accessory in servo category";
  if ((category === "frontWheels" || category === "rearWheels") && /tire set|tyre set|mounted|pre-mounted|hub|axle/i.test(text)) return "not a standalone wheel";
  if (category === "tires" && /mounted|wheel set|rim set/i.test(text)) return "not a standalone tire";
  return "";
}

function summarize(items, count = 10) {
  return items.slice(0, count).map((item) => ({
    category: item.category,
    brand: item.brand,
    name: item.productName,
    model: item.modelNumber,
    id: item.id
  }));
}

const rcParts = arrayObjects(sourceFiles.rcParts, "rcParts");
const sourcedWheels = arrayObjects(sourceFiles.sourcedWheel, "sourcedWheelProducts");
const sourcedCatalog = arrayObjects(sourceFiles.sourcedCatalog, "sourcedCatalogItems");
const sourcedWizard = arrayObjects(sourceFiles.sourcedWizard, "sourcedWizardCatalogItems");
const inlineCatalog = catalogItemsFromCalls(sourceFiles.productCatalog);
const electronicsCatalog = rcParts
  .filter((part) => Object.prototype.hasOwnProperty.call(electronicsCategoryMap, part.category))
  .flatMap((part) => {
    const category = electronicsCategoryMap[part.category];
    const item = { ...part, category, productName: part.model, modelNumber: "" };
    return part.category === "wheel" ? [item, { ...item, category: "rearWheels" }] : [item];
  });
const sourcedWheelCatalog = sourcedWheels.flatMap((product) => [
  { ...product, category: "frontWheels" },
  { ...product, category: "rearWheels" }
]);

const rawItems = [...electronicsCatalog, ...inlineCatalog, ...sourcedCatalog, ...sourcedWizard, ...sourcedWheelCatalog].map((item, index) => ({
  index,
  ...item,
  id: item.id || item.slug || "",
  category: item.category || "unknown",
  brand: item.brand || "",
  productName: item.productName || item.model || "",
  modelNumber: item.modelNumber || item.partNumber || ""
}));

const exactGroups = groupBy(rawItems, (item) => [item.category, normalize(item.brand), normalize(item.productName), normalize(item.modelNumber)].join("|"));
const nearGroups = groupBy(rawItems, (item) => [item.category, normalize(item.brand), normalize(`${item.brand} ${item.productName}`)].join("|"));
const wrongCategoryItems = rawItems
  .map((item) => ({ ...item, reason: wrongCategoryReason(item) }))
  .filter((item) => item.reason);

const countBy = (items, field) => Object.entries(items.reduce((counts, item) => {
  const key = item[field] || "Unknown";
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {})).sort((a, b) => b[1] - a[1]);

const report = {
  counts: {
    rcParts: rcParts.length,
    sourcedWheelProducts: sourcedWheels.length,
    sourcedWheelCatalogRows: sourcedWheelCatalog.length,
    sourcedCatalog: sourcedCatalog.length,
    sourcedWizard: sourcedWizard.length,
    inlineCatalog: inlineCatalog.length,
    rawCatalogRows: rawItems.length
  },
  exactDuplicateGroups: exactGroups.length,
  exactDuplicateRows: exactGroups.reduce((total, [, items]) => total + items.length, 0),
  nearDuplicateGroups: nearGroups.length,
  nearDuplicateRows: nearGroups.reduce((total, [, items]) => total + items.length, 0),
  wrongCategoryRows: wrongCategoryItems.length,
  largestCategories: countBy(rawItems, "category").slice(0, 20),
  wrongCategoryByCategory: countBy(wrongCategoryItems, "category"),
  clutterByBrand: countBy([...wrongCategoryItems, ...nearGroups.flatMap(([, items]) => items)], "brand").slice(0, 20),
  exactDuplicateExamples: exactGroups.slice(0, 10).map(([key, items]) => ({ key, count: items.length, items: summarize(items, 6) })),
  nearDuplicateExamples: nearGroups.slice(0, 15).map(([key, items]) => ({ key, count: items.length, items: summarize(items, 6) })),
  wrongCategoryExamples: wrongCategoryItems.slice(0, 50).map((item) => ({
    category: item.category,
    brand: item.brand,
    name: item.productName,
    model: item.modelNumber,
    id: item.id,
    reason: item.reason
  }))
};

console.log(JSON.stringify(report, null, 2));
