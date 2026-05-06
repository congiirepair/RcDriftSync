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

const pageSize: [number, number] = [595.276, 841.89];
const margin = 36;
const text = rgb(0.08, 0.13, 0.13);
const muted = rgb(0.38, 0.45, 0.44);
const accent = rgb(0.03, 0.5, 0.39);
const line = rgb(0.84, 0.88, 0.86);
const panel = rgb(0.96, 0.98, 0.97);

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
  return tune.values[row.fieldId] ?? tune.selections[row.fieldId] ?? "";
}

function cleanValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "Skipped";
  if (Array.isArray(value)) return value.join(", ") || "Skipped";
  return String(value);
}

function rowsFor(ids: Array<[string, string]>): UniversalPdfRow[] {
  return ids.map(([label, fieldId]) => ({ label, fieldId }));
}

function sectionsFor(tune: Tune, car: Car): UniversalPdfSection[] {
  return [
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
        const value = feelForTune(tune)[item.key];
        return { label: item.label, value: `${value}/5 (${value <= 2 ? item.low : value >= 4 ? item.high : "balanced"})` };
      })
    },
    { title: "Front Setup", rows: rowsFor([["Ride height", "frontRideHeight"], ["Camber", "frontCamber"], ["Toe", "frontToe"], ["Caster", "caster"], ["KPI", "kpi"], ["Ackerman", "ackerman"], ["Track width", "frontTrackWidth"], ["Wheel offset", "frontWheelOffset"], ["Spring", "frontSpring"], ["Shock oil", "frontShockOil"], ["Piston", "frontPiston"], ["Shock shaft", "frontShockShaft"], ["Shock position", "frontShockPosition"], ["Upper arm / link", "frontUpperLink"], ["Lower arm", "frontLowerArm"], ["Knuckle", "frontKnuckle"], ["Hub", "frontHub"], ["Spacer notes", "frontSpacerNotes"], ["Memo", "frontMemo"]]) },
    { title: "Rear Setup", rows: rowsFor([["Ride height", "rearRideHeight"], ["Camber", "rearCamber"], ["Toe", "rearToe"], ["Skid angle", "skidAngle"], ["Track width", "rearTrackWidth"], ["Wheel offset", "rearWheelOffset"], ["Spring", "rearSpring"], ["Shock oil", "rearShockOil"], ["Piston", "rearPiston"], ["Shock shaft", "rearShockShaft"], ["Shock position", "rearShockPosition"], ["Upper arm / link", "rearUpperLink"], ["Lower arm", "rearLowerArm"], ["Hub carrier", "rearHubCarrier"], ["Spacer notes", "rearSpacerNotes"], ["Memo", "rearMemo"]]) },
    { title: "Drivetrain", rows: rowsFor([["Motor position", "motorPosition"], ["Ball diff setting", "ballDiffSetting"], ["Gear diff oil", "gearDiffOil"], ["LSD setting", "lsdSetting"], ["Spur gear", "spurGear"], ["Pinion gear", "pinionGear"], ["Final drive ratio", "finalDriveRatio"], ["Belt / shaft notes", "beltShaftNotes"], ["Memo", "drivetrainMemo"]]) },
    { title: "Weight and Body", rows: rowsFor([["Battery position", "batteryPosition"], ["Added weight", "addedWeight"], ["Weight location", "weightLocation"], ["Chassis brace", "chassisBrace"], ["Body shell", "bodyShell"], ["Wing", "aeroWing"], ["Aero notes", "aeroNotes"], ["Weight balance notes", "weightBalanceNotes"]]) },
    { title: "ESC Tune", rows: rowsFor([["ESC brand", "escBrand"], ["ESC model", "escModel"], ["Profile name", "escProfileName"], ["Throttle curve", "throttleCurve"], ["Throttle punch", "throttlePunch"], ["Brake strength", "brakeStrength"], ["Drag brake", "dragBrake"], ["Neutral brake", "neutralBrake"], ["Initial brake", "initialBrake"], ["Boost timing", "boostTiming"], ["Boost start RPM", "boostStartRpm"], ["Boost end RPM", "boostEndRpm"], ["Turbo timing", "turboTiming"], ["Turbo delay", "turboDelay"], ["Turbo slope", "turboSlope"], ["Motor timing", "motorTiming"], ["PWM frequency", "pwmFrequency"], ["Drive frequency", "driveFrequency"], ["Brake frequency", "brakeFrequency"], ["BEC voltage", "becVoltage"], ["Current limit", "currentLimit"], ["Reverse strength", "reverseStrength"], ["Motor rotation", "motorRotation"], ["Firmware", "escFirmwareVersion"], ["Notes", "escNotes"]]) },
    { title: "Servo Tune", rows: rowsFor([["Servo brand", "servoBrand"], ["Servo model", "servoModel"], ["Horn length", "servoHornLength"], ["Spline", "servoSpline"], ["Speed setting", "servoSpeedSetting"], ["Torque setting", "servoTorqueSetting"], ["Endpoint left", "endpointLeft"], ["Endpoint right", "endpointRight"], ["Center trim", "centerTrim"], ["Subtrim", "subtrim"], ["Deadband", "deadband"], ["Frequency", "servoFrequency"], ["Voltage", "servoVoltage"], ["Mode", "directMode"], ["Saver / solid horn", "servoSaver"], ["Notes", "servoNotes"]]) },
    { title: "Gyro Tune", rows: rowsFor([["Gyro brand", "gyroBrand"], ["Gyro model", "gyroModel"], ["Gain", "gyroGain"], ["Mode", "gyroMode"], ["Endpoint setting", "gyroEndpointSetting"], ["Curve setting", "gyroCurveSetting"], ["Gain from transmitter", "gainFromTransmitter"], ["Direction", "gyroDirection"], ["Notes", "gyroNotes"]]) },
    { title: "Radio Tune", rows: rowsFor([["Radio brand", "radioBrand"], ["Radio model", "radioModel"], ["Steering dual rate", "steeringDualRate"], ["Steering expo", "steeringExpo"], ["Throttle expo", "throttleExpo"], ["Throttle curve", "radioThrottleCurve"], ["Brake curve", "brakeCurve"], ["Channel mixing notes", "channelMixingNotes"], ["Steering endpoint left", "steeringEndpointLeft"], ["Steering endpoint right", "steeringEndpointRight"], ["Throttle endpoint", "throttleEndpoint"], ["Brake endpoint", "brakeEndpoint"], ["Notes", "radioNotes"]]) },
    { title: "Driver Notes", rows: rowsFor([["General notes", "generalNotes"], ["Track notes", "trackNotes"], ["What changed", "whatChanged"], ["How it felt", "howItFelt"], ["Next changes to try", "nextChanges"]]) }
  ].map((section) => ({
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
  page.drawText("RC Drift Sync · rcdriftsync.com", { x: margin, y: 18, size: 8, color: muted });
  page.drawRectangle({ x: pageSize[0] - 98, y: 14, width: 62, height: 62, borderColor: line, borderWidth: 1 });
  page.drawText("QR", { x: pageSize[0] - 77, y: 41, size: 12, color: muted });
}

function drawHeader(page: PDFPage, bold: PDFFont, tune: Tune, car: Car) {
  page.drawRectangle({ x: 0, y: pageSize[1] - 92, width: pageSize[0], height: 92, color: rgb(0.05, 0.09, 0.1) });
  page.drawText("RC Drift Sync", { x: margin, y: pageSize[1] - 40, size: 22, font: bold, color: rgb(0.92, 0.98, 0.96) });
  page.drawText("Universal RC Drift Setup Sheet", { x: margin, y: pageSize[1] - 62, size: 11, color: rgb(0.65, 0.78, 0.74) });
  page.drawText(tune.name, { x: 300, y: pageSize[1] - 39, size: 14, font: bold, color: rgb(0.92, 0.98, 0.96) });
  page.drawText(`${car.name} · ${car.chassisModel || car.chassis}`, { x: 300, y: pageSize[1] - 59, size: 9, color: rgb(0.65, 0.78, 0.74) });
}

function drawSection(page: PDFPage, y: number, section: UniversalPdfSection, bold: PDFFont) {
  page.drawRectangle({ x: margin, y: y - 24, width: pageSize[0] - margin * 2, height: 24, color: panel });
  page.drawText(section.title, { x: margin + 10, y: y - 17, size: 11, font: bold, color: accent });
  return y - 34;
}

function drawRow(page: PDFPage, y: number, row: UniversalPdfRow, tune: Tune, font: PDFFont, bold: PDFFont) {
  const labelWidth = 126;
  const valueWidth = pageSize[0] - margin * 2 - labelWidth - 18;
  const value = cleanValue(valueFor(tune, row));
  const lines = wrapText(value, font, 8.5, valueWidth);
  const rowHeight = Math.max(22, lines.length * 11 + 9);
  page.drawLine({ start: { x: margin, y: y - rowHeight + 3 }, end: { x: pageSize[0] - margin, y: y - rowHeight + 3 }, thickness: 0.4, color: line });
  page.drawText(row.label, { x: margin + 6, y: y - 14, size: 8.2, font: bold, color: muted });
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

export async function generateUniversalTunePdf(tune: Tune, car: Car): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage(pageSize);
  drawHeader(page, bold, tune, car);
  drawFooter(page);
  let y = pageSize[1] - 116;

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
  page.drawRectangle({ x: margin, y: y - 74, width: pageSize[0] - margin * 2, height: 62, borderColor: line, borderWidth: 1, color: panel });
  page.drawText("Future shared tune QR code", { x: margin + 12, y: y - 34, size: 10, font: bold, color: accent });
  page.drawText("Share PDF later: this placeholder will point to rcdriftsync.com/tune/share/:shareId.", { x: margin + 12, y: y - 50, size: 8.5, font, color: muted });

  return pdf.save({ useObjectStreams: true });
}

export async function downloadUniversalTunePdf(tune: Tune, car: Car) {
  const bytes = await generateUniversalTunePdf(tune, car);
  downloadPdf(bytes, `${tune.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-rc-drift-sync-universal.pdf`);
}
