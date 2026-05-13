import { CarFront, Copy, Download, Heart, MapPin, QrCode, Share2, SlidersHorizontal, Wrench, type LucideIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { absoluteShareUrl } from "../config/domain";
import { chassisInfoFromTune } from "../data/chassisBrands";
import type { Car, Tune, TunePhoto } from "../types";
import { displayPhotoUrl } from "../utils/photoStorage";
import { BrandBadge } from "./BrandIdentity";
import { FilledPdfPreview } from "./FilledPdfPreview";
import { PhotoLightbox } from "./PhotoLightbox";
import { BasicTuneSummary, TuneTimeline } from "./TuneVisuals";
import { ErrorState } from "./UiPrimitives";
import { navigate } from "../utils/routing";

interface PublicTunePageProps {
  tune?: Tune;
  car?: Car;
  onClone: (tune: Tune) => void;
  onLike: (tune: Tune) => void;
  onShare: (tune: Tune) => void;
  onViewed: (tune: Tune) => void;
}

const publicSections = [
  {
    title: "Track and surface",
    fields: [
      ["trackName", "Track name"],
      ["track", "Track"],
      ["surface", "Surface"],
      ["grip", "Grip level"],
      ["trackConditionPreset", "Track condition"],
      ["setupIntent", "Intended use"]
    ]
  },
  {
    title: "Chassis and platform",
    fields: [
      ["chassisBrand", "Chassis brand"],
      ["chassisModel", "Chassis model"],
      ["chassisVariant", "Variant"],
      ["customChassisBrand", "Custom brand"],
      ["customChassisModel", "Custom model"],
      ["chassisDeck", "Deck"],
      ["deck", "Deck"],
      ["conversionKit", "Conversion kit"],
      ["wheelbase", "Wheelbase"],
      ["trackWidth", "Track width"],
      ["batteryPosition", "Battery position"],
      ["motorPosition", "Motor position"],
      ["servoPosition", "Servo position"],
      ["chassisCustomizations", "Customizations"]
    ]
  },
  {
    title: "Front setup",
    fields: [
      ["frontShockTower", "Shock tower"],
      ["frontDamper", "Damper"],
      ["frontDamperOil", "Damper oil"],
      ["frontShockOil", "Shock oil"],
      ["frontShockShaft", "Shock shaft"],
      ["frontPiston", "Piston"],
      ["frontShockPosition", "Shock position"],
      ["frontSpringBrand", "Spring brand"],
      ["frontSpring", "Spring"],
      ["frontUpperArm", "Upper arm"],
      ["frontLowerArm", "Lower arm"],
      ["frontLowerArmShims", "Lower arm shims"],
      ["frontKnuckle", "Knuckle"],
      ["frontKnucklePlate", "Knuckle plate"],
      ["frontAxle", "Axle"],
      ["frontHexHub", "Hex hub"],
      ["frontOffsetSpacer", "Offset spacer"],
      ["ffToeBlock", "FF suspension mount"],
      ["frToeBlock", "FR suspension mount"],
      ["frontToeBlock", "Toe block fallback"],
      ["ffToeBlockShim", "FF toe block shim"],
      ["frToeBlockShim", "FR toe block shim"]
    ]
  },
  {
    title: "Rear setup",
    fields: [
      ["rearShockTower", "Shock tower"],
      ["rearDamper", "Damper"],
      ["rearDamperOil", "Damper oil"],
      ["rearShockOil", "Shock oil"],
      ["rearShockShaft", "Shock shaft"],
      ["rearPiston", "Piston"],
      ["rearShockPosition", "Shock position"],
      ["rearSpringBrand", "Spring brand"],
      ["rearSpring", "Spring"],
      ["rearUpperArm", "Upper arm"],
      ["rearLowerArm", "Lower arm"],
      ["rearLowerArmShims", "Lower arm shims"],
      ["rearHubCarrier", "Hub carrier"],
      ["rearActiveToe", "Active toe"],
      ["rearAxle", "Axle"],
      ["rearAxleLength", "Axle length"],
      ["rearHexHub", "Hex hub"],
      ["rearOffsetSpacer", "Offset spacer"],
      ["rfToeBlock", "RF suspension mount"],
      ["rrToeBlock", "RR suspension mount"],
      ["rearToeBlock", "Toe block fallback"],
      ["rfToeBlockShim", "RF toe block shim"],
      ["rrToeBlockShim", "RR toe block shim"]
    ]
  },
  {
    title: "Geometry and alignment",
    fields: [
      ["frontCamber", "Front camber"],
      ["frontToe", "Front toe"],
      ["caster", "Caster"],
      ["kpi", "KPI"],
      ["steeringAngle", "Steering angle"],
      ["ackerman", "Ackerman"],
      ["trail", "Trail"],
      ["rearCamber", "Rear camber"],
      ["rearToe", "Rear toe"],
      ["rearRollCenter", "Rear roll center"],
      ["antiSquat", "Anti-squat"],
      ["proSquat", "Pro-squat"],
      ["frontAntiDive", "Front anti-dive"],
      ["kickUp", "Kick-up"]
    ]
  },
  {
    title: "Drivetrain and gearing",
    fields: [
      ["driveType", "Drive type"],
      ["transmissionGears", "Transmission"],
      ["spurGear", "Spur gear"],
      ["pinionGear", "Pinion gear"],
      ["finalDriveRatio", "FDR"],
      ["gearPitch", "Gear pitch"],
      ["differentialBrand", "Differential brand"],
      ["differential", "Differential"],
      ["differentialType", "Differential type"],
      ["diffOil", "Diff oil"],
      ["diffGrease", "Diff grease"],
      ["rearAxleType", "Rear axle type"]
    ]
  },
  {
    title: "Tires and wheels",
    fields: [
      ["frontTire", "Front tire"],
      ["frontTires", "Front tire"],
      ["rearTire", "Rear tire"],
      ["rearTires", "Rear tire"],
      ["tires", "Tires"],
      ["tireCompound", "Tire compound"],
      ["frontWheelBrand", "Front wheel brand"],
      ["frontWheel", "Front wheel"],
      ["frontWheelOffset", "Front wheel offset"],
      ["frontWheelWidth", "Front wheel width"],
      ["rearWheelBrand", "Rear wheel brand"],
      ["rearWheel", "Rear wheel"],
      ["rearWheelOffset", "Rear wheel offset"],
      ["rearWheelWidth", "Rear wheel width"],
      ["tirePrepNotes", "Tire prep"],
      ["tireWearNotes", "Tire wear"]
    ]
  },
  {
    title: "Body and weight",
    fields: [
      ["bodyShell", "Body shell"],
      ["body", "Body"],
      ["bodyWeight", "Body weight"],
      ["wing", "Wing"],
      ["wingPosition", "Wing position"],
      ["bodyMountPosition", "Body mount position"],
      ["frontWeight", "Front weight"],
      ["rearWeight", "Rear weight"],
      ["sideWeight", "Side weight"],
      ["weightBias", "Weight bias"],
      ["weightPlacementNotes", "Weight placement"],
      ["aeroNotes", "Aero notes"]
    ]
  }
] as const;

const technicalFieldPattern = /(slug|owner|share|clone|profileid|userid|carid|sheetid)$/i;
const electronicsFieldPattern = /^(esc|servo|gyro|radio|receiver|battery|throttle|boost|turbo|brake|drag|bec|pwm|endpoint|centerTrim|acuvancePower|motor(?!Position))/i;
const publicBrandMergeTargets: Record<string, string> = {
  chassisBrand: "chassisModel",
  frontSpringBrand: "frontSpring",
  frontWheelBrand: "frontWheel",
  frontTireBrand: "frontTire",
  rearSpringBrand: "rearSpring",
  rearWheelBrand: "rearWheel",
  rearTireBrand: "rearTire",
  differentialBrand: "differential",
  escBrand: "escModel",
  motorBrand: "motorModel",
  servoBrand: "servoModel",
  gyroBrand: "gyroModel",
  radioBrand: "radioModel"
};

type PublicTuneValue = string | number | boolean | string[];

function cleanTuneValue(value: unknown): PublicTuneValue {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

function hasPublicValue(value: unknown) {
  const cleaned = cleanTuneValue(value);
  if (Array.isArray(cleaned)) return cleaned.length > 0;
  const text = String(cleaned ?? "").trim();
  if (!text) return false;
  return !["not applicable", "n/a", "na", "not sure", "skip for now", "undefined", "null"].includes(text.toLowerCase());
}

function firstPublicValue(...values: unknown[]): PublicTuneValue {
  const value = values.find(hasPublicValue);
  return cleanTuneValue(value);
}

function humanizeFieldId(fieldId: string) {
  return fieldId
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\besc\b/gi, "ESC")
    .replace(/\bfdr\b/gi, "FDR")
    .replace(/\bkpi\b/gi, "KPI")
    .replace(/\brpm\b/gi, "RPM")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function advancedValue(tune: Tune, fieldId: string) {
  return firstPublicValue(
    tune.advancedSetup?.frontAlignment?.[fieldId],
    tune.advancedSetup?.rearAlignment?.[fieldId],
    tune.advancedSetup?.shocks?.[fieldId],
    tune.advancedSetup?.drivetrain?.[fieldId],
    tune.advancedSetup?.weightBalance?.[fieldId],
    tune.advancedSetup?.bodyAero?.[fieldId],
    tune.advancedSetup?.officialPdfFields?.[fieldId]
  );
}

function partValue(part?: { brand?: string; model?: string; notes?: string; length?: string; offset?: string; width?: string; shims?: string; toeAngle?: string | number; rate?: string }) {
  if (!part) return "";
  return [part.brand, part.model, part.length, part.offset ? `${part.offset} offset` : "", part.width ? `${part.width} wide` : "", part.rate, part.toeAngle ? `${part.toeAngle} toe` : "", part.shims ? `${part.shims} shims` : ""]
    .filter(hasPublicValue)
    .join(" ");
}

function profileName(item?: { selectedProfileId?: string; profileSnapshot?: string | Record<string, string | number | boolean | string[]> }) {
  if (!item?.profileSnapshot) return item?.selectedProfileId ?? "";
  if (typeof item.profileSnapshot === "string") return item.profileSnapshot;
  return firstPublicValue(item.profileSnapshot.profileName, item.profileSnapshot.name, item.selectedProfileId);
}

function tuneValue(tune: Tune, fieldId: string): PublicTuneValue {
  if (fieldId === "tire") return firstPublicValue(tune.values.tires, tune.values.frontTires, tune.values.rearTires);
  const electronicsValueMap: Record<string, unknown> = {
    escBrand: tune.electronics?.esc?.brand,
    escModel: tune.electronics?.esc?.customName || tune.electronics?.esc?.model,
    escProfileName: profileName(tune.electronics?.esc),
    escFirmwareVersion: tune.electronics?.esc?.firmware,
    escNotes: tune.electronics?.esc?.notes,
    throttleCurve: tune.electronics?.esc?.settings?.throttleCurve,
    throttlePunch: tune.electronics?.esc?.settings?.throttlePunch,
    brakeStrength: tune.electronics?.esc?.settings?.brakeStrength,
    boostTiming: tune.electronics?.esc?.settings?.boostTiming,
    boostStartRpm: tune.electronics?.esc?.settings?.boostStartRpm,
    boostEndRpm: tune.electronics?.esc?.settings?.boostEndRpm,
    turboTiming: tune.electronics?.esc?.settings?.turboTiming,
    turboDelay: tune.electronics?.esc?.settings?.turboDelay,
    pwmFrequency: tune.electronics?.esc?.settings?.pwmFrequency,
    becVoltage: tune.electronics?.esc?.settings?.becVoltage,
    dragBrake: tune.electronics?.esc?.settings?.dragBrake,
    motorBrand: tune.electronics?.motor?.brand,
    motor: tune.electronics?.motor?.customName || tune.electronics?.motor?.model,
    motorModel: tune.electronics?.motor?.customName || tune.electronics?.motor?.model,
    motorTurns: tune.electronics?.motor?.turns ?? tune.electronics?.motor?.settings?.turns,
    motorTiming: tune.electronics?.motor?.timing ?? tune.electronics?.motor?.settings?.motorTiming,
    motorRotor: tune.electronics?.motor?.rotor ?? tune.electronics?.motor?.settings?.rotor,
    motorNotes: tune.electronics?.motor?.notes,
    servoBrand: tune.electronics?.servo?.brand,
    servoModel: tune.electronics?.servo?.customName || tune.electronics?.servo?.model,
    servoProfileName: profileName(tune.electronics?.servo),
    servoNotes: tune.electronics?.servo?.notes,
    endpointLeft: tune.electronics?.servo?.settings?.endpointLeft,
    endpointRight: tune.electronics?.servo?.settings?.endpointRight,
    centerTrim: tune.electronics?.servo?.settings?.servoTrim,
    servoSpeed: tune.electronics?.servo?.settings?.speed,
    servoTorque: tune.electronics?.servo?.settings?.torque,
    servoDeadBand: tune.electronics?.servo?.settings?.deadBand,
    servoDamper: tune.electronics?.servo?.settings?.damper,
    gyroBrand: tune.electronics?.gyro?.brand,
    gyroModel: tune.electronics?.gyro?.customName || tune.electronics?.gyro?.model,
    gyroProfileName: profileName(tune.electronics?.gyro),
    gyroNotes: tune.electronics?.gyro?.notes,
    gyroGain: tune.electronics?.gyro?.gain ?? tune.electronics?.gyro?.settings?.gain,
    gyroMode: tune.electronics?.gyro?.mode ?? tune.electronics?.gyro?.settings?.mode,
    gyroCurveSetting: tune.electronics?.gyro?.settings?.curve,
    gyroDirection: tune.electronics?.gyro?.settings?.direction,
    radioBrand: tune.electronics?.receiver?.brand,
    radioModel: tune.electronics?.receiver?.customName || tune.electronics?.receiver?.model,
    battery: tune.electronics?.battery?.customName || tune.electronics?.battery?.model
  };
  const structuredValueMap: Record<string, unknown> = {
    track: tune.track,
    surface: tune.surface,
    grip: tune.grip,
    trackConditionPreset: tune.trackConditionPreset,
    setupIntent: tune.setupIntent,
    chassisBrand: tune.customChassisBrand || tune.chassisBrand || tune.chassisSetup?.chassis?.brand,
    chassisModel: tune.customChassisModel || tune.chassisModel || tune.chassisSetup?.chassis?.model,
    chassisVariant: tune.chassisVariant,
    customChassisBrand: tune.customChassisBrand,
    customChassisModel: tune.customChassisModel,
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
    rearSpringBrand: tune.values.rearSpringBrand,
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
    rearToeBlock: partValue(tune.chassisSetup?.rear?.toeBlock)
  };
  return firstPublicValue(
    tune.values[fieldId],
    tune.selections[fieldId],
    electronicsValueMap[fieldId],
    structuredValueMap[fieldId],
    advancedValue(tune, fieldId)
  );
}

function visibleRows(tune: Tune, rows: readonly (readonly [string, string])[]) {
  const fieldIds = new Set(rows.map(([fieldId]) => fieldId));
  return rows
    .filter(([fieldId]) => !publicBrandMergeTargets[fieldId])
    .map(([fieldId, label]) => {
      const brandField = Object.entries(publicBrandMergeTargets).find(([, target]) => target === fieldId && fieldIds.has(target))?.[0];
      const brand = brandField ? tuneValue(tune, brandField) : "";
      const value = tuneValue(tune, fieldId);
      const brandText = String(brand ?? "").trim();
      const valueText = Array.isArray(value) ? value.join(", ") : String(value ?? "").trim();
      const mergedValue = brandText && valueText && !valueText.toLowerCase().includes(brandText.toLowerCase()) ? `${brandText} ${valueText}` : value;
      return [label, cleanTuneValue(mergedValue)] as const;
    })
    .filter(([, value]) => hasPublicValue(value));
}

function electronicsRows(tune: Tune, category: keyof NonNullable<Tune["electronics"]>) {
  const item = tune.electronics?.[category];
  if (!item) return [];
  const baseRows: readonly (readonly [string, unknown])[] = [
    ["Brand", item.brand],
    ["Model", item.customName || item.model],
    ["Profile", profileName(item)],
    ["Turns / KV", item.turns],
    ["Timing", item.timing],
    ["Rotor", item.rotor],
    ["Firmware", item.firmware],
    ["Gain", item.gain],
    ["Mode", item.mode]
  ] as const;
  const settingRows = Object.entries(item.settings ?? {}).map(([key, value]) => [humanizeFieldId(key), cleanTuneValue(value)] as const);
  const noteRows = [["Notes", item.notes]] as const;
  return [...baseRows, ...settingRows, ...noteRows]
    .filter(([, value]) => hasPublicValue(value))
    .map(([label, value]) => [label, cleanTuneValue(value)] as const);
}

function electronicsTunePhotos(tune: Tune, category: "esc" | "servo" | "gyro") {
  return tune.electronics?.[category]?.tunePhotos?.filter((photo) => photo.cloudUrl || photo.dataUrl) ?? [];
}

type PublicRowsGroup = { title: string; rows: readonly (readonly [string, PublicTuneValue])[] };
type PublicReadonlySection = { title: string; helper: string; icon: LucideIcon; groups: PublicRowsGroup[] };

function presentPublicGroup(group: PublicRowsGroup | null | undefined): group is PublicRowsGroup {
  return Boolean(group);
}

function PublicReadOnlyTuneMenu({
  publicSectionRows,
  additionalRows,
  sharedTune
}: {
  publicSectionRows: PublicRowsGroup[];
  additionalRows: readonly (readonly [string, PublicTuneValue])[];
  sharedTune: Tune;
}) {
  const groupByTitle = (title: string) => publicSectionRows.find((section) => section.title === title && section.rows.length);
  const maybeElectronicsGroups: Array<PublicRowsGroup | null> = [
    sharedTune.sharedEscTuneEnabled && electronicsRows(sharedTune, "esc").length ? { title: "ESC", rows: electronicsRows(sharedTune, "esc") } : null,
    (sharedTune.sharedEscTuneEnabled || sharedTune.sharedChassisSetupEnabled !== false) && electronicsRows(sharedTune, "motor").length ? { title: "Motor", rows: electronicsRows(sharedTune, "motor") } : null,
    sharedTune.sharedServoTuneEnabled && electronicsRows(sharedTune, "servo").length ? { title: "Servo", rows: electronicsRows(sharedTune, "servo") } : null,
    sharedTune.sharedGyroTuneEnabled && electronicsRows(sharedTune, "gyro").length ? { title: "Gyro", rows: electronicsRows(sharedTune, "gyro") } : null,
    sharedTune.sharedRadioTuneEnabled && electronicsRows(sharedTune, "receiver").length ? { title: "Radio / receiver", rows: electronicsRows(sharedTune, "receiver") } : null,
    sharedTune.sharedChassisSetupEnabled !== false && electronicsRows(sharedTune, "battery").length ? { title: "Battery", rows: electronicsRows(sharedTune, "battery") } : null
  ];
  const electronicsGroups = maybeElectronicsGroups.filter(presentPublicGroup);
  const sections: PublicReadonlySection[] = [
    {
      title: "Chassis",
      helper: "Platform, front, rear, drivetrain, alignment, body, and saved notes.",
      icon: CarFront,
      groups: [
        groupByTitle("Chassis and platform"),
        groupByTitle("Front setup"),
        groupByTitle("Rear setup"),
        groupByTitle("Geometry and alignment"),
        groupByTitle("Drivetrain and gearing"),
        groupByTitle("Body and weight"),
        additionalRows.length ? { title: "Other Saved Details", rows: additionalRows } : null
      ].filter(presentPublicGroup)
    },
    {
      title: "Surface",
      helper: "Track, surface, grip, condition, and intent.",
      icon: MapPin,
      groups: [groupByTitle("Track and surface")].filter(presentPublicGroup)
    },
    {
      title: "Electronics",
      helper: "ESC, motor, servo, gyro, radio, battery, and tune settings.",
      icon: SlidersHorizontal,
      groups: electronicsGroups
    },
    {
      title: "Tires / Wheels",
      helper: "Tires, compounds, wheels, offsets, widths, prep, and wear.",
      icon: Wrench,
      groups: [groupByTitle("Tires and wheels")].filter(presentPublicGroup)
    }
  ];
  return (
    <section className="readonlyTuneMenu" aria-label="Shared tune setup">
      {sections.map((section, index) => {
        const itemCount = section.groups.reduce((total, group) => total + group.rows.length, 0);
        if (!itemCount) return null;
        const Icon = section.icon;
        return (
          <details className="readonlyTuneSection" key={section.title} open={index === 0}>
            <summary>
              <span className="readonlyTuneIcon"><Icon size={20} /></span>
              <span>
                <strong>{section.title}</strong>
                <em>{section.helper}</em>
              </span>
              <small>{itemCount}</small>
            </summary>
            <div className="readonlyTuneGroups">
              {section.groups.map((group) => (
                <article className="readonlyTuneGroup" key={group.title}>
                  <h3>{group.title}</h3>
                  <dl>
                    {group.rows.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </details>
        );
      })}
    </section>
  );
}

function additionalSavedRows(tune: Tune, usedFieldIds: Set<string>) {
  return Object.entries(tune.values ?? {})
    .filter(([key, value]) => !usedFieldIds.has(key) && !technicalFieldPattern.test(key) && !electronicsFieldPattern.test(key) && hasPublicValue(value))
    .map(([key, value]) => [humanizeFieldId(key), cleanTuneValue(value)] as const)
    .slice(0, 120);
}

export function PublicTunePage({ tune, car, onClone, onLike, onShare, onViewed }: PublicTunePageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const viewedTuneId = useRef("");

  useEffect(() => {
    if (!tune || viewedTuneId.current === tune.id) return;
    viewedTuneId.current = tune.id;
    onViewed(tune);
  }, [onViewed, tune]);

  if (!tune) {
    return (
      <main className="publicPage">
        <ErrorState
          title="Shared tune not available"
          body="This setup may be private, removed, or only visible to the owner."
          action={
            <div className="buttonRow">
              <button className="primaryAction" type="button" onClick={() => navigate("/community")}>Browse Community</button>
              <button className="smallPill" type="button" onClick={() => navigate("/home")}>Go Home</button>
            </div>
          }
        />
      </main>
    );
  }

  const sharedTune = tune;
  const chassisInfo = chassisInfoFromTune(sharedTune, car);
  const shareUrl = absoluteShareUrl(sharedTune.shareId ?? sharedTune.id);
  const canShowPhotos = sharedTune.sharedPhotosEnabled && sharedTune.photos.length > 0;
  const showOwner = sharedTune.sharedOwnerNameEnabled !== false;
  const usedFieldIds = new Set(publicSections.flatMap((section) => section.fields.map(([fieldId]) => fieldId)));
  const publicSectionRows = publicSections.map((section) => ({
    title: section.title,
    rows: visibleRows(sharedTune, section.fields)
  }));
  const additionalRows = sharedTune.sharedChassisSetupEnabled === false ? [] : additionalSavedRows(sharedTune, usedFieldIds);
  const escTunePhotos = sharedTune.sharedEscTuneEnabled ? electronicsTunePhotos(sharedTune, "esc") : [];
  const servoTunePhotos = sharedTune.sharedServoTuneEnabled ? electronicsTunePhotos(sharedTune, "servo") : [];
  const gyroTunePhotos = sharedTune.sharedGyroTuneEnabled ? electronicsTunePhotos(sharedTune, "gyro") : [];
  const showBasicTune = sharedTune.sharedBasicTuneEnabled !== false;
  const basicSummaryExclusions = [
    !showBasicTune ? ["Chassis", "Deck", "Front knuckle", "Front spring", "Front wheel", "Servo", "Gyro", "Motor", "ESC", "Rear hub", "Rear wheel", "Notes"] : [],
    !sharedTune.sharedServoTuneEnabled ? ["Servo"] : [],
    !sharedTune.sharedGyroTuneEnabled ? ["Gyro"] : [],
    !sharedTune.sharedEscTuneEnabled ? ["ESC", "Motor"] : [],
    !sharedTune.sharedNotesEnabled ? ["Notes"] : []
  ].flat();

  async function copyLink() {
    await navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    onShare(sharedTune);
  }

  async function nativeShare() {
    if (navigator.share) {
      await navigator.share({ title: sharedTune.name, text: "RC Drift Sync tune", url: shareUrl });
    } else {
      await navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
    }
    onShare(sharedTune);
  }

  function likeTune() {
    if (liked) return;
    setLiked(true);
    onLike(sharedTune);
  }

  return (
    <main className="publicPage">
      <header className="publicHero">
        <p>Shared tune</p>
        <BrandBadge brandSlug={chassisInfo.brandSlug} />
        <h1>{tune.name}</h1>
        <span>
          {showOwner ? `${tune.ownerDisplayName ?? "RC driver"} · ` : ""}
          {chassisInfo.brand} {chassisInfo.model} · {tune.track || "Track not set"} · {tune.rating}/5
        </span>
      </header>

      <section className="sharePanel">
        <div className="qrBox">
          <QRCodeSVG value={shareUrl} size={148} bgColor="transparent" fgColor="currentColor" />
        </div>
        <div>
          <h2>Share link</h2>
          <p>{shareUrl}</p>
          <div className="publicActions">
            <button type="button" onClick={copyLink}>
              <Copy size={18} />
              {copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" onClick={nativeShare}>
              <Share2 size={18} />
              Share
            </button>
            <button type="button" onClick={likeTune} aria-pressed={liked}>
              <Heart size={18} />
              {liked ? "Liked" : "Like"}
            </button>
            {tune.cloneEnabled ? (
              <button type="button" onClick={() => onClone(tune)}>
                <Download size={18} />
                Clone to My Garage
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="publicSection publicSetupOverview">
        <h2>Setup Sheet</h2>
        {showBasicTune ? (
          <BasicTuneSummary tune={tune} car={car} excludeLabels={basicSummaryExclusions} onClone={tune.cloneEnabled ? () => onClone(tune) : undefined} />
        ) : null}
        <p className="publicStats">{tune.viewCount ?? 0} views · {tune.likeCount ?? 0} likes · {tune.cloneCount ?? 0} clones · {tune.shareCount ?? 0} shares</p>
      </section>

      <section className="detailValueSheet readonlyTuneSheet publicReadonlySheet">
        <header>
          <strong>Setup Details</strong>
          <span>Read-only tune builder view</span>
        </header>
        <PublicReadOnlyTuneMenu publicSectionRows={tune.sharedChassisSetupEnabled !== false ? publicSectionRows : []} additionalRows={additionalRows} sharedTune={tune} />
      </section>

      {escTunePhotos.length ? <PublicPhotoRows title="ESC tune photos" photos={escTunePhotos} /> : null}
      {servoTunePhotos.length ? <PublicPhotoRows title="Servo tune photos" photos={servoTunePhotos} /> : null}
      {gyroTunePhotos.length ? <PublicPhotoRows title="Gyro tune photos" photos={gyroTunePhotos} /> : null}

      <section className="publicSection">
        <h2>
          <QrCode size={19} />
          Filled setup PDF
        </h2>
        <FilledPdfPreview tune={tune} car={car} onSave={async () => undefined} allowDownload={tune.pdfDownloadEnabled !== false} shareUrl={shareUrl} />
      </section>

      {tune.sharedNotesEnabled ? (
        <section className="publicSection">
          <h2>Notes</h2>
          <p>{tune.notes || "No public notes included."}</p>
        </section>
      ) : null}

      {tune.sharedHistoryEnabled && tune.history.length ? (
        <section className="publicSection">
          <h2>Change history</h2>
          <TuneTimeline tune={tune} />
          <div className="publicTimeline">
            {tune.history.slice(0, 6).map((entry) => (
              <article key={entry.id}>
                <strong>{entry.summary}</strong>
                <span>{new Date(entry.date).toLocaleDateString()}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {canShowPhotos ? (
        <section className="publicSection">
          <h2>Photos</h2>
          <PublicPhotoGrid photos={tune.photos} />
        </section>
      ) : null}
    </main>
  );
}

function PublicPhotoRows({ title, photos }: { title: string; photos: TunePhoto[] }) {
  return (
    <section className="publicSection">
      <h2>{title}</h2>
      <PublicPhotoGrid photos={photos} />
    </section>
  );
}

function PublicPhotoGrid({ photos }: { photos: TunePhoto[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<TunePhoto | null>(null);

  return (
    <>
      <div className="photoGrid">
        {photos.map((photo) => (
          <button className="photoCard publicPhotoButton" type="button" key={photo.id} onClick={() => setSelectedPhoto(photo)} aria-label={`Open ${photo.label} full screen`}>
            <img src={displayPhotoUrl(photo)} alt={photo.label} />
            <span>{photo.label}</span>
          </button>
        ))}
      </div>
      <PhotoLightbox photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />
    </>
  );
}
