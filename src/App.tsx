import {
  CarFront,
  CalendarPlus,
  Bell,
  BadgeCheck,
  Clock3,
  CopyPlus,
  Edit3,
  Search,
  Moon,
  Plus,
  QrCode,
  RefreshCcw,
  Settings,
  Sun,
  Trash2,
  Trophy,
  UsersRound,
  Wrench
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode, RefObject } from "react";
import { AppShell } from "./components/AppShell";
import { CompareView } from "./components/CompareView";
import { GarageManager } from "./components/GarageManager";
import { LibraryPage, TrackPage } from "./components/LibraryPage";
import { ProfilePage } from "./components/ProfilePage";
import { PublicTunePage } from "./components/PublicTunePage";
import { TuneCard } from "./components/TuneVisuals";
import { UniversalTuneBuilder } from "./components/UniversalTuneBuilder";
import { AppCard, EmptyState, LoadingState, PageHeader, SelectField, TextAreaField, TextField } from "./components/UiPrimitives";
import { APP_NAME } from "./config/domain";
import { setupSheets } from "./data/sheets";
import { enableFirebaseOffline, isFirebaseConfigured } from "./services/firebase";
import {
  firebaseLogin,
  firebaseGoogleLogin,
  firebaseLogout,
  firebasePasswordReset,
  firebaseSignUp,
  importLocalDataToFirebase,
  listenToFirebaseAuth,
  loadFirebaseAppData,
  loadFirebasePublicData,
  removeFirebaseCar,
  removeFirebaseTune,
  saveFirebaseAppData,
  saveProfile
} from "./services/firebaseData";
import { loadAppData, resetAppData, saveAppData } from "./store/db";
import type { AppData, Car, ElectronicsProfile, NotificationSettings, ThemeMode, TrackSession, Tune, TunePhoto, UserAccount } from "./types";
import { withRevision } from "./utils/changes";
import { navigate } from "./utils/routing";
import { parseRoute, type AppRoute } from "./utils/routing";

type SetupMode = "official" | "universal" | "custom";
type StartingPoint = "blank" | "duplicate" | "baseline" | "import";

const AdminPage = lazy(() => import("./components/AdminPage").then((module) => ({ default: module.AdminPage })));
const PdfMapperPage = lazy(() => import("./components/PdfMapperPage").then((module) => ({ default: module.PdfMapperPage })));
const SEEDED_CAR_IDS = new Set(["car-rdx", "car-mc3"]);
const SEEDED_TUNE_IDS = new Set(["tune-rdx-baseline", "tune-mc3-carpet"]);
const SEEDED_PROFILE_IDS = new Set(["demo-driver"]);
const SEEDED_TUNE_NAMES = new Set(["rdx baseline asphalt", "mc-3 carpet quick steer"]);

function tuneDisplayName(tune: Pick<Tune, "name">) {
  return tune.name.trim() || "Untitled tune";
}

function createTune(car: Car, source?: Partial<Tune>): Tune {
  const sheet = setupSheets.find((item) => item.id === car.sheetId) ?? setupSheets[0];
  const values = { ...sheet.defaultValues, ...(source?.values ?? {}) };
  return {
    id: `tune-${Date.now()}`,
    name: source?.name ?? "",
    carId: car.id,
    sheetId: car.sheetId,
    date: source?.date ?? new Date().toISOString().slice(0, 10),
    track: source?.track ?? car.homeTrack ?? "",
    surface: source?.surface ?? "",
    grip: source?.grip ?? "Medium",
    rating: source?.rating ?? 3,
    tags: source?.tags ?? [String(car.chassis).toLowerCase()],
    values,
    selections: { ...Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(value)])), ...(source?.selections ?? {}) },
    notes: source?.notes ?? "",
    setupIntent: source?.setupIntent ?? [],
    bestForTags: source?.bestForTags ?? [],
    trackConditionPreset: source?.trackConditionPreset ?? "",
    expectedFeel: source?.expectedFeel,
    actualFeel: source?.actualFeel,
    changeReason: source?.changeReason ?? "",
    testResult: source?.testResult ?? "",
    confidenceRating: source?.confidenceRating ?? 3,
    summaryChips: source?.summaryChips ?? [],
    photos: [],
    history: [],
    ownerId: source?.ownerId ?? "local-user",
    ownerUsername: source?.ownerUsername ?? "my-garage",
    ownerDisplayName: source?.ownerDisplayName ?? "My Garage",
    shareId: source?.shareId ?? `share-${Date.now()}`,
    visibility: source?.visibility ?? "private",
    cloneEnabled: source?.cloneEnabled ?? false,
    sharedPhotosEnabled: source?.sharedPhotosEnabled ?? false,
    sharedNotesEnabled: source?.sharedNotesEnabled ?? false,
    sharedChassisSetupEnabled: source?.sharedChassisSetupEnabled ?? true,
    sharedEscTuneEnabled: source?.sharedEscTuneEnabled ?? false,
    sharedServoTuneEnabled: source?.sharedServoTuneEnabled ?? false,
    sharedGyroTuneEnabled: source?.sharedGyroTuneEnabled ?? false,
    sharedRadioTuneEnabled: source?.sharedRadioTuneEnabled ?? false,
    sharedHistoryEnabled: source?.sharedHistoryEnabled ?? false,
    sharedOwnerNameEnabled: source?.sharedOwnerNameEnabled ?? true,
    pdfDownloadEnabled: source?.pdfDownloadEnabled ?? true,
    viewCount: source?.viewCount ?? 0,
    cloneCount: source?.cloneCount ?? 0,
    likeCount: source?.likeCount ?? 0,
    shareCount: source?.shareCount ?? 0,
    setupAssistantLog: source?.setupAssistantLog ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function carTemplatePatch(car: Car): Partial<Car> {
  const text = `${car.brand ?? ""} ${car.chassis ?? ""} ${car.chassisModel ?? ""}`.toLowerCase();
  if (text.includes("rdx")) return { sheetId: "rdx-template", templateMode: "official", officialTemplateEligible: true };
  if (text.includes("mc-3") || text.includes("mc3")) return { sheetId: "mc3-template", templateMode: "official", officialTemplateEligible: true };
  return { sheetId: "universal-template", templateMode: "universal", officialTemplateEligible: false };
}

function userTunePatch(account: UserAccount | null): Partial<Tune> {
  return account
    ? {
        ownerId: account.uid,
        ownerUsername: account.username ?? account.email?.split("@")[0] ?? "driver",
        ownerDisplayName: account.displayName ?? account.email ?? "RC Drift Sync Driver"
      }
    : {
        ownerId: "local-user",
        ownerUsername: "my-garage",
        ownerDisplayName: "My Garage"
      };
}

function canManageTune(account: UserAccount | null, tune: Tune | null | undefined) {
  if (!tune) return false;
  if (!account) return true;
  return Boolean(account.isAdmin) || !tune.ownerId || tune.ownerId === "local-user" || tune.ownerId === account.uid;
}

function mergeAppData(base: AppData, incoming: Partial<AppData>): AppData {
  const incomingCars = incoming.cars?.filter((car) => !SEEDED_CAR_IDS.has(car.id));
  const isSeededTune = (tune: Tune) =>
    SEEDED_TUNE_IDS.has(tune.id) ||
    SEEDED_TUNE_NAMES.has(tune.name.trim().toLowerCase()) ||
    SEEDED_CAR_IDS.has(tune.carId) ||
    SEEDED_PROFILE_IDS.has(tune.ownerId ?? "");
  const cleanBaseCars = base.cars.filter((car) => !SEEDED_CAR_IDS.has(car.id));
  const cleanBaseCarIds = new Set(cleanBaseCars.map((car) => car.id));
  const cleanBaseTunes = base.tunes.filter((tune) => !isSeededTune(tune) && (cleanBaseCarIds.has(tune.carId) || (tune.ownerId && tune.ownerId !== "local-user")));
  const incomingTunes = incoming.tunes?.filter((tune) => !isSeededTune(tune));
  const incomingProfiles = incoming.profiles?.filter((profile) => !SEEDED_PROFILE_IDS.has(profile.uid));
  const byId = <T extends { id?: string }>(current: T[] = [], next: T[] = []) => {
    const map = new Map<string, T>();
    current.forEach((item, index) => map.set(item.id ?? `current-${index}`, item));
    next.forEach((item, index) => map.set(item.id ?? `next-${index}`, item));
    return Array.from(map.values());
  };
  const byUsername = (current = base.profiles ?? [], next = incoming.profiles ?? []) => {
    const map = new Map<string, (typeof current)[number]>();
    current.forEach((item) => map.set(item.username, item));
    next.forEach((item) => map.set(item.username, item));
    return Array.from(map.values());
  };
  return {
    ...base,
    cars: byId(cleanBaseCars, incomingCars),
    tunes: byId(cleanBaseTunes, incomingTunes),
    electronicsProfiles: byId(base.electronicsProfiles, incoming.electronicsProfiles),
    trackSessions: byId(base.trackSessions, incoming.trackSessions),
    profiles: byUsername(base.profiles ?? [], incomingProfiles ?? [])
  };
}

function personalLocalDataForImport(data: AppData): AppData {
  const demoCarIds = new Set(["car-rdx", "car-mc3"]);
  const demoTuneIds = new Set(["tune-rdx-baseline", "tune-mc3-carpet"]);
  const cars = data.cars.filter((car) => !demoCarIds.has(car.id));
  const carIds = new Set(cars.map((car) => car.id));
  const tunes = data.tunes.filter((tune) => !demoTuneIds.has(tune.id) && !SEEDED_TUNE_NAMES.has(tune.name.trim().toLowerCase()) && (tune.ownerId === "local-user" || carIds.has(tune.carId)));
  const tuneIds = new Set(tunes.map((tune) => tune.id));
  return {
    ...data,
    cars,
    tunes,
    electronicsProfiles: data.electronicsProfiles ?? [],
    trackSessions: (data.trackSessions ?? []).filter((session) => tuneIds.has(session.tuneId) || carIds.has(session.carId)),
    comments: [],
    favorites: [],
    follows: [],
    profiles: []
  };
}

function routeToNav(route: AppRoute): "home" | "garage" | "builder" | "community" | "profile" {
  if (route.name === "garage" || route.name === "cars" || route.name === "tunes") return "garage";
  if (route.name === "builder" || route.name === "tune") return "builder";
  if (route.name === "community" || route.name === "library") return "community";
  if (route.name === "profile" || route.name === "driverProfile" || route.name === "settings") return "profile";
  if (route.name === "track") return "community";
  if (route.name === "sessions") return "home";
  return "home";
}

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [activeTuneId, setActiveTuneId] = useState("");
  const [draft, setDraft] = useState<Tune | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [route, setRoute] = useState<AppRoute>(() => parseRoute());
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem("rc-theme") as ThemeMode) || "dark");
  const [garageAddNonce, setGarageAddNonce] = useState(0);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [authReady, setAuthReady] = useState(!isFirebaseConfigured);
  const [syncStatus, setSyncStatus] = useState(isFirebaseConfigured ? "Firebase ready" : "Local-only mode");
  const [migrationPrompt, setMigrationPrompt] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => localStorage.getItem("rc-onboarding-complete") !== "yes");
  const [online, setOnline] = useState(() => navigator.onLine);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadAppData().then((loaded) => {
      setData(loaded);
      setActiveTuneId(loaded.tunes[0]?.id ?? "");
      if (isFirebaseConfigured) {
        loadFirebasePublicData()
          .then((publicData) => setData((current) => (current ? mergeAppData(current, publicData) : current)))
          .catch(() => setSyncStatus("Local garage ready. Public library sync is unavailable."));
      }
    });
    enableFirebaseOffline();
  }, []);

  useEffect(() => {
    const unsubscribe = listenToFirebaseAuth(async (user) => {
      setAccount(user);
      setAuthReady(true);
      if (!user) {
        setSyncStatus(isFirebaseConfigured ? "Signed out. Local edits stay on this device." : "Local-only mode");
        return;
      }
      setSyncStatus("Loading your Firebase garage...");
      const cloud = await loadFirebaseAppData(user.uid);
      setData((current) => {
        if (!current) return current;
        const hasCloud = Boolean(cloud.cars?.length || cloud.tunes?.length || cloud.electronicsProfiles?.length);
        const hasLocal = current.cars.length > 0 || current.tunes.length > 0 || Boolean(current.electronicsProfiles?.length);
        setMigrationPrompt(hasLocal);
        if (!hasCloud) return current;
        return mergeAppData(current, cloud);
      });
      setSyncStatus("Firebase sync ready");
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const updateRoute = () => setRoute(parseRoute());
    window.addEventListener("popstate", updateRoute);
    return () => window.removeEventListener("popstate", updateRoute);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rc-theme", theme);
  }, [theme]);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  const activeTune = useMemo(() => data?.tunes.find((tune) => tune.id === activeTuneId) ?? data?.tunes[0], [data, activeTuneId]);

  useEffect(() => {
    if (!activeTune) return;
    const handle = window.setTimeout(() => setDraft(activeTune), 0);
    return () => window.clearTimeout(handle);
  }, [activeTune]);

  useEffect(() => {
    if (route.name !== "tune") return;
    const handle = window.setTimeout(() => setActiveTuneId(route.tuneId), 0);
    return () => window.clearTimeout(handle);
  }, [route]);

  if (!data) return <LoadingState label="Loading RC Drift Sync..." />;
  if (!authReady) return <LoadingState label="Checking Firebase account..." />;

  const appData = data;
  const currentDraft = draft;
  const original = draft ? data.tunes.find((tune) => tune.id === draft.id) ?? draft : null;
  const dirty = Boolean(draft && original && JSON.stringify(original) !== JSON.stringify(draft));

  async function commit(nextData: AppData) {
    setData(nextData);
    await saveAppData(nextData);
    if (account) {
      try {
        await saveFirebaseAppData(account.uid, nextData);
        setSyncStatus("Synced to Firebase");
      } catch {
        setSyncStatus("Saved locally. Firebase sync is waiting for permission or connection.");
      }
    }
  }

  function showSaved() {
    return;
  }

  async function importLocalToCloud() {
    if (!account) return;
    const importData = personalLocalDataForImport(appData);
    setSyncStatus("Importing your local cars and tunes to Firebase...");
    await importLocalDataToFirebase(account.uid, importData);
    setMigrationPrompt(false);
    setSyncStatus(`Imported ${importData.cars.length} cars and ${importData.tunes.length} tunes to Firebase`);
    showSaved();
  }

  async function saveDraft() {
    if (!original || !currentDraft) return;
    if (!canManageTune(account, currentDraft)) {
      setSyncStatus("This tune belongs to another driver. Clone it before editing.");
      return;
    }
    const saved = withRevision(original, currentDraft);
    const nextData = { ...appData, tunes: appData.tunes.map((tune) => (tune.id === saved.id ? saved : tune)) };
    setDraft(saved);
    await commit(nextData);
    showSaved();
  }

  async function addTune(carId: string, goToBuilder = true) {
    const car = appData.cars.find((item) => item.id === carId) ?? appData.cars[0];
    if (!car) return;
    const tune = { ...createTune(car), ...userTunePatch(account) };
    await commit({ ...appData, tunes: [tune, ...appData.tunes] });
    setActiveTuneId(tune.id);
    setDraft(tune);
    if (goToBuilder) navigate("/builder");
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  async function createBuilderTune(options: { carId: string; setupMode: SetupMode; startingPoint: StartingPoint; sourceTuneId?: string }) {
    const car = appData.cars.find((item) => item.id === options.carId) ?? appData.cars[0];
    if (!car) return;
    const lastTune = appData.tunes.find((tune) => tune.carId === car.id);
    const selectedSource = appData.tunes.find((tune) => tune.id === options.sourceTuneId);
    const baseline = {
      values: {
        frontRideHeight: 6,
        rearRideHeight: 6.5,
        frontCamber: -6,
        rearCamber: -3,
        grip: "Medium",
        tires: car.defaultTire ?? "",
        body: car.body ?? ""
      },
      notes: "Baseline tune created in RC Drift Sync."
    };
    const source = options.startingPoint === "duplicate" ? selectedSource ?? lastTune : options.startingPoint === "baseline" ? baseline : undefined;
    const modePatch = options.setupMode === "official" ? carTemplatePatch(car) : { sheetId: "universal-template", templateMode: "universal" as const, officialTemplateEligible: false };
    const modeCar = { ...car, ...modePatch };
    const tune = { ...createTune(modeCar, source), ...userTunePatch(account) };
    const duplicateSourceName = options.startingPoint === "duplicate" && source && "name" in source ? source.name : "";
    tune.name = duplicateSourceName ? `${duplicateSourceName} copy` : "";
    await commit({ ...appData, tunes: [tune, ...appData.tunes] });
    setActiveTuneId(tune.id);
    setDraft(tune);
    navigate("/builder");
    showSaved();
  }

  async function updateTune(nextTune: Tune) {
    if (!canManageTune(account, nextTune)) {
      setSyncStatus("This tune belongs to another driver. Clone it before editing.");
      return;
    }
    setDraft(nextTune);
    await commit({ ...appData, tunes: appData.tunes.map((tune) => (tune.id === nextTune.id ? nextTune : tune)) });
  }

  async function deleteTune(tuneId: string) {
    const tuneToDelete = appData.tunes.find((tune) => tune.id === tuneId);
    if (!canManageTune(account, tuneToDelete)) {
      setSyncStatus("Only the owner can delete that tune.");
      return;
    }
    if (account && tuneToDelete) {
      try {
        await removeFirebaseTune(tuneToDelete);
      } catch {
        setSyncStatus("Delete failed in Firebase. The tune was left in place.");
        return;
      }
    }
    const tunes = appData.tunes.filter((tune) => tune.id !== tuneId);
    await commit({ ...appData, tunes });
    setActiveTuneId(tunes[0]?.id ?? "");
    setDraft(tunes[0] ?? null);
    if (route.name === "tune" || route.name === "builder") navigate("/tunes");
    showSaved();
  }

  async function saveElectronicsProfile(profile: ElectronicsProfile) {
    const profiles = appData.electronicsProfiles ?? [];
    const exists = profiles.some((item) => item.id === profile.id);
    const nextProfile = { ...profile, updatedAt: new Date().toISOString() };
    const electronicsProfiles = exists ? profiles.map((item) => (item.id === profile.id ? nextProfile : item)) : [nextProfile, ...profiles];
    await commit({ ...appData, electronicsProfiles });
    showSaved();
  }

  function requestAddCar() {
    setGarageAddNonce((value) => value + 1);
    navigate("/garage");
  }

  async function saveCar(car: Car) {
    const nextCar: Car = {
      ...car,
      ...carTemplatePatch(car),
      updatedAt: new Date().toISOString()
    };
    const exists = appData.cars.some((item) => item.id === nextCar.id);
    const cars = exists ? appData.cars.map((item) => (item.id === nextCar.id ? nextCar : item)) : [nextCar, ...appData.cars];
    await commit({ ...appData, cars });
    showSaved();
  }

  async function deleteCar(carId: string) {
    const carToDelete = appData.cars.find((car) => car.id === carId);
    const connectedTunes = appData.tunes.filter((tune) => tune.carId === carId);
    if (account && carToDelete) {
      try {
        await Promise.all(connectedTunes.map((tune) => removeFirebaseTune(tune)));
        await removeFirebaseCar(carToDelete);
      } catch {
        setSyncStatus("Delete failed in Firebase. The car and connected tunes were left in place.");
        return;
      }
    }
    const tunes = appData.tunes.filter((tune) => tune.carId !== carId);
    await commit({ ...appData, cars: appData.cars.filter((car) => car.id !== carId), tunes });
    setActiveTuneId(tunes[0]?.id ?? "");
    setDraft(tunes[0] ?? null);
    showSaved();
  }

  async function duplicateTune(source: Tune | null = currentDraft) {
    if (!source) return;
    const isSharedSource = source.ownerId && source.ownerId !== "local-user";
    const tune: Tune = {
      ...source,
      id: `tune-${Date.now()}`,
      name: source.name.trim() ? `${source.name} copy` : "",
      photos: source.sharedPhotosEnabled ? source.photos : [],
      ...userTunePatch(account),
      shareId: `share-${Date.now()}`,
      visibility: "private",
      cloneEnabled: false,
      sharedPhotosEnabled: false,
      sharedNotesEnabled: false,
      cloneCount: 0,
      viewCount: 0,
      likeCount: 0,
      shareCount: 0,
      favoriteCount: 0,
      clonedFromTuneId: isSharedSource ? source.id : source.clonedFromTuneId,
      clonedFromOwnerId: isSharedSource ? source.ownerId : source.clonedFromOwnerId,
      clonedFromShareId: isSharedSource ? source.shareId : source.clonedFromShareId,
      sourceTuneId: isSharedSource ? source.id : source.sourceTuneId,
      sourceOwnerId: isSharedSource ? source.ownerId : source.sourceOwnerId,
      parentVersionId: source.id,
      versionGroupId: source.versionGroupId ?? source.id,
      versionNumber: (source.versionNumber ?? 1) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: []
    };
    const tunes = appData.tunes.map((item) => (item.id === source.id ? { ...item, cloneCount: (item.cloneCount ?? 0) + 1 } : item));
    await commit({ ...appData, tunes: [tune, ...tunes] });
    setActiveTuneId(tune.id);
    setDraft(tune);
    navigate("/builder");
    showSaved();
  }

  async function updateSharedTuneStats(tuneId: string, stat: "viewCount" | "likeCount" | "shareCount") {
    const key = `rc-share-stat-${stat}-${tuneId}`;
    if (stat === "viewCount" && sessionStorage.getItem(key)) return;
    if (stat === "viewCount") sessionStorage.setItem(key, "1");
    await commit({
      ...appData,
      tunes: appData.tunes.map((item) => (item.id === tuneId ? { ...item, [stat]: (item[stat] ?? 0) + 1 } : item))
    });
  }

  async function toggleFavorite(tuneId: string) {
    const favorites = appData.favorites ?? [];
    const existing = favorites.find((favorite) => favorite.tuneId === tuneId && favorite.userId === "local-user");
    const nextFavorites = existing
      ? favorites.filter((favorite) => favorite.id !== existing.id)
      : [{ id: `favorite-${Date.now()}`, tuneId, userId: "local-user", createdAt: new Date().toISOString() }, ...favorites];
    await commit({ ...appData, favorites: nextFavorites });
    showSaved();
  }

  async function addCommunityComment(tuneId: string, body: string) {
    const comment = {
      id: `comment-${Date.now()}`,
      tuneId,
      authorId: "local-user",
      authorName: "My Garage",
      body,
      createdAt: new Date().toISOString()
    };
    await commit({ ...appData, comments: [comment, ...(appData.comments ?? [])] });
    showSaved();
  }

  async function saveTrackSession(session: TrackSession) {
    const sessions = appData.trackSessions ?? [];
    const exists = sessions.some((item) => item.id === session.id);
    const trackSessions = exists ? sessions.map((item) => (item.id === session.id ? session : item)) : [session, ...sessions];
    await commit({ ...appData, trackSessions });
    showSaved();
  }

  async function updateNotificationSettings(settings: NotificationSettings) {
    await commit({ ...appData, notificationSettings: settings });
    showSaved();
  }

  async function toggleFollow(username: string) {
    const follows = appData.follows ?? [];
    const existing = follows.find((follow) => follow.followingUsername === username && follow.followerId === "local-user");
    const nextFollows = existing
      ? follows.filter((follow) => follow.id !== existing.id)
      : [{ id: `follow-${Date.now()}`, followerId: "local-user", followingUsername: username, createdAt: new Date().toISOString() }, ...follows];
    const profiles = appData.profiles?.map((profile) =>
      profile.username === username
        ? { ...profile, followerCount: Math.max(0, (profile.followerCount ?? 0) + (existing ? -1 : 1)) }
        : profile
    );
    await commit({ ...appData, follows: nextFollows, profiles });
    showSaved();
  }

  async function resetDemo() {
    const seeded = await resetAppData();
    setData(seeded);
    setActiveTuneId(seeded.tunes[0]?.id ?? "");
    setDraft(seeded.tunes[0] ?? null);
    showSaved();
  }

  function selectTune(id: string, goToBuilder = true) {
    setActiveTuneId(id);
    const tune = appData.tunes.find((item) => item.id === id);
    if (tune) setDraft(tune);
    if (goToBuilder) navigate("/builder");
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  if (compareOpen) return <CompareView data={data} onClose={() => setCompareOpen(false)} />;

  if (route.name === "share") {
    const tune = data.tunes.find((item) => (item.shareId === route.shareId || item.id === route.shareId) && item.visibility !== "private");
    const car = tune ? data.cars.find((item) => item.id === tune.carId) : undefined;
    return (
      <PublicTunePage
        tune={tune}
        car={car}
        onClone={duplicateTune}
        onLike={(sharedTune) => updateSharedTuneStats(sharedTune.id, "likeCount")}
        onShare={(sharedTune) => updateSharedTuneStats(sharedTune.id, "shareCount")}
        onViewed={(sharedTune) => updateSharedTuneStats(sharedTune.id, "viewCount")}
      />
    );
  }

  if (route.name === "admin") {
    return (
      <Suspense fallback={<LoadingState label="Loading admin tools..." />}>
        <AdminPage
          account={account}
          data={data}
          onDeleteCar={deleteCar}
          onDeleteTune={deleteTune}
          onResetHome={resetDemo}
          onLogin={() => navigate("/login")}
        />
      </Suspense>
    );
  }
  if (route.name === "pdfMapper") {
    return (
      <Suspense fallback={<LoadingState label="Loading PDF mapper..." />}>
        <PdfMapperPage />
      </Suspense>
    );
  }

  const shell = (children: ReactNode) => (
    <AppShell active={routeToNav(route)}>
      {!online ? <div className="offlineBanner">Offline mode. Your garage still saves on this phone.</div> : null}
      {children}
      {onboardingOpen && route.name === "home" ? (
        <Onboarding
          onSkip={() => {
            localStorage.setItem("rc-onboarding-complete", "yes");
            setOnboardingOpen(false);
          }}
          onAddCar={() => {
            localStorage.setItem("rc-onboarding-complete", "yes");
            setOnboardingOpen(false);
            requestAddCar();
          }}
          onCreateTune={() => {
            localStorage.setItem("rc-onboarding-complete", "yes");
            setOnboardingOpen(false);
            navigate(draft ? "/builder" : "/garage");
          }}
        />
      ) : null}
    </AppShell>
  );

  if (route.name === "settings") {
    return shell(
      <SettingsPage
        theme={theme}
        account={account}
        syncStatus={syncStatus}
        notificationSettings={appData.notificationSettings}
        onTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onReset={resetDemo}
        onLogout={firebaseLogout}
        onNotifications={updateNotificationSettings}
      />
    );
  }

  if (route.name === "login" || route.name === "signup") {
    return shell(
      <AccountPage
        mode={route.name}
        account={account}
        syncStatus={syncStatus}
        migrationPrompt={migrationPrompt}
        onLogin={firebaseLogin}
        onGoogleLogin={firebaseGoogleLogin}
        onSignup={firebaseSignUp}
        onLogout={firebaseLogout}
        onResetPassword={firebasePasswordReset}
        onSaveProfile={(patch) => (account ? saveProfile(account, patch) : Promise.resolve())}
        onImportLocal={importLocalToCloud}
      />
    );
  }

  if (route.name === "library") {
    return shell(
      <LibraryPage
        data={data}
        onClone={duplicateTune}
        onLike={(tuneId) => updateSharedTuneStats(tuneId, "likeCount")}
        onFavorite={toggleFavorite}
        onComment={addCommunityComment}
        onFollow={toggleFollow}
      />
    );
  }

  if (route.name === "community") {
    return shell(
      <CommunityPage
        data={data}
        onClone={duplicateTune}
        onLike={(tuneId) => updateSharedTuneStats(tuneId, "likeCount")}
        onFavorite={toggleFavorite}
        onComment={addCommunityComment}
        onFollow={toggleFollow}
      />
    );
  }

  if (route.name === "profile") {
    return shell(<MyProfilePage data={data} onSettings={() => navigate("/settings")} />);
  }

  if (route.name === "sessions") {
    return shell(<TrackSessionsPage data={data} activeTune={draft} onSaveSession={saveTrackSession} />);
  }

  if (route.name === "driverProfile") {
    return shell(<ProfilePage data={data} username={route.username} onFollow={toggleFollow} />);
  }

  if (route.name === "track") {
    return shell(<TrackPage data={data} trackSlug={route.trackSlug} onClone={duplicateTune} />);
  }

  if (route.name === "garage" || route.name === "cars" || route.name === "tunes") {
    return shell(
      <GaragePage
        data={data}
        account={account}
        activeTuneId={draft?.id}
        view={route.name}
        startAdding={garageAddNonce}
        onAddCar={requestAddCar}
        onSaveCar={saveCar}
        onDeleteCar={deleteCar}
        onAddTune={(carId) => addTune(carId)}
        onSelectTune={selectTune}
        onDuplicateTune={duplicateTune}
        onDeleteTune={deleteTune}
        onCompare={() => setCompareOpen(true)}
      />
    );
  }

  if (route.name === "builder" || route.name === "tune") {
    if (!draft && data.cars.length === 0) {
      return shell(
        <main className="appPage">
          <PageHeader eyebrow="Tune Builder" title="No tune selected" />
          <EmptyState
            title="Add a car first"
            body="Create a car in your garage, then build its first tune."
            action={<button className="primaryAction" type="button" onClick={requestAddCar}>Add car</button>}
          />
        </main>
      );
    }
    return shell(
      <BuilderPage
        data={data}
        tune={draft}
        dirty={dirty}
        onSave={saveDraft}
        onUpdateTune={updateTune}
        onCreateBuilderTune={createBuilderTune}
        onDeleteTune={deleteTune}
        onSaveElectronicsProfile={saveElectronicsProfile}
        onDuplicate={duplicateTune}
        onSelectTune={(id) => selectTune(id, false)}
        onAddTune={() => addTune(draft?.carId ?? data.cars[0]?.id, false)}
        refEl={editorRef}
      />
    );
  }

  return shell(<HomePage data={data} activeTune={draft} onAddCar={requestAddCar} onAddTune={() => (draft ? addTune(draft.carId) : data.cars[0] ? addTune(data.cars[0].id) : requestAddCar())} onLogSession={() => navigate("/sessions")} onSelectTune={selectTune} />);
}

const notificationDefaults: NotificationSettings = {
  tuneCloned: false,
  tuneLiked: false,
  tuneCommented: false,
  followedDriverSharedTune: false,
  weeklyTrendingTunes: false,
  backupReminder: true
};

const quickSessionButtons = [
  "Felt better",
  "Felt worse",
  "No change",
  "More grip",
  "Less grip",
  "Faster transition",
  "Slower transition",
  "More angle",
  "Less angle",
  "More forward drive",
  "Less forward drive"
];

const sessionSymptoms = ["spins out", "pushes wide", "too twitchy", "slow transition", "not enough angle", "not enough forward drive", "gyro wobble", "car feels lazy"];

const onboardingGoals = ["Save my own tunes", "Share with friends", "Find community tunes", "Generate setup sheet PDFs"];

function daysSince(date?: string) {
  if (!date) return null;
  const then = new Date(date).getTime();
  if (Number.isNaN(then)) return null;
  return Math.max(0, Math.floor((Date.now() - then) / 86400000));
}

function badgeList(data: AppData) {
  const publicTunes = data.tunes.filter((tune) => tune.visibility === "public" || tune.visibility === "unlisted");
  const rdxTunes = data.tunes.filter((tune) => tune.sheetId === "rdx-template" || data.cars.find((car) => car.id === tune.carId)?.chassis.toLowerCase().includes("rdx"));
  const mc3Tunes = data.tunes.filter((tune) => tune.sheetId === "mc3-template" || data.cars.find((car) => car.id === tune.carId)?.chassis.toLowerCase().includes("mc-3"));
  return [
    { label: "First Tune Saved", earned: data.tunes.length > 0 },
    { label: "First Shared Tune", earned: publicTunes.length > 0 },
    { label: "First Clone", earned: data.tunes.some((tune) => tune.clonedFromTuneId) || data.tunes.some((tune) => (tune.cloneCount ?? 0) > 0) },
    { label: "10 Tunes Saved", earned: data.tunes.length >= 10 },
    { label: "Track Day Logger", earned: Boolean(data.trackSessions?.length) },
    { label: "RDX Specialist", earned: rdxTunes.length >= 2 },
    { label: "MC-3 Specialist", earned: mc3Tunes.length >= 2 },
    { label: "Universal Tuner", earned: data.tunes.some((tune) => tune.sheetId === "universal-template") },
    { label: "Community Contributor", earned: publicTunes.length > 0 || Boolean(data.comments?.length) },
    { label: "Most Cloned Tune", earned: data.tunes.some((tune) => (tune.cloneCount ?? 0) >= 20) }
  ];
}

function Onboarding({ onSkip, onAddCar, onCreateTune }: { onSkip: () => void; onAddCar: () => void; onCreateTune: () => void }) {
  const [step, setStep] = useState(0);
  const [chassis, setChassis] = useState("RDX");
  const [goal, setGoal] = useState(onboardingGoals[0]);
  const steps = [
    {
      eyebrow: "Welcome",
      title: "Welcome to your setup hub",
      body: "Save setups, track changes, and share tunes without fighting a tiny PDF on your phone."
    },
    {
      eyebrow: "Garage",
      title: "Create your first car",
      body: "Start simple. A car name and chassis are enough. You can fill in electronics later."
    },
    {
      eyebrow: "Chassis",
      title: "Choose chassis",
      body: "RDX and MC-3 can use official PDF templates. Other cars use the universal setup sheet."
    },
    {
      eyebrow: "Goal",
      title: "What do you want to do first?",
      body: "Pick the reason you opened the app today. You can do all of these later."
    },
    {
      eyebrow: "First tune",
      title: "Create your first tune",
      body: "Make a baseline for your next track day. Skip anything you are not sure about."
    }
  ];
  const current = steps[step];
  return (
    <div className="onboardingShade" role="dialog" aria-modal="true" aria-label="Welcome to RC Drift Sync">
      <section className="onboardingPanel">
        <div className="onboardingTop">
          <span>{step + 1} of {steps.length}</span>
          <button className="smallPill" type="button" onClick={onSkip}>Skip</button>
        </div>
        <p>{current.eyebrow}</p>
        <h2>{current.title}</h2>
        <span>{current.body}</span>
        {step === 2 ? (
          <div className="onboardingChoices">
            {["RDX", "MC-3", "Other"].map((item) => (
              <button key={item} className={chassis === item ? "selected" : ""} type="button" onClick={() => setChassis(item)}>{item}</button>
            ))}
          </div>
        ) : null}
        {step === 3 ? (
          <div className="onboardingChoices">
            {onboardingGoals.map((item) => (
              <button key={item} className={goal === item ? "selected" : ""} type="button" onClick={() => setGoal(item)}>{item}</button>
            ))}
          </div>
        ) : null}
        <div className="progressTrack" aria-label="Onboarding progress">
          <i style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="buttonRow">
          {step > 0 ? <button className="smallPill" type="button" onClick={() => setStep(step - 1)}>Back</button> : null}
          {step < steps.length - 1 ? (
            <button className="primaryAction" type="button" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <>
              <button className="smallPill" type="button" onClick={onAddCar}>Add first car</button>
              <button className="primaryAction" type="button" onClick={onCreateTune}>Create first tune</button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function HomePage({
  data,
  activeTune,
  onAddCar,
  onAddTune,
  onLogSession,
  onSelectTune
}: {
  data: AppData;
  activeTune: Tune | null;
  onAddCar: () => void;
  onAddTune: () => void;
  onLogSession: () => void;
  onSelectTune: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [shareInputOpen, setShareInputOpen] = useState(false);
  const [shareInput, setShareInput] = useState("");
  const sessions = data.trackSessions ?? [];
  const lastForTune = activeTune ? sessions.find((session) => session.tuneId === activeTune.id) : sessions[0];
  const days = daysSince(lastForTune?.date);
  const clonedTune = data.tunes.find((tune) => (tune.cloneCount ?? 0) > 0);
  const likedTune = data.tunes.find((tune) => (tune.likeCount ?? 0) > 0);
  const trending = [...data.tunes].sort((a, b) => ((b.viewCount ?? 0) + (b.likeCount ?? 0) + (b.cloneCount ?? 0)) - ((a.viewCount ?? 0) + (a.likeCount ?? 0) + (a.cloneCount ?? 0)))[0];
  const searchText = search.toLowerCase().trim();
  const searchMatches = searchText
    ? [
        ...data.cars.filter((car) => `${car.name} ${car.chassis} ${car.chassisModel ?? ""} ${car.homeTrack ?? ""}`.toLowerCase().includes(searchText)).map((car) => ({ id: car.id, label: car.name, detail: car.chassis, action: () => navigate("/garage") })),
        ...data.tunes.filter((tune) => `${tune.name} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${Object.values(tune.values).join(" ")}`.toLowerCase().includes(searchText)).map((tune) => ({ id: tune.id, label: tuneDisplayName(tune), detail: tune.track || "Tune", action: () => onSelectTune(tune.id) })),
        ...sessions.filter((session) => `${session.track} ${session.surface} ${session.quickSignals.join(" ")} ${session.symptoms.join(" ")}`.toLowerCase().includes(searchText)).map((session) => ({ id: session.id, label: session.track || "Track session", detail: session.date, action: () => navigate("/sessions") }))
      ].slice(0, 6)
    : [];
  return (
    <main className="appPage">
      <header className="homeBrandHeader" aria-label={APP_NAME}>
        <img src="/brand/rc-drift-sync-logo-transparent.png" alt={APP_NAME} />
        <button className="iconButton" type="button" onClick={() => navigate("/settings")} aria-label="Settings">
          <Settings size={20} />
        </button>
      </header>

      <section className="heroPanel">
        <p>Last tune</p>
        <h2>{activeTune ? tuneDisplayName(activeTune) : "No tune yet"}</h2>
        <span>{activeTune ? `${activeTune.track || "No track yet"} · ${activeTune.grip}` : "Add a car and create your first tune"}</span>
        <button className="primaryAction fullWidth" type="button" onClick={() => (activeTune ? onSelectTune(activeTune.id) : onAddCar())}>
          <Wrench size={19} />
          {activeTune ? "Continue last tune" : "Add first car"}
        </button>
        <button className="smallPill fullWidth" type="button" onClick={onLogSession}>
          <CalendarPlus size={18} />
          Log today&apos;s track session
        </button>
      </section>

      <section className="engagementStrip" aria-label="Track engagement">
        <AppCard>
          <Clock3 size={22} />
          <strong>{days === null ? "No sessions logged yet" : `Last tune used ${days === 0 ? "today" : `${days} days ago`}`}</strong>
          <span>{lastForTune?.track ?? "Tap session log after your next battery."}</span>
        </AppCard>
        <AppCard>
          <Trophy size={22} />
          <strong>Trending tunes this week</strong>
          <span>{trending ? trending.name : "Public tunes will appear here."}</span>
        </AppCard>
        <AppCard>
          <CopyPlus size={22} />
          <strong>{clonedTune ? "Someone cloned your tune" : "First clone waiting"}</strong>
          <span>{clonedTune ? `${tuneDisplayName(clonedTune)} has ${clonedTune.cloneCount} clones` : "Share a tune when ready."}</span>
        </AppCard>
        <AppCard>
          <BadgeCheck size={22} />
          <strong>{likedTune ? "Someone liked your tune" : "Likes will show here"}</strong>
          <span>{likedTune ? `${tuneDisplayName(likedTune)} has ${likedTune.likeCount} likes` : "Optional community feedback."}</span>
        </AppCard>
      </section>

      <section className="globalSearch" aria-label="Search RC Drift Sync">
        <label>
          <Search size={18} />
          <input value={search} placeholder="Search cars, tunes, tracks..." onChange={(event) => setSearch(event.target.value)} />
        </label>
        {searchText ? (
          <div className="searchResults">
            {searchMatches.length ? searchMatches.map((item) => (
              <button key={item.id} type="button" onClick={item.action}>
                <strong>{item.label}</strong>
                <span>{item.detail}</span>
              </button>
            )) : <span>No matches yet. Try chassis, track, tire, or tune name.</span>}
          </div>
        ) : null}
      </section>

      <section className="quickGrid" aria-label="Quick actions">
        <AppCard onClick={onAddTune}>
          <Plus size={24} />
          <strong>Create new tune</strong>
          <span>Start from your active car</span>
        </AppCard>
        <AppCard onClick={onAddCar}>
          <CarFront size={24} />
          <strong>Add car</strong>
          <span>Build your garage</span>
        </AppCard>
        <AppCard onClick={() => {
          setShareInput("");
          setShareInputOpen(true);
        }}>
          <QrCode size={24} />
          <strong>Scan tune QR</strong>
          <span>Open a shared tune link</span>
        </AppCard>
        <AppCard onClick={() => navigate("/community")}>
          <UsersRound size={24} />
          <strong>Browse community tunes</strong>
          <span>See public setups</span>
        </AppCard>
      </section>

      {shareInputOpen ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="share-link-title">
            <h2 id="share-link-title">Open shared tune</h2>
            <p>Paste a RC Drift Sync share link or tune share ID.</p>
            <TextField label="Share link or ID" value={shareInput} placeholder="https://rcdriftsync.com/t/..." onChange={(event) => setShareInput(event.target.value)} />
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setShareInputOpen(false)}>Cancel</button>
              <button
                className="primaryAction"
                type="button"
                onClick={() => {
                  const id = shareInput.split("/t/").pop()?.trim() || shareInput.trim();
                  if (!id) return;
                  setShareInputOpen(false);
                  navigate(`/t/${id}`);
                }}
              >
                Open tune
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <DashboardSection title="Recent cars">
        {data.cars.length ? data.cars.slice(0, 3).map((car) => <CarMiniCard key={car.id} car={car} />) : <EmptyState title="Garage" body="Add your first RC drift car to start saving tunes." action={<button className="primaryAction" type="button" onClick={onAddCar}>Add first car</button>} />}
      </DashboardSection>

      <DashboardSection title="Recent tunes">
        {data.tunes.length ? (
          data.tunes.slice(0, 3).map((tune) => <TuneMiniCard key={tune.id} tune={tune} onClick={() => onSelectTune(tune.id)} />)
        ) : (
          <EmptyState title="Tunes" body="No tunes yet. Create a baseline setup for your next track day." action={<button className="primaryAction" type="button" onClick={onAddTune}>Create baseline tune</button>} />
        )}
      </DashboardSection>

      <section className="placeholderGrid">
        <AppCard>
          <Trophy size={22} />
          <strong>Popular tunes</strong>
          <span>Community rankings will appear here.</span>
        </AppCard>
        <AppCard>
          <Clock3 size={22} />
          <strong>Track session reminder</strong>
          <span>{sessions.length ? `${sessions.length} sessions logged` : "Log a basic session in under 30 seconds."}</span>
        </AppCard>
      </section>
    </main>
  );
}

function TrackSessionsPage({ data, activeTune, onSaveSession }: { data: AppData; activeTune: Tune | null; onSaveSession: (session: TrackSession) => void }) {
  const defaultTune = activeTune ?? data.tunes[0];
  const defaultCar = data.cars.find((car) => car.id === defaultTune?.carId) ?? data.cars[0];
  const [tuneId, setTuneId] = useState(defaultTune?.id ?? "");
  const [carId, setCarId] = useState(defaultCar?.id ?? "");
  const currentTune = data.tunes.find((tune) => tune.id === tuneId);
  const currentCar = data.cars.find((car) => car.id === carId);
  const [track, setTrack] = useState(currentTune?.track || currentCar?.homeTrack || "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [surface, setSurface] = useState(currentTune?.surface || "Not sure");
  const [grip, setGrip] = useState(currentTune?.grip || "Not sure");
  const [tire, setTire] = useState(String(currentTune?.values.tires || currentCar?.defaultTire || ""));
  const [battery, setBattery] = useState(currentCar?.battery || "");
  const [ratingBefore, setRatingBefore] = useState(currentTune?.rating || 3);
  const [ratingAfter, setRatingAfter] = useState(currentTune?.rating || 3);
  const [whatChanged, setWhatChanged] = useState("");
  const [howFelt, setHowFelt] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [quickSignals, setQuickSignals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<TunePhoto[]>([]);
  const [saved, setSaved] = useState("");
  const sessions = data.trackSessions ?? [];

  function chooseTune(id: string) {
    const tune = data.tunes.find((item) => item.id === id);
    const car = data.cars.find((item) => item.id === tune?.carId);
    setTuneId(id);
    if (car) setCarId(car.id);
    if (tune?.track) setTrack(tune.track);
    if (tune?.surface) setSurface(tune.surface);
    if (tune?.grip) setGrip(tune.grip);
    if (tune?.rating) {
      setRatingBefore(tune.rating);
      setRatingAfter(tune.rating);
    }
    if (tune?.values.tires) setTire(String(tune.values.tires));
  }

  function toggleListValue(value: string, list: string[], setList: (items: string[]) => void) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  async function attachPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const nextPhotos = await Promise.all(files.map((file, index) => new Promise<TunePhoto>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: `session-photo-${Date.now()}-${index}`,
        label: file.name.replace(/\.[^.]+$/, "") || "Session photo",
        dataUrl: String(reader.result),
        createdAt: new Date().toISOString()
      });
      reader.readAsDataURL(file);
    })));
    setPhotos((items) => [...items, ...nextPhotos]);
  }

  function saveSession() {
    const now = new Date().toISOString();
    const session: TrackSession = {
      id: `session-${Date.now()}`,
      ownerId: "local-user",
      tuneId,
      carId,
      track,
      date,
      surface,
      grip,
      tire,
      battery,
      ratingBefore,
      ratingAfter,
      whatChanged,
      howFelt,
      symptoms,
      quickSignals,
      notes,
      photos,
      createdAt: now,
      updatedAt: now
    };
    onSaveSession(session);
    setSaved("Track session saved.");
    setWhatChanged("");
    setHowFelt("");
    setNotes("");
    setPhotos([]);
  }

  if (!data.tunes.length || !data.cars.length) {
    return (
      <main className="appPage">
        <PageHeader eyebrow="Track Sessions" title="Log a session" />
        <EmptyState title="Create a tune first" body="Session logs connect to a car and tune so your track notes stay useful." />
      </main>
    );
  }

  return (
    <main className="appPage">
      <PageHeader eyebrow="Track Sessions" title="Log a track day" />
      <section className="heroPanel">
        <p>30 second log</p>
        <h2>Capture what changed before you forget</h2>
        <span>Pick a tune, tap a few feel buttons, and save the session after a battery or track day.</span>
      </section>
      <button className="smallPill" type="button" onClick={() => navigate("/home")}>Back to home</button>

      <section className="sessionForm appCard">
        <div className="formSplit">
          <SelectField label="Tune used" value={tuneId} onChange={(event) => chooseTune(event.target.value)}>
            {data.tunes.map((tune) => <option key={tune.id} value={tune.id}>{tuneDisplayName(tune)}</option>)}
          </SelectField>
          <SelectField label="Car used" value={carId} onChange={(event) => setCarId(event.target.value)}>
            {data.cars.map((car) => <option key={car.id} value={car.id}>{car.name}</option>)}
          </SelectField>
        </div>
        <TextField label="Track / location" value={track} placeholder="Local drift track" onChange={(event) => setTrack(event.target.value)} />
        <div className="formSplit">
          <TextField label="Date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          <SelectField label="Grip level" value={grip} onChange={(event) => setGrip(event.target.value)}>
            {["Not sure", "Low", "Low to medium", "Medium", "High", "Very high"].map((item) => <option key={item}>{item}</option>)}
          </SelectField>
        </div>
        <div className="formSplit">
          <SelectField label="Surface" value={surface} onChange={(event) => setSurface(event.target.value)}>
            {["Not sure", "Plastic tile", "Carpet", "Asphalt", "Colored concrete", "Concrete", "Other"].map((item) => <option key={item}>{item}</option>)}
          </SelectField>
          <TextField label="Tire" value={tire} placeholder="DS LF-5" onChange={(event) => setTire(event.target.value)} />
        </div>
        <TextField label="Battery" value={battery} placeholder="Shorty pack, 2S..." onChange={(event) => setBattery(event.target.value)} />
        <div className="formSplit">
          <SelectField label="Rating before" value={String(ratingBefore)} onChange={(event) => setRatingBefore(Number(event.target.value))}>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
          </SelectField>
          <SelectField label="Rating after" value={String(ratingAfter)} onChange={(event) => setRatingAfter(Number(event.target.value))}>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
          </SelectField>
        </div>

        <div>
          <span className="sessionLabel">Quick feel buttons</span>
          <div className="sessionChipGrid">
            {quickSessionButtons.map((item) => (
              <button key={item} className={quickSignals.includes(item) ? "selected" : ""} type="button" onClick={() => toggleListValue(item, quickSignals, setQuickSignals)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="sessionLabel">Symptoms</span>
          <div className="sessionChipGrid">
            {sessionSymptoms.map((item) => (
              <button key={item} className={symptoms.includes(item) ? "selected" : ""} type="button" onClick={() => toggleListValue(item, symptoms, setSymptoms)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <TextAreaField label="What changed" value={whatChanged} placeholder="Changed tire, gyro, spring, diff, ESC curve..." onChange={(event) => setWhatChanged(event.target.value)} />
        <TextAreaField label="How the car felt" value={howFelt} placeholder="Felt better on exits, pushed on entry..." onChange={(event) => setHowFelt(event.target.value)} />
        <TextAreaField label="Notes" value={notes} placeholder="Anything to remember next track day" onChange={(event) => setNotes(event.target.value)} />

        <label className="photoUploader compactUploader">
          <CalendarPlus size={24} />
          <span>Add session photos</span>
          <small>Car, tires, track, or setup change</small>
          <input type="file" accept="image/*" multiple onChange={attachPhotos} />
        </label>
        {photos.length ? <div className="sessionPhotoPreview">{photos.map((photo) => <img key={photo.id} src={photo.dataUrl} alt={photo.label} />)}</div> : null}
        {saved ? <p className="sessionSaved">{saved}</p> : null}
        <button className="primaryAction fullWidth" type="button" onClick={saveSession}>
          <CalendarPlus size={18} />
          Save session log
        </button>
      </section>

      <DashboardSection title="Recent sessions">
        {sessions.length ? sessions.slice(0, 5).map((session) => (
          <AppCard key={session.id}>
            <strong>{session.track || "Track session"}</strong>
            <span>{session.date} · {session.surface} · {session.grip}</span>
            <em>{session.quickSignals.slice(0, 3).join(" / ") || session.howFelt || "No feel notes yet"}</em>
          </AppCard>
        )) : <EmptyState title="No sessions yet" body="Log today's track session after your next run." />}
      </DashboardSection>
    </main>
  );
}

function GaragePage({
  data,
  account,
  activeTuneId,
  view,
  startAdding,
  onAddCar,
  onSaveCar,
  onDeleteCar,
  onAddTune,
  onSelectTune,
  onDuplicateTune,
  onDeleteTune,
  onCompare
}: {
  data: AppData;
  account: UserAccount | null;
  activeTuneId?: string;
  view: "garage" | "cars" | "tunes";
  startAdding?: number;
  onAddCar: () => void;
  onSaveCar: (car: Car) => void;
  onDeleteCar: (carId: string) => void;
  onAddTune: (carId: string) => void;
  onSelectTune: (id: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onDeleteTune: (tuneId: string) => void;
  onCompare: () => void;
}) {
  const showCars = view !== "tunes";
  const showTunes = view !== "cars";

  return (
    <main className="appPage">
      <PageHeader eyebrow={APP_NAME} title={view === "cars" ? "Cars" : view === "tunes" ? "Tunes" : "Garage"}>
        <button className="iconButton highContrast" type="button" onClick={onAddCar} aria-label="Add car">
          <Plus size={21} />
        </button>
      </PageHeader>

      <div className="segmentedNav" aria-label="Garage views">
        <button className={view === "garage" ? "active" : ""} type="button" onClick={() => navigate("/garage")}>Garage</button>
        <button className={view === "cars" ? "active" : ""} type="button" onClick={() => navigate("/cars")}>Cars</button>
        <button className={view === "tunes" ? "active" : ""} type="button" onClick={() => navigate("/tunes")}>Tunes</button>
      </div>

      <button className="compareButton" type="button" onClick={onCompare}>
        <CopyPlus size={19} />
        Compare tunes
      </button>

      {showCars ? (
        <GarageManager
          cars={data.cars}
          tunes={data.tunes}
          activeTuneId={activeTuneId}
          startAdding={startAdding}
          onSaveCar={onSaveCar}
          onDeleteCar={onDeleteCar}
          onCreateTune={onAddTune}
          onDuplicateTune={onDuplicateTune}
          onSelectTune={onSelectTune}
        />
      ) : null}

      {showTunes ? (
        view === "tunes" ? (
          <MyTunesManager
            data={data}
            account={account}
            activeTuneId={activeTuneId}
            onSelectTune={onSelectTune}
            onDuplicateTune={onDuplicateTune}
            onDeleteTune={onDeleteTune}
            onAddTune={() => (data.cars[0] ? onAddTune(data.cars[0].id) : onAddCar())}
          />
        ) : (
          <DashboardSection title="Saved tunes">
            {data.tunes.map((tune) => (
              <TuneMiniCard key={tune.id} tune={tune} active={activeTuneId === tune.id} onClick={() => onSelectTune(tune.id)} />
            ))}
          </DashboardSection>
        )
      ) : null}
    </main>
  );
}

function MyTunesManager({
  data,
  account,
  activeTuneId,
  onSelectTune,
  onDuplicateTune,
  onDeleteTune,
  onAddTune
}: {
  data: AppData;
  account: UserAccount | null;
  activeTuneId?: string;
  onSelectTune: (id: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onDeleteTune: (tuneId: string) => void;
  onAddTune: () => void;
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("updated");
  const [deleteTarget, setDeleteTarget] = useState<Tune | null>(null);
  const ownedTunes = data.tunes.filter((tune) => canManageTune(account, tune));
  const filteredTunes = ownedTunes
    .filter((tune) => `${tune.name} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${tune.values.tires ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "chassis") {
        const carA = data.cars.find((car) => car.id === a.carId)?.chassis ?? "";
        const carB = data.cars.find((car) => car.id === b.carId)?.chassis ?? "";
        return carA.localeCompare(carB);
      }
      if (sort === "surface") return a.surface.localeCompare(b.surface);
      if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <DashboardSection title="My Tunes">
      {!account && isFirebaseConfigured ? (
        <AppCard>
          <div className="cardRow">
            <UsersRound size={23} />
            <div>
              <strong>Sign in to back up My Tunes</strong>
              <span>Local tunes still work on this phone. Log in to save them to your RC Drift Sync account.</span>
            </div>
            <button className="smallPill" type="button" onClick={() => navigate("/login")}>Log in</button>
          </div>
        </AppCard>
      ) : null}
      <section className="myTunesToolbar">
        <label className="searchBox compactSearch">
          <Search size={18} />
          <input value={search} placeholder="Search my tunes" onChange={(event) => setSearch(event.target.value)} />
        </label>
        <SelectField label="Sort" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="updated">Recently updated</option>
          <option value="newest">Newest</option>
          <option value="name">Name</option>
          <option value="chassis">Chassis</option>
          <option value="surface">Surface</option>
        </SelectField>
      </section>

      {filteredTunes.length ? (
        <div className="myTunesList">
          {filteredTunes.map((tune) => {
            const car = data.cars.find((item) => item.id === tune.carId);
            return (
              <article key={tune.id} className={`myTuneCard ${activeTuneId === tune.id ? "active" : ""}`}>
                <button className="myTuneMain" type="button" onClick={() => onSelectTune(tune.id)}>
                  <strong>{tuneDisplayName(tune)}</strong>
                  <span>{car?.chassis || "Universal setup"} · {tune.surface || "Surface not set"} · {tune.track || "Track not set"}</span>
                  <em>{tune.tags.slice(0, 4).join(" / ") || "No tags yet"}</em>
                </button>
                <div className="myTuneActions">
                  <button type="button" onClick={() => onSelectTune(tune.id)}>
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button type="button" onClick={() => onDuplicateTune(tune)}>
                    <CopyPlus size={16} />
                    Duplicate
                  </button>
                  <button className="dangerAction" type="button" onClick={() => setDeleteTarget(tune)}>
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="You have not saved any tunes yet."
          body="Create a baseline setup for your next track day."
          action={<button className="primaryAction" type="button" onClick={onAddTune}>Create first tune</button>}
        />
      )}

      {deleteTarget ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="delete-tune-title">
            <h2 id="delete-tune-title">Delete tune?</h2>
            <p>This removes “{deleteTarget.name}” from your saved tunes. This cannot be undone.</p>
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button
                className="primaryAction destructive"
                type="button"
                onClick={() => {
                  const id = deleteTarget.id;
                  setDeleteTarget(null);
                  onDeleteTune(id);
                }}
              >
                <Trash2 size={17} />
                Delete tune
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </DashboardSection>
  );
}

function BuilderPage({
  data,
  tune,
  dirty,
  onSave,
  onUpdateTune,
  onCreateBuilderTune,
  onDeleteTune,
  onSaveElectronicsProfile,
  onDuplicate,
  onSelectTune,
  onAddTune,
  refEl
}: {
  data: AppData;
  tune: Tune | null;
  dirty: boolean;
  onSave: () => void;
  onUpdateTune: (tune: Tune) => void;
  onCreateBuilderTune: (options: { carId: string; setupMode: SetupMode; startingPoint: StartingPoint; sourceTuneId?: string }) => void;
  onDeleteTune: (tuneId: string) => void;
  onSaveElectronicsProfile: (profile: ElectronicsProfile) => void;
  onDuplicate: (source?: Tune) => void;
  onSelectTune: (id: string) => void;
  onAddTune: () => void;
  refEl: RefObject<HTMLDivElement | null>;
}) {
  return (
    <main className="builderPage">
      <PageHeader eyebrow="Tune Builder" title="Build a setup">
        <button className="iconButton highContrast" type="button" onClick={onAddTune} aria-label="New tune">
          <Plus size={21} />
        </button>
      </PageHeader>

      <div className="tunePicker" aria-label="Select tune">
        {data.tunes.slice(0, 8).map((item) => (
          <button key={item.id} className={item.id === tune?.id ? "active" : ""} type="button" onClick={() => onSelectTune(item.id)}>
            {tuneDisplayName(item)}
          </button>
        ))}
      </div>

      <div ref={refEl}>
        <UniversalTuneBuilder
          cars={data.cars}
          tunes={data.tunes}
          activeTune={tune}
          electronicsProfiles={data.electronicsProfiles ?? []}
          onCreateTune={onCreateBuilderTune}
          onUpdateTune={onUpdateTune}
          onSaveTune={onSave}
          onSaveElectronicsProfile={onSaveElectronicsProfile}
          onDeleteTune={onDeleteTune}
          onDuplicateTune={onDuplicate}
          onSelectTune={onSelectTune}
          dirty={dirty}
        />
      </div>
    </main>
  );
}

function CommunityPage({
  data,
  onClone,
  onLike,
  onFavorite,
  onComment,
  onFollow
}: {
  data: AppData;
  onClone: (tune: Tune) => void;
  onLike: (tuneId: string) => void;
  onFavorite: (tuneId: string) => void;
  onComment: (tuneId: string, body: string) => void;
  onFollow: (username: string) => void;
}) {
  const tracks = Array.from(new Set(data.tunes.filter((tune) => tune.visibility === "public" && tune.track).map((tune) => tune.track))).slice(0, 5);
  return (
    <main className="appPage">
      <PageHeader eyebrow={APP_NAME} title="Community" />
      <section className="heroPanel communityHero">
        <p>Find what works</p>
        <h2>Setups from other RC drift drivers</h2>
        <span>Browse public tunes, clone a setup, follow drivers, and keep notes simple.</span>
      </section>
      <DashboardSection title="Track pages">
        {tracks.length ? (
          <div className="trackChipGrid">
            {tracks.map((track) => (
              <button key={track} className="smallPill" type="button" onClick={() => navigate(`/track/${encodeURIComponent(track.toLowerCase().replace(/\s+/g, "-"))}`)}>
                {track}
              </button>
            ))}
          </div>
        ) : <EmptyState title="No track pages yet" body="Track pages appear once drivers share tunes with track names." />}
      </DashboardSection>
      <LibraryPage data={data} compact onClone={onClone} onLike={onLike} onFavorite={onFavorite} onComment={onComment} onFollow={onFollow} />
    </main>
  );
}

function MyProfilePage({ data, onSettings }: { data: AppData; onSettings: () => void }) {
  const profile = data.profiles?.[0];
  const badges = badgeList(data);
  return (
    <main className="appPage">
      <PageHeader eyebrow="Driver profile" title={profile?.displayName ?? "My profile"}>
        <button className="iconButton" type="button" onClick={onSettings} aria-label="Settings">
          <Settings size={20} />
        </button>
      </PageHeader>
      <section className="profileSummary">
        <div className="avatar">RC</div>
        <div>
          <strong>@{profile?.username ?? "local-driver"}</strong>
          <span>{data.tunes.filter((tune) => tune.visibility === "public").length} public tunes · {profile?.cloneCount ?? 0} clones</span>
        </div>
      </section>
      {data.tunes.some((tune) => tune.visibility === "public" || tune.visibility === "unlisted") ? null : (
        <EmptyState title="Driver profile" body="Share a tune to start building your driver profile." action={<button className="primaryAction" type="button" onClick={() => navigate("/builder")}>Share a tune</button>} />
      )}
      <DashboardSection title="Profile setup">
        <TextField label="Display name" value={profile?.displayName ?? "Local Driver"} readOnly />
        <TextField label="Public URL" value={`rcdriftsync.com/u/${profile?.username ?? "your-username"}`} readOnly />
      </DashboardSection>
      <DashboardSection title="Badges">
        <div className="badgeGrid">
          {badges.map((badge) => (
            <section key={badge.label} className={`badgeCard ${badge.earned ? "earned" : ""}`}>
              <BadgeCheck size={20} />
              <strong>{badge.label}</strong>
              <span>{badge.earned ? "Earned" : "Locked"}</span>
            </section>
          ))}
        </div>
      </DashboardSection>
    </main>
  );
}

function SettingsPage({
  theme,
  account,
  syncStatus,
  notificationSettings,
  onTheme,
  onReset,
  onLogout,
  onNotifications
}: {
  theme: ThemeMode;
  account: UserAccount | null;
  syncStatus: string;
  notificationSettings?: NotificationSettings;
  onTheme: () => void;
  onReset: () => void;
  onLogout: () => void;
  onNotifications: (settings: NotificationSettings) => void;
}) {
  const settings = { ...notificationDefaults, ...(notificationSettings ?? {}) };
  const updateSetting = (key: keyof NotificationSettings) => (event: ChangeEvent<HTMLInputElement>) => onNotifications({ ...settings, [key]: event.target.checked });
  return (
    <main className="appPage">
      <PageHeader eyebrow={APP_NAME} title="Settings" />
      <DashboardSection title="Account and sync">
        <AppCard>
          <div className="cardRow">
            <UsersRound size={23} />
            <div>
              <strong>{account ? account.displayName || account.email : "Not signed in"}</strong>
              <span>{syncStatus}</span>
            </div>
            {account ? <button className="smallPill" type="button" onClick={onLogout}>Log out</button> : <button className="smallPill" type="button" onClick={() => navigate("/login")}>Log in</button>}
          </div>
        </AppCard>
      </DashboardSection>
      <DashboardSection title="Appearance">
        <AppCard>
          <div className="cardRow">
            {theme === "dark" ? <Moon size={23} /> : <Sun size={23} />}
            <div>
              <strong>{theme === "dark" ? "Dark mode" : "Light mode"}</strong>
              <span>Switch the trackside theme.</span>
            </div>
            <button className="smallPill" type="button" onClick={onTheme}>Toggle</button>
          </div>
        </AppCard>
      </DashboardSection>
      <DashboardSection title="Install app">
        <AppCard>
          <strong>Add RC Drift Sync to your phone</strong>
          <span>iPhone: open rcdriftsync.com in Safari, tap Share, then Add to Home Screen. Android: open in Chrome and tap Install app or Add to Home screen.</span>
        </AppCard>
      </DashboardSection>
      <DashboardSection title="Notifications">
        <AppCard>
          <div className="cardRow">
            <Bell size={23} />
            <div>
              <strong>Optional trackside updates</strong>
              <span>Everything is off unless you choose it. No spam, just useful drift reminders.</span>
            </div>
          </div>
        </AppCard>
        <div className="notificationList">
          <NotificationToggle label="Tune cloned" checked={settings.tuneCloned} onChange={updateSetting("tuneCloned")} />
          <NotificationToggle label="Tune liked" checked={settings.tuneLiked} onChange={updateSetting("tuneLiked")} />
          <NotificationToggle label="Tune commented" checked={settings.tuneCommented} onChange={updateSetting("tuneCommented")} />
          <NotificationToggle label="Followed driver shared a tune" checked={settings.followedDriverSharedTune} onChange={updateSetting("followedDriverSharedTune")} />
          <NotificationToggle label="Weekly trending tunes" checked={settings.weeklyTrendingTunes} onChange={updateSetting("weeklyTrendingTunes")} />
          <NotificationToggle label="Backup reminder" checked={settings.backupReminder} onChange={updateSetting("backupReminder")} />
        </div>
      </DashboardSection>
      <DashboardSection title="Backup reminder">
        <AppCard>
          <strong>Keep your tunes backed up</strong>
          <span>Sign in when you are ready to sync your garage. Local mode still works offline on this phone.</span>
          <button className="smallPill" type="button" onClick={() => navigate("/login")}>Account backup</button>
        </AppCard>
      </DashboardSection>
      <DashboardSection title="Start fresh">
        <button className="primaryAction fullWidth" type="button" onClick={onReset}>
          <RefreshCcw size={19} />
          Clear local garage
        </button>
      </DashboardSection>
    </main>
  );
}

function NotificationToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <label className="notificationToggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} />
    </label>
  );
}

function AccountPage({
  mode,
  account,
  syncStatus,
  migrationPrompt,
  onLogin,
  onGoogleLogin,
  onSignup,
  onLogout,
  onResetPassword,
  onSaveProfile,
  onImportLocal
}: {
  mode: "login" | "signup";
  account: UserAccount | null;
  syncStatus: string;
  migrationPrompt: boolean;
  onLogin: (credentials: { email: string; password: string }) => Promise<unknown>;
  onGoogleLogin: () => Promise<unknown>;
  onSignup: (credentials: { email: string; password: string; displayName?: string; username?: string }) => Promise<unknown>;
  onLogout: () => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onSaveProfile: (patch: { displayName?: string; username?: string; photoURL?: string }) => Promise<void>;
  onImportLocal: () => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(account?.displayName ?? "");
  const [username, setUsername] = useState(account?.username ?? "");
  const [message, setMessage] = useState(syncStatus);

  async function submit() {
    try {
      setMessage(mode === "login" ? "Logging in..." : "Creating account...");
      if (mode === "login") {
        await onLogin({ email, password });
      } else {
        await onSignup({ email, password, displayName, username });
      }
      setMessage("Signed in. Firebase sync is ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Firebase sign-in failed.");
    }
  }

  async function googleLogin() {
    try {
      setMessage("Opening Google sign-in...");
      await onGoogleLogin();
      setMessage("Signed in with Google. Firebase sync is ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google sign-in failed.");
    }
  }

  async function resetPassword() {
    try {
      await onResetPassword(email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send reset email.");
    }
  }

  async function saveProfileClick() {
    try {
      await onSaveProfile({ displayName, username });
      setMessage("Profile saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    }
  }

  return (
    <main className="appPage">
      <PageHeader eyebrow={APP_NAME} title={mode === "login" ? "Login" : "Create account"} />
      {!isFirebaseConfigured ? (
        <EmptyState title="Firebase not configured yet" body="Add your Firebase Web App values to .env.local, then restart the dev server. The app will keep working locally until then." />
      ) : null}
      {account ? (
        <DashboardSection title="Signed in">
          <AppCard>
            <div className="cardRow">
              <UsersRound size={23} />
              <div>
                <strong>{account.displayName || account.email}</strong>
                <span>{message}</span>
              </div>
              <button className="smallPill" type="button" onClick={onLogout}>Log out</button>
            </div>
          </AppCard>
          {migrationPrompt ? (
            <button className="primaryAction fullWidth" type="button" onClick={onImportLocal}>
              Import local garage and tunes to Firebase
            </button>
          ) : null}
        </DashboardSection>
      ) : (
        <DashboardSection title={mode === "login" ? "Firebase login" : "Firebase sign up"}>
          <TextField label="Email" placeholder="driver@example.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField label="Password" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {mode === "signup" ? (
            <>
              <TextField label="Display name" placeholder="Chuck" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
              <TextField label="Username" placeholder="chuck-drift" value={username} onChange={(event) => setUsername(event.target.value)} />
            </>
          ) : null}
          <button className="primaryAction fullWidth" type="button" onClick={submit} disabled={!isFirebaseConfigured}>
            {mode === "login" ? "Log in" : "Create account"}
          </button>
          <button className="smallPill fullWidth" type="button" onClick={googleLogin} disabled={!isFirebaseConfigured}>
            Continue with Google
          </button>
          {mode === "login" ? <button className="smallPill" type="button" onClick={resetPassword} disabled={!email || !isFirebaseConfigured}>Send password reset</button> : null}
          <p className="authMessage">{message}</p>
        </DashboardSection>
      )}
      {account ? (
        <DashboardSection title="Public profile">
          <TextField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
          <TextField label="Username" value={username} onChange={(event) => setUsername(event.target.value)} />
          <button className="primaryAction fullWidth" type="button" onClick={saveProfileClick}>Save profile</button>
        </DashboardSection>
      ) : null}
      {isFirebaseConfigured ? null : (
        <DashboardSection title="Sync setup">
          <AppCard>
            <strong>Sync is not connected on this device</strong>
            <span>You can still save tunes offline. Connect Firebase later to back up and share from your account.</span>
          </AppCard>
        </DashboardSection>
      )}
    </main>
  );
}

function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dashboardSection">
      <h2>{title}</h2>
      <div className="sectionStack">{children}</div>
    </section>
  );
}

function CarMiniCard({ car }: { car: Car }) {
  return (
    <AppCard>
      <div className="cardRow">
        <CarFront size={23} />
        <div>
          <strong>{car.name}</strong>
          <span>{car.chassis}</span>
        </div>
      </div>
    </AppCard>
  );
}

function TuneMiniCard({ tune, active, onClick }: { tune: Tune; active?: boolean; onClick: () => void }) {
  return (
    <div className={active ? "activeCard" : ""}>
      <TuneCard tune={tune} onView={onClick} />
    </div>
  );
}
