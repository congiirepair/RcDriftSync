const labelAcronyms = new Map([
  ["esc", "ESC"],
  ["fdr", "FDR"],
  ["kpi", "KPI"],
  ["rpm", "RPM"],
  ["rc", "RC"],
  ["pdf", "PDF"],
  ["qr", "QR"],
  ["bec", "BEC"],
  ["pwm", "PWM"],
  ["kv", "KV"],
  ["awd", "AWD"],
  ["rwd", "RWD"],
  ["cs", "CS"]
]);

const unitWords = new Set(["mm", "deg", "oz", "kv"]);

export function formatFormLabel(label: string) {
  return label.replace(/\b[A-Za-z][A-Za-z0-9']*\b/g, (word) => {
    const lower = word.toLowerCase();
    if (labelAcronyms.has(lower)) return labelAcronyms.get(lower) ?? word;
    if (unitWords.has(lower)) return lower;
    if (word === word.toUpperCase() && word.length > 1) return word;
    return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
  });
}
