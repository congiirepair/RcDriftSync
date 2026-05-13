import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";
import type { Car, Tune } from "../types";
import { downloadPdf } from "./pdfExport";
import { bestForTags, feelForTune, feelLabels, tuneConfidence } from "./tuneInsights";

interface UniversalPdfRow {
  label: string;
  fieldId?: string;
  value?: string | number | boolean | string[];
}

interface UniversalPdfSection {
  title: string;
  rows: UniversalPdfRow[];
}

interface UniversalPdfOptions {
  shareUrl?: string;
}

const pageSize: [number, number] = [595.276, 841.89];
const margin = 36;
const text = rgb(0.07, 0.1, 0.13);
const muted = rgb(0.35, 0.42, 0.5);
const accent = rgb(0, 0.55, 0.95);
const accent2 = rgb(0, 0.82, 1);
const dark = rgb(0.02, 0.05, 0.09);
const darkPanel = rgb(0.05, 0.1, 0.15);
const line = rgb(0.72, 0.82, 0.9);
const panel = rgb(0.96, 0.985, 1);
const softPanel = rgb(0.9, 0.96, 1);
const ignoredAdditionalKeys = new Set([
  "id",
  "ownerId",
  "ownerUsername",
  "ownerDisplayName",
  "shareId",
  "visibility",
  "cloneEnabled",
  "pdfDownloadEnabled",
  "createdAt",
  "updatedAt",
  "dataUrl",
  "cloudUrl",
  "publicId",
  "provider"
]);

function valueFor(tune: Tune, row: UniversalPdfRow) {
  if (row.value !== undefined) return row.value;
  if (!row.fieldId) return "";
  if (row.fieldId === "name") return tune.name;
  if (row.fieldId === "date") return tune.date;
  if (row.fieldId === "track") return tune.track;
  if (row.fieldId === "surface") return tune.surface;
  if (row.fieldId === "grip") return tune.grip;
  if (row.fieldId === "rating") return tune.rating;
  if (row.fieldId === "tags") return tune.tags.join(", ");
  if (row.fieldId === "notes") return tune.notes;
  return firstValue(
    tune.values[row.fieldId],
    tune.selections[row.fieldId],
    structuredValueFor(tune, row.fieldId),
    advancedValueFor(tune, row.fieldId)
  );
}

function cleanValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "Skipped";
  if (Array.isArray(value)) return value.join(", ") || "Skipped";
  return String(value);
}

function hasValue(value: unknown) {
  const cleaned = cleanValue(value).trim();
  return Boolean(cleaned && !["Skipped", "Not applicable", "N/A", "Not sure", "Skip for now"].includes(cleaned));
}

function firstValue(...values: unknown[]) {
  return values.find(hasValue) ?? "";
}

function partValue(part?: { brand?: string; model?: string; notes?: string; length?: string; offset?: string; width?: string; shims?: string; toeAngle?: string | number; rate?: string }) {
  if (!part) return "";
  return [part.brand, part.model, part.length, part.offset ? `${part.offset} offset` : "", part.width ? `${part.width} wide` : "", part.rate, part.toeAngle ? `${part.toeAngle} toe` : "", part.shims ? `${part.shims} shims` : ""]
    .filter(hasValue)
    .join(" ");
}

function profileName(item?: { selectedProfileId?: string; profileSnapshot?: string | Record<string, string | number | boolean | string[]> }) {
  if (!item?.profileSnapshot) return item?.selectedProfileId ?? "";
  if (typeof item.profileSnapshot === "string") return item.profileSnapshot;
  return firstValue(item.profileSnapshot.profileName, item.profileSnapshot.name, item.selectedProfileId);
}

function advancedValueFor(tune: Tune, fieldId: string) {
  return firstValue(
    tune.advancedSetup?.frontAlignment?.[fieldId],
    tune.advancedSetup?.rearAlignment?.[fieldId],
    tune.advancedSetup?.shocks?.[fieldId],
    tune.advancedSetup?.drivetrain?.[fieldId],
    tune.advancedSetup?.weightBalance?.[fieldId],
    tune.advancedSetup?.bodyAero?.[fieldId],
    tune.advancedSetup?.officialPdfFields?.[fieldId]
  );
}

function structuredValueFor(tune: Tune, fieldId: string) {
  const map: Record<string, unknown> = {
    chassisBrand: tune.customChassisBrand || tune.chassisBrand || tune.chassisSetup?.chassis?.brand,
    chassisModel: tune.customChassisModel || tune.chassisModel || tune.chassisSetup?.chassis?.model,
    chassisDeck: tune.chassisSetup?.chassis?.deck,
    chassisCustomizations: tune.chassisSetup?.chassis?.customizations,
    frontDamper: partValue(tune.chassisSetup?.front?.dampers),
    frontSpringBrand: tune.chassisSetup?.front?.spring?.brand,
    frontSpring: partValue(tune.chassisSetup?.front?.spring),
    frontKnuckle: partValue(tune.chassisSetup?.front?.knuckle),
    frontAxle: partValue(tune.chassisSetup?.front?.axle),
    frontWheel: partValue(tune.chassisSetup?.front?.wheel),
    frontWheelBrand: tune.chassisSetup?.front?.wheel?.brand,
    frontWheelOffset: tune.chassisSetup?.front?.wheel?.offset,
    frontWheelWidth: tune.chassisSetup?.front?.wheel?.width,
    frontUpperArm: partValue(tune.chassisSetup?.front?.upperArm),
    frontLowerArm: partValue(tune.chassisSetup?.front?.lowerArm),
    frontLowerArmShims: tune.chassisSetup?.front?.lowerArm?.shims,
    frontToeBlock: partValue(tune.chassisSetup?.front?.toeBlock),
    rearDamper: partValue(tune.chassisSetup?.rear?.dampers),
    rearUpperArm: partValue(tune.chassisSetup?.rear?.upperArm),
    rearLowerArm: partValue(tune.chassisSetup?.rear?.lowerArm),
    rearLowerArmShims: tune.chassisSetup?.rear?.lowerArm?.shims,
    rearHubCarrier: partValue(tune.chassisSetup?.rear?.hubCarrier),
    rearAxle: partValue(tune.chassisSetup?.rear?.axle),
    rearAxleLength: tune.chassisSetup?.rear?.axle?.length,
    rearWheel: partValue(tune.chassisSetup?.rear?.wheel),
    rearWheelBrand: tune.chassisSetup?.rear?.wheel?.brand,
    rearWheelOffset: tune.chassisSetup?.rear?.wheel?.offset,
    rearWheelWidth: tune.chassisSetup?.rear?.wheel?.width,
    rearToeBlock: partValue(tune.chassisSetup?.rear?.toeBlock),
    escBrand: tune.electronics?.esc?.brand,
    escModel: tune.electronics?.esc?.customName || tune.electronics?.esc?.model,
    escProfileName: profileName(tune.electronics?.esc),
    escFirmwareVersion: tune.electronics?.esc?.firmware,
    escNotes: tune.electronics?.esc?.notes,
    motor: tune.electronics?.motor?.customName || tune.electronics?.motor?.model,
    motorBrand: tune.electronics?.motor?.brand,
    motorTurns: tune.electronics?.motor?.turns,
    motorTiming: tune.electronics?.motor?.timing,
    motorRotor: tune.electronics?.motor?.rotor,
    servoBrand: tune.electronics?.servo?.brand,
    servoModel: tune.electronics?.servo?.customName || tune.electronics?.servo?.model,
    servoProfileName: profileName(tune.electronics?.servo),
    servoNotes: tune.electronics?.servo?.notes,
    gyroBrand: tune.electronics?.gyro?.brand,
    gyroModel: tune.electronics?.gyro?.customName || tune.electronics?.gyro?.model,
    gyroProfileName: profileName(tune.electronics?.gyro),
    gyroGain: tune.electronics?.gyro?.gain ?? tune.electronics?.gyro?.settings?.gain,
    gyroMode: tune.electronics?.gyro?.mode ?? tune.electronics?.gyro?.settings?.mode,
    gyroNotes: tune.electronics?.gyro?.notes,
    radioBrand: tune.electronics?.receiver?.brand,
    radioModel: tune.electronics?.receiver?.customName || tune.electronics?.receiver?.model,
    battery: tune.electronics?.battery?.customName || tune.electronics?.battery?.model
  };
  const electronicsSettings = {
    ...tune.electronics?.esc?.settings,
    ...tune.electronics?.servo?.settings,
    ...tune.electronics?.gyro?.settings,
    ...tune.electronics?.motor?.settings
  };
  return firstValue(map[fieldId], electronicsSettings[fieldId]);
}

function rowsFor(ids: Array<[string, string]>): UniversalPdfRow[] {
  return ids.map(([label, fieldId]) => ({ label, fieldId }));
}

function prettyLabel(key: string) {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace(/\bEsc\b/g, "ESC")
    .replace(/\bFdr\b/g, "FDR")
    .replace(/\bKpi\b/g, "KPI");
}

function flattenRecord(record: unknown, prefix: string, out: UniversalPdfRow[], seen: Set<string>) {
  if (!record || typeof record !== "object" || Array.isArray(record)) return;
  Object.entries(record as Record<string, unknown>).forEach(([key, value]) => {
    if (ignoredAdditionalKeys.has(key) || key.toLowerCase().includes("slug")) return;
    const path = prefix ? `${prefix}.${key}` : key;
    if (seen.has(path)) return;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      flattenRecord(value, path, out, seen);
      return;
    }
    if (!hasValue(value)) return;
    seen.add(path);
    out.push({ label: prettyLabel(path.split(".").join(" / ")), value: value as string | number | boolean | string[] });
  });
}

function additionalSavedRows(tune: Tune, usedFieldIds: Set<string>) {
  const rows: UniversalPdfRow[] = [];
  const seen = new Set<string>();
  Object.entries(tune.values ?? {}).forEach(([key, value]) => {
    if (usedFieldIds.has(key) || ignoredAdditionalKeys.has(key) || !hasValue(value)) return;
    seen.add(key);
    rows.push({ label: prettyLabel(key), value });
  });
  Object.entries(tune.selections ?? {}).forEach(([key, value]) => {
    if (usedFieldIds.has(key) || seen.has(key) || ignoredAdditionalKeys.has(key) || !hasValue(value)) return;
    seen.add(key);
    rows.push({ label: prettyLabel(key), value });
  });
  flattenRecord(tune.advancedSetup, "Advanced", rows, seen);
  flattenRecord(tune.electronics, "Electronics", rows, seen);
  flattenRecord(tune.chassisSetup, "Chassis Setup", rows, seen);
  return rows.filter((row) => cleanValue(row.value) !== "Skipped").slice(0, 140);
}

function sectionsFor(tune: Tune, car: Car): UniversalPdfSection[] {
  const sections: UniversalPdfSection[] = [
    {
      title: "Tune Basics",
      rows: [
        { label: "Tune name", fieldId: "name" },
        { label: "Date", fieldId: "date" },
        { label: "Driver", fieldId: "driver" },
        { label: "Rating", fieldId: "rating" },
        { label: "Tags", fieldId: "tags" },
        { label: "Notes", fieldId: "notes" }
      ]
    },
    {
      title: "Car / Chassis",
      rows: [
        { label: "Car", value: car.name },
        { label: "Brand", value: car.brand },
        { label: "Chassis", value: car.chassisModel || car.chassis },
        { label: "Chassis type", value: car.chassisType },
        { label: "Drivetrain", value: car.drivetrainType },
        { label: "Motor layout", value: car.motorLayout },
        { label: "Scale", value: car.scale },
        { label: "Body", value: car.body || tune.values.body || tune.values.bodyShell },
        { label: "Default tire", value: car.defaultTire || tune.values.tires }
      ]
    },
    {
      title: "Track / Surface",
      rows: [
        { label: "Track / location", fieldId: "track" },
        { label: "Surface", fieldId: "surface" },
        { label: "Grip level", fieldId: "grip" },
        { label: "Tire", fieldId: "tires" },
        { label: "Best for", value: bestForTags(tune).join(", ") },
        { label: "Confidence", value: `${tuneConfidence(tune)}/5` }
      ]
    },
    {
      title: "Expected Car Feel",
      rows: feelLabels.map((item) => {
        const value = Number(feelForTune(tune)[item.key] ?? 5);
        return { label: item.label, value: `${value}/10 (${value <= 3 ? item.low : value >= 8 ? item.high : "balanced"})` };
      })
    },
    { title: "Front Setup", rows: rowsFor([["Ride height", "frontRideHeight"], ["Camber", "frontCamber"], ["Toe", "frontToe"], ["Caster", "caster"], ["KPI", "kpi"], ["Ackerman", "ackerman"], ["Track width", "frontTrackWidth"], ["Wheel offset", "frontWheelOffset"], ["Spring", "frontSpring"], ["Shock oil", "frontShockOil"], ["Piston", "frontPiston"], ["Shock shaft", "frontShockShaft"], ["Shock position", "frontShockPosition"], ["Upper arm / link", "frontUpperLink"], ["Lower arm", "frontLowerArm"], ["Knuckle", "frontKnuckle"], ["Knuckle plate", "frontKnucklePlate"], ["Hub", "frontHub"], ["Offset spacer", "frontOffsetSpacer"], ["FF suspension mount", "ffToeBlock"], ["FF left insert", "ffToeBlockLeftInsert"], ["FF right insert", "ffToeBlockRightInsert"], ["FR suspension mount", "frToeBlock"], ["FR left insert", "frToeBlockLeftInsert"], ["FR right insert", "frToeBlockRightInsert"], ["FF shim", "ffToeBlockShim"], ["FR shim", "frToeBlockShim"], ["Spacer notes", "frontSpacerNotes"], ["Memo", "frontMemo"]]) },
    { title: "Rear Setup", rows: rowsFor([["Ride height", "rearRideHeight"], ["Camber", "rearCamber"], ["Toe", "rearToe"], ["Skid angle", "skidAngle"], ["Track width", "rearTrackWidth"], ["Wheel offset", "rearWheelOffset"], ["Spring", "rearSpring"], ["Shock oil", "rearShockOil"], ["Piston", "rearPiston"], ["Shock shaft", "rearShockShaft"], ["Shock position", "rearShockPosition"], ["Upper arm / link", "rearUpperLink"], ["Lower arm", "rearLowerArm"], ["Hub carrier", "rearHubCarrier"], ["Offset spacer", "rearOffsetSpacer"], ["RF suspension mount", "rfToeBlock"], ["RF left insert", "rfToeBlockLeftInsert"], ["RF right insert", "rfToeBlockRightInsert"], ["RR suspension mount", "rrToeBlock"], ["RR left insert", "rrToeBlockLeftInsert"], ["RR right insert", "rrToeBlockRightInsert"], ["RF shim", "rfToeBlockShim"], ["RR shim", "rrToeBlockShim"], ["Spacer notes", "rearSpacerNotes"], ["Memo", "rearMemo"]]) },
    { title: "Drivetrain", rows: rowsFor([["Motor position", "motorPosition"], ["Ball diff setting", "ballDiffSetting"], ["Gear diff oil", "gearDiffOil"], ["LSD setting", "lsdSetting"], ["Spur gear", "spurGear"], ["Pinion gear", "pinionGear"], ["Final drive ratio", "finalDriveRatio"], ["Belt / shaft notes", "beltShaftNotes"], ["Memo", "drivetrainMemo"]]) },
    { title: "Weight and Body", rows: rowsFor([["Battery position", "batteryPosition"], ["Added weight", "addedWeight"], ["Weight location", "weightLocation"], ["Chassis brace", "chassisBrace"], ["Body shell", "bodyShell"], ["Wing", "aeroWing"], ["Aero notes", "aeroNotes"], ["Weight balance notes", "weightBalanceNotes"]]) },
    { title: "ESC Tune", rows: rowsFor([["ESC brand", "escBrand"], ["ESC model", "escModel"], ["Profile name", "escProfileName"], ["Power capacitor", "powerCapacitor"], ["Capacitor connection", "acuvancePowerConnection"], ["Capacitor install", "acuvancePowerInstallMethod"], ["Capacitor mount", "acuvancePowerMountLocation"], ["Capacitor wiring", "acuvancePowerWiringNotes"], ["Throttle curve", "throttleCurve"], ["Throttle punch", "throttlePunch"], ["Brake strength", "brakeStrength"], ["Drag brake", "dragBrake"], ["Neutral brake", "neutralBrake"], ["Initial brake", "initialBrake"], ["Boost timing", "boostTiming"], ["Boost start RPM", "boostStartRpm"], ["Boost end RPM", "boostEndRpm"], ["Turbo timing", "turboTiming"], ["Turbo delay", "turboDelay"], ["Turbo slope", "turboSlope"], ["Motor timing", "motorTiming"], ["PWM frequency", "pwmFrequency"], ["Drive frequency", "driveFrequency"], ["Brake frequency", "brakeFrequency"], ["BEC voltage", "becVoltage"], ["Current limit", "currentLimit"], ["Reverse strength", "reverseStrength"], ["Motor rotation", "motorRotation"], ["Firmware", "escFirmwareVersion"], ["Notes", "escNotes"]]) },
    { title: "Servo Tune", rows: rowsFor([["Servo brand", "servoBrand"], ["Servo model", "servoModel"], ["Horn length", "servoHornLength"], ["Spline", "servoSpline"], ["Speed setting", "servoSpeedSetting"], ["Torque setting", "servoTorqueSetting"], ["Endpoint left", "endpointLeft"], ["Endpoint right", "endpointRight"], ["Center trim", "centerTrim"], ["Subtrim", "subtrim"], ["Deadband", "deadband"], ["Frequency", "servoFrequency"], ["Voltage", "servoVoltage"], ["Mode", "directMode"], ["Saver / solid horn", "servoSaver"], ["Notes", "servoNotes"]]) },
    { title: "Gyro Tune", rows: rowsFor([["Gyro brand", "gyroBrand"], ["Gyro model", "gyroModel"], ["Gain", "gyroGain"], ["Mode", "gyroMode"], ["Endpoint setting", "gyroEndpointSetting"], ["Curve setting", "gyroCurveSetting"], ["Gain from transmitter", "gainFromTransmitter"], ["Direction", "gyroDirection"], ["Notes", "gyroNotes"]]) },
    { title: "Radio Tune", rows: rowsFor([["Radio brand", "radioBrand"], ["Radio model", "radioModel"], ["Steering dual rate", "steeringDualRate"], ["Steering expo", "steeringExpo"], ["Throttle expo", "throttleExpo"], ["Throttle curve", "radioThrottleCurve"], ["Brake curve", "brakeCurve"], ["Channel mixing notes", "channelMixingNotes"], ["Steering endpoint left", "steeringEndpointLeft"], ["Steering endpoint right", "steeringEndpointRight"], ["Throttle endpoint", "throttleEndpoint"], ["Brake endpoint", "brakeEndpoint"], ["Notes", "radioNotes"]]) },
    { title: "Driver Notes", rows: rowsFor([["General notes", "generalNotes"], ["Track notes", "trackNotes"], ["What changed", "whatChanged"], ["How it felt", "howItFelt"], ["Next changes to try", "nextChanges"]]) }
  ];
  const usedFieldIds = new Set(sections.flatMap((section) => section.rows.map((row) => row.fieldId).filter(Boolean) as string[]));
  const additionalRows = additionalSavedRows(tune, usedFieldIds);
  if (additionalRows.length) sections.push({ title: "Additional Saved Parameters", rows: additionalRows });
  return sections.map((section) => ({
    ...section,
    rows: section.rows.filter((row) => cleanValue(valueFor(tune, row)) !== "Skipped")
  }));
}

function wrapText(textValue: string, font: PDFFont, size: number, maxWidth: number) {
  const words = textValue.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
    else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function ensureSpace(pdf: PDFDocument, currentPage: PDFPage, y: number, needed: number) {
  if (y - needed > margin) return { page: currentPage, y };
  const page = pdf.addPage(pageSize);
  drawFooter(page);
  return { page, y: pageSize[1] - margin };
}

function drawFooter(page: PDFPage) {
  page.drawLine({ start: { x: margin, y: 30 }, end: { x: pageSize[0] - margin, y: 30 }, thickness: 0.75, color: line });
  page.drawText("RC Drift Sync | rcdriftsync.com", { x: margin, y: 16, size: 8, color: muted });
  page.drawText("Digital garage setup sheet", { x: pageSize[0] - 148, y: 16, size: 8, color: muted });
  return;
  page.drawText("RC Drift Sync · rcdriftsync.com", { x: margin, y: 18, size: 8, color: muted });
  page.drawRectangle({ x: pageSize[0] - 98, y: 14, width: 62, height: 62, borderColor: line, borderWidth: 1 });
  page.drawText("QR", { x: pageSize[0] - 77, y: 41, size: 12, color: muted });
}

function drawHeader(page: PDFPage, bold: PDFFont, tune: Tune, car: Car) {
  page.drawRectangle({ x: 0, y: pageSize[1] - 112, width: pageSize[0], height: 112, color: dark });
  page.drawRectangle({ x: 0, y: pageSize[1] - 112, width: pageSize[0], height: 4, color: accent2 });
  page.drawRectangle({ x: margin, y: pageSize[1] - 88, width: pageSize[0] - margin * 2, height: 58, borderColor: accent, borderWidth: 1, color: darkPanel });
  page.drawText("RC DRIFT SYNC", { x: margin + 14, y: pageSize[1] - 53, size: 21, font: bold, color: rgb(0.94, 0.98, 1) });
  page.drawText("Themed tuning parameter sheet", { x: margin + 16, y: pageSize[1] - 72, size: 9.5, color: rgb(0.55, 0.84, 1) });
  page.drawText(tune.name.slice(0, 34), { x: 300, y: pageSize[1] - 52, size: 13, font: bold, color: rgb(0.94, 0.98, 1) });
  page.drawText(`${car.name} | ${car.chassisModel || car.chassis}`.slice(0, 50), { x: 300, y: pageSize[1] - 70, size: 8.5, color: rgb(0.68, 0.82, 0.94) });
  return;
  page.drawRectangle({ x: 0, y: pageSize[1] - 92, width: pageSize[0], height: 92, color: rgb(0.05, 0.09, 0.1) });
  page.drawText("RC Drift Sync", { x: margin, y: pageSize[1] - 40, size: 22, font: bold, color: rgb(0.92, 0.98, 0.96) });
  page.drawText("Universal RC Drift Setup Sheet", { x: margin, y: pageSize[1] - 62, size: 11, color: rgb(0.65, 0.78, 0.74) });
  page.drawText(tune.name, { x: 300, y: pageSize[1] - 39, size: 14, font: bold, color: rgb(0.92, 0.98, 0.96) });
  page.drawText(`${car.name} · ${car.chassisModel || car.chassis}`, { x: 300, y: pageSize[1] - 59, size: 9, color: rgb(0.65, 0.78, 0.74) });
}

function drawSection(page: PDFPage, y: number, section: UniversalPdfSection, bold: PDFFont) {
  page.drawRectangle({ x: margin, y: y - 26, width: pageSize[0] - margin * 2, height: 26, borderColor: accent, borderWidth: 0.7, color: softPanel });
  page.drawRectangle({ x: margin, y: y - 26, width: 5, height: 26, color: accent2 });
  page.drawText(section.title.toUpperCase(), { x: margin + 12, y: y - 18, size: 10.5, font: bold, color: rgb(0.02, 0.18, 0.28) });
  return y - 34;
}

function drawRow(page: PDFPage, y: number, row: UniversalPdfRow, tune: Tune, font: PDFFont, bold: PDFFont) {
  const labelWidth = 132;
  const valueWidth = pageSize[0] - margin * 2 - labelWidth - 18;
  const value = cleanValue(valueFor(tune, row));
  const lines = wrapText(value, font, 8.5, valueWidth);
  const rowHeight = Math.max(22, lines.length * 11 + 9);
  page.drawRectangle({ x: margin, y: y - rowHeight + 3, width: pageSize[0] - margin * 2, height: rowHeight - 3, borderColor: rgb(0.86, 0.92, 0.96), borderWidth: 0.35, color: rgb(0.995, 1, 1) });
  page.drawRectangle({ x: margin, y: y - rowHeight + 3, width: labelWidth - 4, height: rowHeight - 3, color: panel });
  page.drawText(row.label.slice(0, 29), { x: margin + 7, y: y - 14, size: 8.1, font: bold, color: muted });
  lines.slice(0, 4).forEach((lineText, index) => {
    page.drawText(lineText, { x: margin + labelWidth, y: y - 14 - index * 10.5, size: 8.5, font, color: text });
  });
  return y - rowHeight;
}

function dataUrlParts(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], bytes: Uint8Array.from(atob(match[2]), (char) => char.charCodeAt(0)) };
}

async function drawPhotos(pdf: PDFDocument, page: PDFPage, y: number, tune: Tune, font: PDFFont, bold: PDFFont) {
  const photos = tune.photos.slice(0, 3);
  y = drawSection(page, y, { title: "Photos", rows: [] }, bold);
  if (!photos.length) {
    page.drawRectangle({ x: margin, y: y - 62, width: pageSize[0] - margin * 2, height: 54, borderColor: line, borderWidth: 1, color: rgb(1, 1, 1) });
    page.drawText("Photo placeholders: full car, front suspension, rear suspension, electronics, tires, body.", { x: margin + 10, y: y - 34, size: 8.5, font, color: muted });
    return y - 72;
  }
  let x = margin;
  for (const photo of photos) {
    const boxW = 160;
    const boxH = 96;
    page.drawRectangle({ x, y: y - boxH, width: boxW, height: boxH, borderColor: line, borderWidth: 1 });
    try {
      const parts = dataUrlParts(photo.dataUrl);
      if (parts) {
        const image = parts.mime.includes("png") ? await pdf.embedPng(parts.bytes) : await pdf.embedJpg(parts.bytes);
        page.drawImage(image, { x: x + 4, y: y - boxH + 18, width: boxW - 8, height: boxH - 26 });
      }
    } catch {
      page.drawText("Photo attached", { x: x + 10, y: y - 48, size: 9, font, color: muted });
    }
    page.drawText(photo.label, { x: x + 6, y: y - boxH + 6, size: 7.5, font: bold, color: muted });
    x += boxW + 12;
  }
  return y - 110;
}

function drawShareBlock(page: PDFPage, y: number, font: PDFFont, bold: PDFFont, options?: UniversalPdfOptions) {
  page.drawRectangle({ x: margin, y: y - 78, width: pageSize[0] - margin * 2, height: 66, borderColor: accent, borderWidth: 0.7, color: panel });
  page.drawText("Trackside reference", { x: margin + 12, y: y - 34, size: 10.5, font: bold, color: accent });
  page.drawText("Use this PDF as a clean readout of the saved tune. Make changes in RC Drift Sync, then export a fresh sheet.", { x: margin + 12, y: y - 50, size: 8.2, font, color: muted });
  if (options?.shareUrl) {
    page.drawText(options.shareUrl.slice(0, 74), { x: margin + 12, y: y - 64, size: 7.5, font, color: text });
  }
  page.drawRectangle({ x: pageSize[0] - margin - 54, y: y - 70, width: 42, height: 42, borderColor: line, borderWidth: 0.8, color: rgb(1, 1, 1) });
  page.drawText("QR", { x: pageSize[0] - margin - 39, y: y - 47, size: 10, font: bold, color: muted });
}

export async function generateUniversalTunePdf(tune: Tune, car: Car, options?: UniversalPdfOptions): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage(pageSize);
  drawHeader(page, bold, tune, car);
  drawFooter(page);
  let y = pageSize[1] - 136;

  for (const section of sectionsFor(tune, car).filter((section) => section.rows.length)) {
    ({ page, y } = ensureSpace(pdf, page, y, 52));
    y = drawSection(page, y, section, bold);
    for (const row of section.rows) {
      ({ page, y } = ensureSpace(pdf, page, y, 38));
      y = drawRow(page, y, row, tune, font, bold);
    }
    y -= 8;
  }

  ({ page, y } = ensureSpace(pdf, page, y, 150));
  y = await drawPhotos(pdf, page, y, tune, font, bold);
  ({ page, y } = ensureSpace(pdf, page, y, 84));
  drawShareBlock(page, y, font, bold, options);

  return pdf.save({ useObjectStreams: true });
}

export async function downloadUniversalTunePdf(tune: Tune, car: Car, options?: UniversalPdfOptions) {
  const bytes = await generateUniversalTunePdf(tune, car, options);
  downloadPdf(bytes, `${tune.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-rc-drift-sync-universal.pdf`);
}
