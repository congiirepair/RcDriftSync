export const BASIC_CUSTOM_OPTION = "Custom / Other";

export const starterBasicBrands = [
  "Reve D",
  "Yokomo",
  "MST",
  "Usukani",
  "Rhino Racing",
  "Team AD",
  "Overdose",
  "Wrap-Up Next",
  "Sakura",
  "Redcat",
  "Futaba",
  "Sanwa",
  "Hobbywing",
  "Acuvance",
  "Maclan",
  "Hayate",
  "HRC",
  "LAB",
  "Shibata",
  "OMG",
  "AGFRC",
  "Power HD",
  "Savox",
  "Yeah Racing",
  "DS Racing",
  "Topline",
  "RC-Art",
  BASIC_CUSTOM_OPTION
];

export const basicTuneOptions = {
  brand: starterBasicBrands,
  deck: ["Stock", "Carbon", "Aluminum", "Plastic", "Conversion", BASIC_CUSTOM_OPTION],
  spring: ["Soft", "Medium", "Hard", "Kit spring", BASIC_CUSTOM_OPTION],
  frontKnuckle: ["Stock", ...starterBasicBrands],
  axle: ["Stock", "Short", "Medium", "Long", "Steel", "Aluminum", BASIC_CUSTOM_OPTION],
  lowerArm: ["Stock", ...starterBasicBrands],
  shims: ["None", "0.5mm", "1mm", "1.5mm", "2mm", "3mm", BASIC_CUSTOM_OPTION],
  toeBlock: ["Stock", "0 deg", "0.5 deg", "1 deg", "1.5 deg", "2 deg", "3 deg", BASIC_CUSTOM_OPTION],
  tuneProfile: ["Baseline", "Low grip", "High grip", "Carpet", "P-tile", "Asphalt", "Practice", "Competition", BASIC_CUSTOM_OPTION],
  motor: ["10.5T", "13.5T", "Not sure", ...starterBasicBrands],
  motorTurn: ["6.5T", "7.5T", "8.5T", "9.5T", "10.5T", "11.5T", "12.5T", "13.5T", "15.5T", "17.5T", "21.5T", "Not sure", BASIC_CUSTOM_OPTION],
  wheelOffset: ["0", "+2", "+3", "+4", "+5", "+6", "+7", "+8", "+9", "+10", "-2", "-3", "-4", "Not sure", BASIC_CUSTOM_OPTION],
  rearAxleLength: ["Stock", "Short", "Medium", "Long", BASIC_CUSTOM_OPTION]
};
