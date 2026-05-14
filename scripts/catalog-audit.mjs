import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

const sourceFiles = {
  productCatalog: "src/data/productCatalog.ts",
  rcParts: "src/data/rcParts.ts",
  catalogExpansion20260513: "src/data/catalogExpansion20260513.ts",
  sourcedCatalog: "src/data/sourcedCatalogProducts.ts",
  researchedVerified: "src/data/researchedVerifiedCatalogProducts.ts",
  sakura: "src/data/sakuraCatalogProducts.ts",
  shibata: "src/data/shibataGrkCatalogProducts.ts",
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

const supportPattern = /\b(pin set|screw set|screws?|nuts?|washers?|bushings?|rod ends?|ball cups?|bracket|adapter|holder|posts?|retainer|protector|cover|tape|decal|stickers?|tool|spring end|o-?rings?|x-?rings?|fan|wire|connector)\b/i;

const tuneRelevantCategories = new Set([
  "chassis",
  "decks",
  "upperDecks",
  "lowerDecks",
  "dampers",
  "springs",
  "frontKnuckles",
  "knucklePlates",
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
  "gearDiffs",
  "ballDiffs",
  "solidAxles",
  "spurGears",
  "pinionGears",
  "frontWheels",
  "rearWheels",
  "tires",
  "servos",
  "gyros",
  "motors",
  "escs",
  "frontShockTowers",
  "rearShockTowers",
  "shockPistons",
  "shockShafts",
  "damperOils",
  "motorRotors",
  "motorStators",
  "capacitors",
  "motorMounts",
  "bellcranks",
  "slideRacks",
  "steeringRacks",
  "servoHorns",
  "batteries"
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

function catalogItemsFromCalls(file, callName = "catalogItem") {
  const source = readSource(file);
  const results = [];
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText() === callName && node.arguments[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
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
  const labelText = `${item.productName} ${item.modelNumber}`;
  if (!tuneRelevantCategories.has(category)) return "";
  if (supportPattern.test(labelText)) return "support/hardware/accessory wording in tune-relevant category";
  if (category === "frontUpperArms" && !/upper.*arm|front\s+upper.*arm|rear\s+upper.*arm|upper link|upper.*wishbone/i.test(text)) return "not an actual front upper arm";
  if (category === "rearUpperArms" && !/upper.*arm|front\s+upper.*arm|rear\s+upper.*arm|upper link|upper.*wishbone/i.test(text)) return "not an actual rear upper arm";
  if ((category === "frontLowerArms" || category === "rearLowerArms") && (!/lower.*arm|front\s+lower.*arm|rear\s+lower.*arm|h arm|a arm|suspension arm|lower.*wishbone/i.test(text) || /upright set|suspension arm\s*&\s*upright|wheel hub|pin|shaft|rod end|ball stud|bearing|weight/i.test(text))) return "not an actual lower arm";
  if (category === "frontKnuckles" && !/knuckle|steering block|upright/i.test(text)) return "not a knuckle/upright";
  if (category === "knucklePlates" && !/knuckle.*plate|plate.*knuckle/i.test(text)) return "not a knuckle plate";
  if (category === "rearHubCarriers" && (!/rear hub|hub carrier|rear upright|rear knuckle|upright/i.test(text) || /plate/i.test(text))) return "not a rear hub carrier/upright";
  if (category === "frontShockTowers" && !/front.*(shock|damper).*tower|ft.*(shock|damper).*tower/i.test(text)) return "not a front shock tower";
  if (category === "rearShockTowers" && !/rear.*(shock|damper).*tower|rt.*(shock|damper).*tower|rear.*damper.*stay|damper.*stay/i.test(text)) return "not a rear shock tower";
  if (category === "decks" && (!/\b(deck|chassis plate|main chassis|upper deck|lower deck|side deck|conversion plate)\b/i.test(text) || /\b(esc|motor|rear|front|servo|battery|body)\s+mount\b/i.test(labelText))) return "not a deck/chassis plate";
  if ((category === "frontToeBlocks" || category === "rearToeBlocks") && /\b(upper arm mount|rear upper arm mount|servo mount|esc mount|battery mount|body mount|spring retainer|hex hub|connector|post|adapter)\b/i.test(text)) return "not a toe block/suspension mount";
  if (category === "gyros" && !/gyro|gyd|revox|sgs|dp-?302|yg-?302/i.test(text)) return "not a standalone gyro";
  if (category === "escs" && /fan|capacitor|program|mount|plate|cover/i.test(labelText)) return "ESC accessory in ESC category";
  if (category === "motors" && /mount|plate|fan|rotor|stator|screw/i.test(labelText)) return "motor accessory in motor category";
  if (category === "servos" && /horn|mount|saver|case/i.test(labelText)) return "servo accessory in servo category";
  if (category === "servoHorns" && (!/servo\s*horn|horn arm/i.test(text) || /\b(rc28|rc8|1[-/ ]?24|1[-/ ]?28|axles?|steering block|suspension mount set)\b/i.test(text))) return "not a standalone 1/10 drift servo horn";
  if (category === "shockPistons" && !/piston/i.test(text)) return "not a shock piston";
  if (category === "shockShafts" && (!/(?:shock|damper).{0,30}shaft|shaft.{0,30}(?:shock|damper)/i.test(text) || /\bguide|e-?clips?|clip pack|hardware\b/i.test(labelText))) return "not a shock shaft";
  if (category === "damperOils" && !/oil|fluid/i.test(text)) return "not damper/shock oil";
  if (category === "motorRotors" && !/rotor/i.test(text)) return "not a motor rotor";
  if (category === "motorStators" && !/stator/i.test(text)) return "not a motor stator";
  if (category === "capacitors" && !/capacitor|cap\b/i.test(text)) return "not an ESC capacitor";
  if (category === "dampers" && /combo|piston|shaft|rebuild|o-?ring|x-?ring|cap|retainer|oil|fluid|connector|spacer|shim/i.test(text) && !/oil absorber/i.test(text)) return "shock support item in damper category";
  if ((category === "frontWheels" || category === "rearWheels") && /tire set|tyre set|rim[-\s]?tire|mounted|pre-mounted|hub|axle|stickers?|decals?/i.test(text)) return "not a standalone wheel";
  if (category === "tires" && /mounted|pre-assembled|pre assembled|wheel set|rim set/i.test(text)) return "not a standalone tire";
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
const researchedVerified = catalogItemsFromCalls(sourceFiles.researchedVerified, "verifiedProduct");
const catalogExpansion20260513 = catalogItemsFromCalls(sourceFiles.catalogExpansion20260513, "researchedItem");
const sakuraCatalog = [
  ...catalogItemsFromCalls(sourceFiles.sakura, "d5"),
  ...catalogItemsFromCalls(sourceFiles.sakura, "d6"),
  ...catalogItemsFromCalls(sourceFiles.sakura, "sakuraItem")
].filter((item) => item.productName);
const shibataCatalog = catalogItemsFromCalls(sourceFiles.shibata, "shibataItem").filter((item) => item.productName);
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

const rawItems = [...electronicsCatalog, ...inlineCatalog, ...researchedVerified, ...catalogExpansion20260513, ...sakuraCatalog, ...shibataCatalog, ...sourcedCatalog, ...sourcedWizard, ...sourcedWheelCatalog].map((item, index) => ({
  index,
  ...item,
  id: item.id || item.slug || "",
  category: item.category || "unknown",
  brand: item.brand || "",
  productName: item.productName || item.model || "",
  modelNumber: item.modelNumber || item.partNumber || ""
}));

const isVisibleSelectorItem = (item) => item.tuneSelectable !== false && !item.hiddenFromTuneBuilder;
const visibleItems = rawItems.filter(isVisibleSelectorItem);

const rawExactGroups = groupBy(rawItems, (item) => [item.category, normalize(item.brand), normalize(item.productName), normalize(item.modelNumber)].join("|"));
const rawNearGroups = groupBy(rawItems, (item) => [item.category, normalize(item.brand), normalize(`${item.brand} ${item.productName}`)].join("|"));
const exactGroups = groupBy(visibleItems, (item) => [item.category, normalize(item.brand), normalize(item.productName), normalize(item.modelNumber)].join("|"));
const nearGroups = groupBy(visibleItems, (item) => [item.category, normalize(item.brand), normalize(`${item.brand} ${item.productName}`)].join("|"));
const rawWrongCategoryItems = rawItems
  .map((item) => ({ ...item, reason: wrongCategoryReason(item) }))
  .filter((item) => item.reason);
const wrongCategoryItems = visibleItems
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
    researchedVerified: researchedVerified.length,
    catalogExpansion20260513: catalogExpansion20260513.length,
    sakuraCatalog: sakuraCatalog.length,
    shibataCatalog: shibataCatalog.length,
    sourcedWizard: sourcedWizard.length,
    inlineCatalog: inlineCatalog.length,
    rawCatalogRows: rawItems.length,
    visibleSelectorRows: visibleItems.length
  },
  rawExactDuplicateGroups: rawExactGroups.length,
  rawExactDuplicateRows: rawExactGroups.reduce((total, [, items]) => total + items.length, 0),
  rawNearDuplicateGroups: rawNearGroups.length,
  rawNearDuplicateRows: rawNearGroups.reduce((total, [, items]) => total + items.length, 0),
  rawWrongCategoryRows: rawWrongCategoryItems.length,
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
