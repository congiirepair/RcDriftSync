import { Camera, CarFront, CopyPlus, ImagePlus, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Car, Tune, TunePhoto } from "../types";
import { BottomSheet } from "./BottomSheet";
import { TuneCard } from "./TuneVisuals";
import { AppCard, EmptyState, SelectField, TextAreaField, TextField } from "./UiPrimitives";

interface GarageManagerProps {
  cars: Car[];
  tunes: Tune[];
  activeTuneId?: string;
  startAdding?: number;
  onSaveCar: (car: Car) => void;
  onDeleteCar: (carId: string) => void;
  onCreateTune: (carId: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onSelectTune: (tuneId: string) => void;
}

const chassisSuggestions = [
  "Reve D RDX",
  "Reve D MC-3",
  "Yokomo",
  "MST",
  "Usukani",
  "Rhino Racing",
  "Team AD",
  "Overdose",
  "Wrap-Up Next",
  "Sakura",
  "Redcat",
  "Custom / Other"
];

const brands = ["Reve D", "Yokomo", "MST", "Usukani", "Rhino Racing", "Team AD", "Overdose", "Wrap-Up Next", "Sakura", "Redcat", "Custom / Other"];
const drivetrainTypes = ["RWD", "AWD", "CS", "Other"];
const motorLayouts = ["Rear motor", "Mid motor", "Front motor", "High mount", "Low mount", "Other"];

const emptyCar = (): Car => ({
  id: `car-${Date.now()}`,
  name: "",
  brand: "",
  chassis: "",
  chassisModel: "",
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
  const text = `${car.brand ?? ""} ${car.chassis ?? ""} ${car.chassisModel ?? ""}`.toLowerCase();
  if (text.includes("rdx")) {
    return { ...car, chassis: car.chassis || "Reve D RDX", sheetId: "rdx-template", templateMode: "official", officialTemplateEligible: true };
  }
  if (text.includes("mc-3") || text.includes("mc3")) {
    return { ...car, chassis: car.chassis || "Reve D MC-3", sheetId: "mc3-template", templateMode: "official", officialTemplateEligible: true };
  }
  return { ...car, sheetId: "universal-template", templateMode: "universal", officialTemplateEligible: false };
}

function templateModeLabel(car: Car) {
  return car.templateMode === "official" || car.sheetId === "rdx-template" || car.sheetId === "mc3-template" ? "Official PDF" : "Universal sheet";
}

function isOfficialTemplate(car: Car) {
  return car.templateMode === "official" || car.sheetId === "rdx-template" || car.sheetId === "mc3-template";
}

async function photosFromFiles(files: FileList | null, existing: TunePhoto[] = []) {
  if (!files?.length) return [];
  return Promise.all(
    Array.from(files).map(
      (file, index) =>
        new Promise<TunePhoto>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve({
              id: `car-photo-${Date.now()}-${index}`,
              label: index === 0 && existing.length === 0 ? "Full car" : file.name.replace(/\.[^.]+$/, ""),
              dataUrl: String(reader.result),
              provider: "local",
              createdAt: new Date().toISOString()
            });
          reader.readAsDataURL(file);
        })
    )
  );
}

export function GarageManager({
  cars,
  tunes,
  startAdding,
  onSaveCar,
  onDeleteCar,
  onCreateTune,
  onDuplicateTune,
  onSelectTune
}: GarageManagerProps) {
  const [editing, setEditing] = useState<Car | null>(startAdding ? emptyCar() : null);
  const [detailCarId, setDetailCarId] = useState<string>(cars[0]?.id ?? "");
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const detailCar = cars.find((car) => car.id === detailCarId) ?? cars[0];
  const tunesByCar = useMemo(() => new Map(cars.map((car) => [car.id, tunes.filter((tune) => tune.carId === car.id)])), [cars, tunes]);

  useEffect(() => {
    if (!startAdding) return;
    const handle = window.setTimeout(() => setEditing(emptyCar()), 0);
    return () => window.clearTimeout(handle);
  }, [startAdding]);

  function saveEditing() {
    if (!editing) return;
    const next = classifyTemplate({
      ...editing,
      name: editing.name.trim() || `${editing.chassis || editing.chassisModel || "RC drift"} car`,
      chassis: editing.chassis.trim() || editing.chassisModel?.trim() || "Custom / Other",
      updatedAt: new Date().toISOString()
    });
    onSaveCar(next);
    setDetailCarId(next.id);
    setEditing(null);
  }

  function deleteCar(car: Car) {
    onDeleteCar(car.id);
    setDetailCarId(cars.find((item) => item.id !== car.id)?.id ?? "");
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
        <div className="garageCarList">
          {cars.map((car) => {
            const carTunes = tunesByCar.get(car.id) ?? [];
            return (
              <AppCard key={car.id} className={detailCar?.id === car.id ? "activeCard" : ""}>
                <button className="carDetailButton" type="button" onClick={() => setDetailCarId(car.id)}>
                  {car.photos?.[0] ? <img src={car.photos[0].cloudUrl || car.photos[0].dataUrl} alt={car.name} /> : <CarFront size={26} />}
                  <span>
                    <strong>{car.name}</strong>
                    <em>{car.chassisModel || car.chassis} · {templateModeLabel(car)}</em>
                    <small>{carTunes.length} tune{carTunes.length === 1 ? "" : "s"}</small>
                  </span>
                </button>
                <div className="buttonRow">
                  <button className="smallPill" type="button" onClick={() => setEditing(car)}>
                    <Pencil size={16} />
                    Edit
                  </button>
                  <button className="smallPill" type="button" onClick={() => onCreateTune(car.id)}>
                    <Wrench size={16} />
                    Tune
                  </button>
                  <button className="smallPill" type="button" onClick={() => duplicateLast(car)} disabled={!carTunes.length}>
                    <CopyPlus size={16} />
                    Duplicate last
                  </button>
                </div>
              </AppCard>
            );
          })}
        </div>
      ) : null}

      {detailCar ? (
        <section className="carDetailPanel">
          <header>
            <div>
              <p>Car detail</p>
              <h2>{detailCar.name}</h2>
              <span>{detailCar.brand || "Brand not set"} · {detailCar.chassisModel || detailCar.chassis}</span>
            </div>
            <button className="iconButton" type="button" onClick={() => setEditing(detailCar)} aria-label={`Edit ${detailCar.name}`}>
              <Pencil size={19} />
            </button>
          </header>

          {detailCar.photos?.length ? (
            <div className="carPhotoStrip">
              {detailCar.photos.map((photo) => (
                <img key={photo.id} src={photo.cloudUrl || photo.dataUrl} alt={photo.label} />
              ))}
            </div>
          ) : (
            <div className="carPhotoEmpty">
              <Camera size={24} />
              <span>No car photo yet</span>
            </div>
          )}

          <dl className="carSpecs">
            <div><dt>Template</dt><dd>{isOfficialTemplate(detailCar) ? "Official PDF eligible" : "Universal Setup Sheet Mode"}</dd></div>
            <div><dt>Drivetrain</dt><dd>{detailCar.drivetrainType || "Not set"}</dd></div>
            <div><dt>Motor layout</dt><dd>{detailCar.motorLayout || "Not set"}</dd></div>
            <div><dt>Scale</dt><dd>{detailCar.scale || "Not set"}</dd></div>
            <div><dt>Electronics</dt><dd>{[detailCar.motor, detailCar.esc, detailCar.servo, detailCar.gyro].filter(Boolean).join(" / ") || "Not set"}</dd></div>
            <div><dt>Body / tire</dt><dd>{[detailCar.body, detailCar.defaultTire].filter(Boolean).join(" / ") || "Not set"}</dd></div>
            <div><dt>Home track</dt><dd>{detailCar.homeTrack || "Not set"}</dd></div>
          </dl>

          {detailCar.notes ? <p className="carNotes">{detailCar.notes}</p> : null}

          <div className="buttonRow">
            <button className="primaryAction" type="button" onClick={() => onCreateTune(detailCar.id)}>
              <Wrench size={18} />
              Create tune
            </button>
            <button className="smallPill" type="button" onClick={() => duplicateLast(detailCar)} disabled={!(tunesByCar.get(detailCar.id)?.length)}>
              <CopyPlus size={16} />
              Duplicate last tune
            </button>
            <button className="smallPill dangerPill" type="button" onClick={() => setDeleteTarget(detailCar)}>
              <Trash2 size={16} />
              Delete
            </button>
          </div>

          <section className="connectedTunes">
            <h3>Tunes for this car</h3>
            {(tunesByCar.get(detailCar.id) ?? []).length ? (
              (tunesByCar.get(detailCar.id) ?? []).map((tune) => (
                <TuneCard key={tune.id} tune={tune} car={detailCar} onView={() => onSelectTune(tune.id)} onClone={() => onDuplicateTune(tune)} />
              ))
            ) : (
              <EmptyState title="Tunes" body="No tunes yet. Create a baseline setup for your next track day." />
            )}
          </section>
        </section>
      ) : null}

      <button className="floatingAddCar primaryAction" type="button" onClick={() => setEditing(emptyCar())}>
        <Plus size={19} />
        Add car
      </button>

      {editing ? (
        <BottomSheet title={cars.some((car) => car.id === editing.id) ? "Edit car" : "Add car"} onClose={() => setEditing(null)}>
          <div className="carForm">
            <TextField label="Car name" value={editing.name} placeholder="My RDX track car" onChange={(event) => setEditing({ ...editing, name: event.target.value })} />
            <p className="helperText">Only car name and chassis are needed. Everything else can wait until later.</p>
            <SelectField label="Brand / chassis suggestion" value={editing.chassis || ""} onChange={(event) => setEditing({ ...editing, chassis: event.target.value, brand: event.target.value.split(" ")[0] })}>
              <option value="">Choose a chassis</option>
              {chassisSuggestions.map((item) => <option key={item}>{item}</option>)}
            </SelectField>
            <div className="formSplit">
              <SelectField label="Brand" value={editing.brand || ""} onChange={(event) => setEditing({ ...editing, brand: event.target.value })}>
                <option value="">Choose brand</option>
                {brands.map((item) => <option key={item}>{item}</option>)}
              </SelectField>
              <TextField label="Chassis model" value={editing.chassisModel || ""} placeholder="RDX, RMX, SD 2.0..." onChange={(event) => setEditing({ ...editing, chassisModel: event.target.value })} />
            </div>
            <div className="formSplit">
              <TextField label="Chassis type" value={editing.chassisType || ""} placeholder="RWD drift" onChange={(event) => setEditing({ ...editing, chassisType: event.target.value })} />
              <SelectField label="Drivetrain" value={editing.drivetrainType || ""} onChange={(event) => setEditing({ ...editing, drivetrainType: event.target.value })}>
                <option value="">Choose</option>
                {drivetrainTypes.map((item) => <option key={item}>{item}</option>)}
              </SelectField>
            </div>
            <div className="formSplit">
              <SelectField label="Motor layout" value={editing.motorLayout || ""} onChange={(event) => setEditing({ ...editing, motorLayout: event.target.value })}>
                <option value="">Choose</option>
                {motorLayouts.map((item) => <option key={item}>{item}</option>)}
              </SelectField>
              <TextField label="Scale" value={editing.scale || ""} placeholder="1/10" onChange={(event) => setEditing({ ...editing, scale: event.target.value })} />
            </div>
            <div className="formSplit">
              <TextField label="Motor" value={editing.motor || ""} onChange={(event) => setEditing({ ...editing, motor: event.target.value })} />
              <TextField label="ESC" value={editing.esc || ""} onChange={(event) => setEditing({ ...editing, esc: event.target.value })} />
            </div>
            <div className="formSplit">
              <TextField label="Servo" value={editing.servo || ""} onChange={(event) => setEditing({ ...editing, servo: event.target.value })} />
              <TextField label="Gyro" value={editing.gyro || ""} onChange={(event) => setEditing({ ...editing, gyro: event.target.value })} />
            </div>
            <TextField label="Radio / Receiver" value={editing.radioReceiver || ""} onChange={(event) => setEditing({ ...editing, radioReceiver: event.target.value })} />
            <div className="formSplit">
              <TextField label="Battery" value={editing.battery || ""} onChange={(event) => setEditing({ ...editing, battery: event.target.value })} />
              <TextField label="Body" value={editing.body || ""} onChange={(event) => setEditing({ ...editing, body: event.target.value })} />
            </div>
            <div className="formSplit">
              <TextField label="Default tire" value={editing.defaultTire || ""} onChange={(event) => setEditing({ ...editing, defaultTire: event.target.value })} />
              <TextField label="Home track" value={editing.homeTrack || ""} onChange={(event) => setEditing({ ...editing, homeTrack: event.target.value })} />
            </div>
            <TextAreaField label="Notes" value={editing.notes || ""} onChange={(event) => setEditing({ ...editing, notes: event.target.value })} />
            <label className="photoUploader compactUploader">
              <ImagePlus size={22} />
              <span>Add car photo</span>
              <small>Camera or gallery</small>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={async (event) => {
                  const newPhotos = await photosFromFiles(event.target.files, editing.photos);
                  setEditing({ ...editing, photos: [...newPhotos, ...(editing.photos ?? [])] });
                }}
              />
            </label>
            {editing.photos?.length ? (
              <div className="carPhotoStrip editable">
                {editing.photos.map((photo) => <img key={photo.id} src={photo.cloudUrl || photo.dataUrl} alt={photo.label} />)}
              </div>
            ) : null}
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
            <p>This removes “{deleteTarget.name}” and tunes connected to this car from your garage. This cannot be undone.</p>
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
