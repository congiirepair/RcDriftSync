import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PdfTemplate } from "../data/pdfTemplates";
import type { Tune } from "../types";

const fieldAliases: Record<string, string[]> = {
  drivingPlace: ["track"],
  frontOil: ["frontShockOil", "shockOil"],
  rearOil: ["rearShockOil", "shockOil"],
  rearSkidAngle: ["skidAngle"],
  diff: ["diffType"],
  frontWheel: ["frontWheelOffset"],
  rearWheel: ["rearWheelOffset"],
  frontOffset: ["frontWheelOffset"],
  rearOffset: ["rearWheelOffset"],
  weight: ["addedWeight", "weightLocation"],
  servo: ["servoModel", "servoBrand"],
  servoHorn: ["servoHornLength"],
  gyro: ["gyroModel", "gyroBrand"],
  gain: ["gyroGain"],
  curve: ["gyroCurveSetting"],
  motor: ["motorTiming"],
  timing: ["motorTiming"],
  esc: ["escModel", "escBrand"],
  boost: ["boostTiming"],
  turbo: ["turboTiming"]
};

const getValue = (tune: Tune, fieldId: string) => {
  if (fieldId === "date") return tune.date;
  if (fieldId === "drivingPlace") return tune.track;
  const direct = tune.values[fieldId] ?? tune.selections[fieldId];
  if (direct !== undefined && direct !== "") return direct;
  for (const alias of fieldAliases[fieldId] ?? []) {
    const value = alias in tune ? tune[alias as keyof Tune] : tune.values[alias] ?? tune.selections[alias];
    if (value !== undefined && value !== "") return value;
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

  for (const mapping of template.text) {
    const page = pdf.getPage(mapping.page);
    const value = textValue(tune, mapping.fieldId, mapping.suffix);
    if (!value) continue;
    const fontSize = mapping.fontSize ?? 8;
    const maxChars = Math.max(4, Math.floor((mapping.maxWidth ?? 80) / (fontSize * 0.45)));
    const printable = value.length > maxChars ? value.slice(0, maxChars - 1) : value;
    const width = font.widthOfTextAtSize(printable, fontSize);
    const x = mapping.align === "center" ? mapping.pdfX - width / 2 : mapping.pdfX;
    page.drawText(printable, {
      x,
      y: mapping.pdfY,
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
    page.drawText("X", {
      x: checkbox.pdfX + 0.5,
      y: checkbox.pdfY - 1,
      size: checkbox.size ?? 8,
      font: bold,
      color: rgb(0, 0.45, 0.35)
    });
  }

  for (const group of template.holeGroups) {
    const selected = String(getValue(tune, group.fieldId));
    const hole = group.holes.find((item) => item.id === selected);
    if (!hole) continue;
    const page = pdf.getPage(group.page);
    page.drawCircle({
      x: hole.pdfX,
      y: hole.pdfY,
      size: 4.2,
      borderWidth: 1.2,
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
