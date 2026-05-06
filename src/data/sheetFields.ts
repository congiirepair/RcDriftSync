import type { SetupField } from "../types";

export const commonFields: SetupField[] = [
  { id: "frontCamber", label: "Front camber", type: "number", unit: "deg", section: "Suspension", placeholder: "-6" },
  { id: "rearCamber", label: "Rear camber", type: "number", unit: "deg", section: "Suspension", placeholder: "-3" },
  { id: "frontToe", label: "Front toe", type: "number", unit: "deg", section: "Suspension", placeholder: "0" },
  { id: "rearToe", label: "Rear toe", type: "number", unit: "deg", section: "Suspension", placeholder: "3" },
  { id: "caster", label: "Caster", type: "select", section: "Suspension", options: ["4 deg", "6 deg", "8 deg", "10 deg"] },
  { id: "frontRideHeight", label: "Front ride height", type: "number", unit: "mm", section: "Suspension", placeholder: "6.0" },
  { id: "rearRideHeight", label: "Rear ride height", type: "number", unit: "mm", section: "Suspension", placeholder: "6.5" },
  { id: "frontDroop", label: "Front droop", type: "number", unit: "mm", section: "Suspension", placeholder: "4.5" },
  { id: "rearDroop", label: "Rear droop", type: "number", unit: "mm", section: "Suspension", placeholder: "5.0" },
  { id: "frontSpring", label: "Front spring", type: "text", section: "Shocks", placeholder: "Reve D soft" },
  { id: "rearSpring", label: "Rear spring", type: "text", section: "Shocks", placeholder: "Reve D medium" },
  { id: "shockOil", label: "Shock oil", type: "text", section: "Shocks", placeholder: "350 cSt" },
  { id: "diff", label: "Diff settings", type: "text", section: "Drivetrain", placeholder: "Gear diff 10k" },
  { id: "frontTires", label: "Front tires", type: "text", section: "Tires", placeholder: "DS Racing LF-5" },
  { id: "rearTires", label: "Rear tires", type: "text", section: "Tires", placeholder: "DS Racing HF-5" },
  { id: "gyro", label: "Gyro", type: "text", section: "Electronics", placeholder: "Reve D REVOX 65%" },
  { id: "motor", label: "Motor", type: "text", section: "Electronics", placeholder: "10.5T" },
  { id: "esc", label: "ESC", type: "text", section: "Electronics", placeholder: "Hobbywing XR10" },
  { id: "body", label: "Body", type: "text", section: "Body", placeholder: "GR86" },
  { id: "weightPlacement", label: "Weight placement", type: "textarea", section: "Balance", placeholder: "20g behind servo" },
  { id: "electronics", label: "Electronics layout", type: "textarea", section: "Electronics", placeholder: "Battery forward, ESC rear right" }
];
