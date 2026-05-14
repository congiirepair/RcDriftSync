import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PdfTemplate } from "../data/pdfTemplates";
import type { Tune } from "../types";

const fieldAliases: Record<string, string[]> = {
  drivingPlace: ["track"],
  frontOil: ["frontShockOil", "shockOil"],
  rearOil: ["rearShockOil", "shockOil"],
  rearSkidAngle: ["skidAngle"],
  diff: ["diffType"],
  frontOffset: ["frontWheelOffset"],
  rearOffset: ["rearWheelOffset"],
  weight: ["addedWeight", "weightLocation"],
  servo: ["servoModel", "servoBrand"],
  servoHorn: ["servoHornLength"],
  gyro: ["gyroModel", "gyroBrand"],
  gain: ["gyroGain"],
  curve: ["gyroCurveSetting"],
  motor: ["motorModel", "motorTurns"],
  timing: ["motorTiming"],
  esc: ["escModel", "escBrand"],
  boost: ["boostTiming"],
  turbo: ["turboTiming"]
};

const ignoredPdfValues = new Set(["", "not applicable", "n/a", "na", "not sure", "skip for now"]);

const isUsablePdfValue = (value: unknown) => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.some(isUsablePdfValue);
  return !ignoredPdfValues.has(String(value).trim().toLowerCase());
};

const textFromPart = (part?: { brand?: string; model?: string; customName?: string }) => {
  if (!part) return "";
  return [part.brand, part.model || part.customName].filter(isUsablePdfValue).join(" ").trim();
};

const valueFromRecord = (record: Record<string, unknown> | undefined, key: string) => record?.[key];

const pickValue = (...values: unknown[]) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      const items = value.filter(isUsablePdfValue);
      if (items.length) return items.join(", ");
      continue;
    }
    if (isUsablePdfValue(value)) return value;
  }
  return "";
};

const getValue = (tune: Tune, fieldId: string) => {
  const values = tune.values ?? {};
  const selections = tune.selections ?? {};
  const officialFields = tune.advancedSetup?.officialPdfFields;
  const frontAlignment = tune.advancedSetup?.frontAlignment;
  const rearAlignment = tune.advancedSetup?.rearAlignment;
  const shocks = tune.advancedSetup?.shocks;
  const drivetrain = tune.advancedSetup?.drivetrain;
  const weightBalance = tune.advancedSetup?.weightBalance;
  const bodyAero = tune.advancedSetup?.bodyAero;

  const direct = pickValue(valueFromRecord(officialFields, fieldId), values[fieldId], selections[fieldId]);
  if (direct !== "") return direct;

  const resolved = (() => {
    switch (fieldId) {
      case "date":
        return tune.date;
      case "driver":
        return tune.ownerDisplayName || tune.ownerUsername || values.driver;
      case "drivingPlace":
        return tune.track || values.trackName || values.drivingPlace;
      case "surface":
        return tune.surface || values.surface;
      case "body":
        return pickValue(values.body, values.bodyShell, valueFromRecord(bodyAero, "body"), valueFromRecord(bodyAero, "bodyShell"));
      case "wing":
        return pickValue(values.wing, values.aeroWing, valueFromRecord(bodyAero, "wing"), valueFromRecord(bodyAero, "aeroWing"));
      case "tires":
        return pickValue(values.tires, [values.frontTire, values.rearTire].filter(isUsablePdfValue).join(" / "));
      case "frontRideHeight":
      case "frontShockShaft":
      case "frontPiston":
      case "frontHoles":
      case "frontRetainer":
      case "frontShockPosition":
      case "rearRideHeight":
      case "rearShockShaft":
      case "rearPiston":
      case "rearHoles":
      case "rearRetainer":
      case "rearShockPosition":
      case "rearShockMountingNotes":
      case "rearSwayBar":
      case "rearSwayBarThickness":
        return valueFromRecord(shocks, fieldId);
      case "frontCamber":
      case "frontToe":
      case "caster":
        return valueFromRecord(frontAlignment, fieldId);
      case "rearCamber":
      case "rearToe":
      case "skidAngle":
      case "rearSkidAngle":
      case "rearLowerArmSide":
        return valueFromRecord(rearAlignment, fieldId === "rearSkidAngle" ? "skidAngle" : fieldId);
      case "frontSpring":
        return pickValue(tune.chassisSetup?.front?.spring?.model, tune.chassisSetup?.front?.spring?.rate);
      case "frontOil":
        return pickValue(values.frontShockOil, valueFromRecord(shocks, "frontShockOil"), values.shockOil);
      case "frontOring":
        return values.frontOring;
      case "frontMemo":
        return pickValue(values.frontMemo, values.frontNotes, tune.chassisSetup?.front?.dampers?.notes);
      case "rearSpring":
        return pickValue(tune.chassisSetup?.rear?.dampers?.notes?.includes("spring") ? tune.chassisSetup.rear.dampers.notes : "", values.rearSpring);
      case "rearOil":
        return pickValue(values.rearShockOil, valueFromRecord(shocks, "rearShockOil"), values.shockOil);
      case "rearOring":
        return values.rearOring;
      case "rearMemo":
        return pickValue(values.rearMemo, values.rearNotes, tune.chassisSetup?.rear?.dampers?.notes);
      case "frontWheel":
        return textFromPart(tune.chassisSetup?.front?.wheel);
      case "frontOffset":
        return tune.chassisSetup?.front?.wheel?.offset;
      case "rearWheel":
        return textFromPart(tune.chassisSetup?.rear?.wheel);
      case "rearOffset":
        return tune.chassisSetup?.rear?.wheel?.offset;
      case "weight":
        return pickValue(values.weight, values.addedWeight, valueFromRecord(weightBalance, "addedWeight"), valueFromRecord(weightBalance, "weightLocation"));
      case "servo":
        return textFromPart(tune.electronics?.servo);
      case "gyro":
        return textFromPart(tune.electronics?.gyro);
      case "gain":
        return pickValue(tune.electronics?.gyro?.gain, tune.electronics?.gyro?.settings?.gain);
      case "curve":
        return pickValue(tune.electronics?.gyro?.settings?.curve, tune.electronics?.gyro?.settings?.curveSetting);
      case "motor":
        return textFromPart(tune.electronics?.motor);
      case "timing":
        return pickValue(tune.electronics?.motor?.timing, valueFromRecord(drivetrain, "motorTiming"));
      case "battery":
        return textFromPart(tune.electronics?.battery);
      case "pinionGear":
      case "spurGear":
        return valueFromRecord(drivetrain, fieldId);
      case "esc":
        return textFromPart(tune.electronics?.esc);
      case "boost":
        return pickValue(tune.electronics?.esc?.settings?.boostTiming, values.boostTiming);
      case "turbo":
        return pickValue(tune.electronics?.esc?.settings?.turboTiming, values.turboTiming);
      case "diff":
        return pickValue(values.diff, values.diffType, valueFromRecord(drivetrain, "diffType"));
      default:
        return "";
    }
  })();
  if (resolved !== "" && isUsablePdfValue(resolved)) return resolved;

  for (const alias of fieldAliases[fieldId] ?? []) {
    const value = alias in tune ? tune[alias as keyof Tune] : values[alias] ?? selections[alias];
    if (isUsablePdfValue(value)) return value;
  }
  return "";
};

const textValue = (tune: Tune, fieldId: string, suffix?: string) => {
  const value = getValue(tune, fieldId);
  if (value === undefined || value === null || value === "") return "";
  return `${String(value)}${suffix ? ` ${suffix}` : ""}`;
};

export async function generateFilledPdf(template: PdfTemplate, tune: Tune): Promise<Uint8Array> {
  const source = await fetch(template.pdfAsset).then((response) => response.arrayBuffer());
  const pdf = await PDFDocument.load(source);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pointForPage = (page: ReturnType<typeof pdf.getPage>, pdfX: number, pdfY: number) => {
    const { width, height } = page.getSize();
    return {
      x: (pdfX / template.pageWidth) * width,
      y: (pdfY / template.pageHeight) * height,
      scale: Math.min(width / template.pageWidth, height / template.pageHeight)
    };
  };

  for (const mapping of template.text) {
    const page = pdf.getPage(mapping.page);
    const value = textValue(tune, mapping.fieldId, mapping.suffix);
    if (!value) continue;
    const point = pointForPage(page, mapping.pdfX, mapping.pdfY);
    const fontSize = (mapping.fontSize ?? 8) * point.scale;
    const maxWidth = (mapping.maxWidth ?? 80) * point.scale;
    const maxChars = Math.max(4, Math.floor(maxWidth / (fontSize * 0.45)));
    const printable = value.length > maxChars ? value.slice(0, maxChars - 1) : value;
    const width = font.widthOfTextAtSize(printable, fontSize);
    const x = mapping.align === "center" ? point.x - width / 2 : point.x;
    page.drawText(printable, {
      x,
      y: point.y,
      size: fontSize,
      font,
      color: rgb(0.02, 0.08, 0.08)
    });
  }

  for (const checkbox of template.checkboxes) {
    const value = getValue(tune, checkbox.fieldId);
    const normalize = (item: unknown) => String(item).trim().toLowerCase().replace(/-/g, " ");
    const expected = normalize(checkbox.value);
    const checked = Array.isArray(value)
      ? value.some((item) => normalize(item) === expected)
      : normalize(value) === expected || value === true;
    if (!checked) continue;
    const page = pdf.getPage(checkbox.page);
    const point = pointForPage(page, checkbox.pdfX, checkbox.pdfY);
    page.drawText("X", {
      x: point.x + 0.5 * point.scale,
      y: point.y - 1 * point.scale,
      size: (checkbox.size ?? 8) * point.scale,
      font: bold,
      color: rgb(0, 0.45, 0.35)
    });
  }

  for (const group of template.holeGroups) {
    const selected = String(getValue(tune, group.fieldId));
    const hole = group.holes.find((item) => item.id === selected);
    if (!hole) continue;
    const page = pdf.getPage(group.page);
    const point = pointForPage(page, hole.pdfX, hole.pdfY);
    page.drawCircle({
      x: point.x,
      y: point.y,
      size: 4.2 * point.scale,
      borderWidth: 1.2 * point.scale,
      borderColor: rgb(0, 0.45, 0.35),
      color: rgb(1, 0.8, 0.28),
      opacity: 0.95
    });
  }

  return pdf.save({ useObjectStreams: true });
}

export function downloadPdf(bytes: Uint8Array, filename: string) {
  const blob = new Blob([bytes.slice().buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function pdfPreviewPosition(template: PdfTemplate, pdfX: number, pdfY: number) {
  return {
    left: `${(pdfX / template.pageWidth) * 100}%`,
    top: `${((template.pageHeight - pdfY) / template.pageHeight) * 100}%`
  };
}
