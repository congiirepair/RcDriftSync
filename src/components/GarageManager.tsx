import { ChevronDown, CopyPlus, Download, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { chassisBrands, chassisInfoFromCar, findChassisBrand, modelsForBrand, slugifyChassis } from "../data/chassisBrands";
import type { Car, Tune } from "../types";
import { BrandLogo } from "./BrandIdentity";
import { BottomSheet } from "./BottomSheet";
import { EmptyState, SelectField, TextField } from "./UiPrimitives";

interface GarageManagerProps {
  cars: Car[];
  tunes: Tune[];
  activeTuneId?: string;
  startAdding?: number;
  onSaveCar: (car: Car) => void | Promise<boolean | void>;
  onDeleteCar: (carId: string) => void;
  onCreateTune: (carId: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onExportTunePdf: (tune: Tune) => void | Promise<void>;
  onSelectTune: (tuneId: string) => void;
}

const emptyCar = (): Car => ({
  id: `car-${Date.now()}`,
  name: "",
  brand: "",
  chassisBrand: "",
  chassisBrandSlug: "",
  chassis: "",
  chassisModel: "",
  chassisModelSlug: "",
  chassisVariant: "",
  customChassisBrand: "",
  customChassisModel: "",
  chassisType: "RWD drift",
  drivetrainType: "RWD",
  motorLayout: "",
  scale: "1/10",
  sheetId: "universal-template",
  templateMode: "universal",
  officialTemplateEligible: false,
  photos: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

function classifyTemplate(car: Car): Car {
  const text = `${car.brand ?? ""} ${car.chassisBrand ?? ""} ${car.chassis ?? ""} ${car.chassisModel ?? ""} ${car.customChassisBrand ?? ""} ${car.customChassisModel ?? ""}`.toLowerCase();
  if (text.includes("rdx")) {
    return { ...car, chassis: car.chassis || "Reve D RDX", sheetId: "rdx-template", templateMode: "official", officialTemplateEligible: true };
  }
  if (text.includes("mc-3") || text.includes("mc3")) {
    return { ...car, chassis: car.chassis || "Reve D MC-3", sheetId: "mc3-template", templateMode: "official", officialTemplateEligible: true };
  }
  return { ...car, sheetId: "universal-template", templateMode: "universal", officialTemplateEligible: false };
}

function normalizeCarChassis(car: Car): Car {
  const brand = findChassisBrand(car.chassisBrandSlug || car.chassisBrand || car.brand) ?? chassisInfoFromCar(car);
  const brandName = "name" in brand ? brand.name : brand.brand;
  const brandSlug = "slug" in brand ? brand.slug : brand.brandSlug;
  const model = car.chassisModel || car.customChassisModel || "";
  return {
    ...car,
    brand: brandSlug === "other" ? car.customChassisBrand || "Other / Custom" : brandName,
    chassisBrand: brandSlug === "other" ? car.customChassisBrand || "Other / Custom" : brandName,
    chassisBrandSlug: brandSlug,
    chassisModel: model,
    chassisModelSlug: slugifyChassis(model),
    chassis: brandSlug === "other" ? [car.customChassisBrand, car.customChassisModel].filter(Boolean).join(" ") || "Custom / Other" : [brandName, model].filter(Boolean).join(" ")
  };
}

export function GarageManager({
  cars,
  tunes,
  startAdding,
  onSaveCar,
  onDeleteCar,
  onCreateTune,
  onDuplicateTune,
  onExportTunePdf,
  onSelectTune
}: GarageManagerProps) {
  const [editing, setEditing] = useState<Car | null>(startAdding ? emptyCar() : null);
  const [selectedBrandSlug, setSelectedBrandSlug] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const [openCarId, setOpenCarId] = useState("");
  const tunesByCar = useMemo(() => new Map(cars.map((car) => [car.id, tunes.filter((tune) => tune.carId === car.id)])), [cars, tunes]);
  const brandGroups = useMemo(() => {
    const groups = new Map<string, { brandSlug: string; brandName: string; cars: Car[]; tunes: Tune[] }>();
    cars.forEach((car) => {
      const info = chassisInfoFromCar(car);
      const brandSlug = info.brandSlug || "other";
      const group = groups.get(brandSlug) ?? { brandSlug, brandName: info.brand, cars: [], tunes: [] };
      group.cars.push(car);
      group.tunes.push(...(tunesByCar.get(car.id) ?? []));
      groups.set(brandSlug, group);
    });
    return Array.from(groups.values()).sort((a, b) => a.brandName.localeCompare(b.brandName));
  }, [cars, tunesByCar]);
  const selectedBrand = brandGroups.find((group) => group.brandSlug === selectedBrandSlug) ?? brandGroups[0];

  useEffect(() => {
    if (!startAdding) return;
    const handle = window.setTimeout(() => setEditing(emptyCar()), 0);
    return () => window.clearTimeout(handle);
  }, [startAdding]);

  async function saveEditing() {
    if (!editing) return;
    const normalized = normalizeCarChassis(editing);
    const generatedName = [normalized.chassisBrand, normalized.chassisModel].filter(Boolean).join(" ") || "RC drift car";
    const next = classifyTemplate(normalizeCarChassis({
      ...editing,
      name: editing.name.trim() || generatedName,
      chassis: editing.chassis.trim() || generatedName || "Custom / Other",
      updatedAt: new Date().toISOString()
    }));
    const saved = await onSaveCar(next);
    if (saved === false) return;
    setSelectedBrandSlug(chassisInfoFromCar(next).brandSlug);
    setEditing(null);
  }

  function deleteCar(car: Car) {
    onDeleteCar(car.id);
    setDeleteTarget(null);
  }

  function duplicateLast(car: Car) {
    const lastTune = tunesByCar.get(car.id)?.[0];
    if (lastTune) onDuplicateTune(lastTune);
  }

  return (
    <div className="garageManager">
      {!cars.length ? (
        <EmptyState
          title="Garage"
          body="Add your first RC drift car to start saving tunes."
          action={
            <button className="primaryAction" type="button" onClick={() => setEditing(emptyCar())}>
              <Plus size={19} />
              Add first car
            </button>
          }
        />
      ) : null}

      {cars.length ? (
        <>
          <section className="garageBrandGrid" aria-label="Garage brands">
            {brandGroups.map((group) => (
              <button
                key={group.brandSlug}
                className={`garageBrandBox ${selectedBrand?.brandSlug === group.brandSlug ? "active" : ""}`}
                type="button"
                onClick={() => setSelectedBrandSlug(group.brandSlug)}
              >
                <BrandLogo brandSlug={group.brandSlug} brandName={group.brandName} size="large" variant="wordmark" />
                <span>
                  <strong>{group.brandName}</strong>
                  <em>{group.cars.length} car{group.cars.length === 1 ? "" : "s"} / {group.tunes.length} tune{group.tunes.length === 1 ? "" : "s"}</em>
                </span>
              </button>
            ))}
          </section>

          {selectedBrand ? (
            <section className="garageBrandPanel">
              <header>
                <BrandLogo brandSlug={selectedBrand.brandSlug} brandName={selectedBrand.brandName} size="large" variant="wordmark" />
                <div>
                  <h2>{selectedBrand.brandName}</h2>
                  <span>{selectedBrand.cars.length} garage car{selectedBrand.cars.length === 1 ? "" : "s"} / {selectedBrand.tunes.length} saved tune{selectedBrand.tunes.length === 1 ? "" : "s"}</span>
                </div>
              </header>

              <div className="garageBrandCars" aria-label={`${selectedBrand.brandName} cars`}>
                {selectedBrand.cars.map((car) => {
                  const carTunes = tunesByCar.get(car.id) ?? [];
                  const info = chassisInfoFromCar(car);
                  const isOpen = openCarId === car.id;
                  return (
                    <article className={`garageCarCompact ${isOpen ? "open" : ""}`} key={car.id}>
                      <button
                        className="garageCarSummary"
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => setOpenCarId((current) => current === car.id ? "" : car.id)}
                      >
                        <span className="garageCarMark">
                          <BrandLogo brandSlug={info.brandSlug} brandName={info.brand} size="small" variant="mark" />
                        </span>
                        <span className="garageCarText">
                          <strong>{car.name}</strong>
                          <em>{info.model || car.chassis || "Chassis model not set"}</em>
                          <small>{carTunes.length ? `${carTunes.length} saved tune${carTunes.length === 1 ? "" : "s"}` : "No tunes yet"}</small>
                        </span>
                        <span className="garageTuneDisclosure">
                          <span>{carTunes.length ? "Tunes" : "Add tune"}</span>
                          <ChevronDown size={18} />
                        </span>
                      </button>

                      {isOpen ? (
                        <div className="garageCarTuneTray">
                          {carTunes.length ? (
                            carTunes.map((tune) => (
                              <div className="garageCarTuneOptionRow" key={tune.id}>
                                <button className="garageCarTuneOption" type="button" onClick={() => onSelectTune(tune.id)}>
                                  <span>
                                    <strong>{tune.name.trim() || "Untitled tune"}</strong>
                                    <em>{[tune.track || "Track not set", tune.surface || "Surface not set"].join(" / ")}</em>
                                  </span>
                                  <small>{Number.isNaN(Date.parse(tune.updatedAt)) ? "Updated recently" : new Date(tune.updatedAt).toLocaleDateString()}</small>
                                </button>
                                <button className="garageTunePdfButton" type="button" onClick={() => onExportTunePdf(tune)} aria-label={`Export PDF for ${tune.name.trim() || "Untitled tune"}`}>
                                  <Download size={16} />
                                  PDF
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="garageCarTuneEmpty">
                              <strong>No tunes saved for this chassis yet.</strong>
                              <span>Create a baseline setup, then use this dropdown to jump back into each tune.</span>
                            </div>
                          )}
                          <button className="garageCarTuneCreate" type="button" onClick={() => onCreateTune(car.id)}>
                            <Wrench size={15} />
                            Create tune for this chassis
                          </button>
                        </div>
                      ) : null}

                      <div className="garageCarActions">
                        <button className="smallPill" type="button" onClick={() => setEditing(car)}>
                          <Pencil size={15} />
                          Edit
                        </button>
                        <button className="smallPill" type="button" onClick={() => onCreateTune(car.id)}>
                          <Wrench size={15} />
                          New tune
                        </button>
                        {carTunes.length ? (
                          <button className="smallPill" type="button" onClick={() => duplicateLast(car)}>
                            <CopyPlus size={15} />
                            Duplicate
                          </button>
                        ) : null}
                        <button className="smallPill dangerPill" type="button" onClick={() => setDeleteTarget(car)}>
                          <Trash2 size={15} />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      {editing ? (
        <BottomSheet title={cars.some((car) => car.id === editing.id) ? "Edit car" : "Add car"} onClose={() => setEditing(null)}>
          <div className="carForm">
            <p className="helperText">Add the chassis identity only. Tune parts, electronics, photos, and notes live inside each tune.</p>
            <div className="formSplit">
              <SelectField label="Chassis brand" value={editing.chassisBrandSlug || chassisInfoFromCar(editing).brandSlug} onChange={(event) => {
                const brand = findChassisBrand(event.target.value);
                setEditing({
                  ...editing,
                  brand: brand?.name ?? "",
                  chassisBrand: brand?.name ?? "",
                  chassisBrandSlug: event.target.value,
                  chassisModel: brand?.models[0] ?? "Custom",
                  chassisModelSlug: slugifyChassis(brand?.models[0] ?? "Custom")
                });
              }}>
                <option value="">Choose brand</option>
                {chassisBrands.map((brand) => <option key={brand.slug} value={brand.slug}>{brand.name}</option>)}
              </SelectField>
              <TextField label="Chassis model" value={editing.chassisModel || ""} placeholder={modelsForBrand(editing.chassisBrandSlug || editing.brand).slice(0, 3).join(", ") || "Custom"} onChange={(event) => setEditing({ ...editing, chassisModel: event.target.value, chassisModelSlug: slugifyChassis(event.target.value) })} />
            </div>
            <div className="formSplit">
              <TextField label="Chassis type" value={editing.chassisType || ""} placeholder="RWD drift" onChange={(event) => setEditing({ ...editing, chassisType: event.target.value, drivetrainType: event.target.value.includes("AWD") ? "AWD" : event.target.value.includes("CS") ? "CS" : event.target.value.includes("RWD") ? "RWD" : editing.drivetrainType })} />
              <TextField label="Scale" value={editing.scale || ""} placeholder="1/10" onChange={(event) => setEditing({ ...editing, scale: event.target.value })} />
            </div>
            <div className="templateModeHint">
              {classifyTemplate(editing).officialTemplateEligible ? "Official PDF template will be enabled for this car." : "This car will use Universal Setup Sheet Mode."}
            </div>
            <button className="primaryAction fullWidth" type="button" onClick={saveEditing}>
              Save car
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {deleteTarget ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="delete-car-title">
            <h2 id="delete-car-title">Delete car?</h2>
            <p>This removes "{deleteTarget.name}" and tunes connected to this car from your garage. This cannot be undone.</p>
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="primaryAction destructive" type="button" onClick={() => deleteCar(deleteTarget)}>
                <Trash2 size={17} />
                Delete car
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
