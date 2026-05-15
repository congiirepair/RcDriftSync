import {
  CarFront,
  CalendarPlus,
  Bell,
  BadgeCheck,
  BookOpenText,
  Clock3,
  CopyPlus,
  Download,
  Edit3,
  FileText,
  LockKeyhole,
  MapPin,
  MoreHorizontal,
  Search,
  Smartphone,
  Moon,
  Plus,
  QrCode,
  RefreshCcw,
  Settings,
  SlidersHorizontal,
  Sun,
  Trash2,
  Trophy,
  UsersRound,
  Wrench
} from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, ReactNode, RefObject } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AppShell } from "./components/AppShell";
import { BrandBadge } from "./components/BrandIdentity";
import { PhotoLightbox } from "./components/PhotoLightbox";
import { ProfilePage } from "./components/ProfilePage";
import { BasicTuneSummary, TuneCard, TuneTimeline } from "./components/TuneVisuals";
import { AppCard, EmptyState, LoadingState, PageHeader, SelectField, TextAreaField, TextField } from "./components/UiPrimitives";
import { AppRestoreScreen } from "./app/AppRestoreScreen";
import {
  FIREBASE_SAVE_TIMEOUT_MS,
  canManageTune,
  carTemplatePatch,
  cloneableTuneSource,
  createTune,
  isHiddenCommunityTune,
  mergeAppData,
  routeToNav,
  tuneDisplayName,
  userTunePatch,
  withTimeout
} from "./app/appModel";
import { navigate, parseRoute, type AppRoute } from "./app/routing";
import { APP_NAME, absoluteShareUrl } from "./config/domain";
import { chassisInfoFromTune, chassisSearchText } from "./data/chassisBrands";
import { partDisplayForTune } from "./data/rcParts";
import { emptyAppData } from "./data/sampleData";
import { isFirebaseConfigured } from "./services/firebase";
import {
  firebaseLogin,
  firebaseGoogleLogin,
  firebaseLogout,
  firebasePasswordReset,
  firebaseSignUp,
  listenToFirebaseAuth,
  loadFirebaseAppData,
  loadFirebasePublicData,
  loadFirebaseSharedTune,
  removeFirebaseCar,
  removeFirebaseFavorite,
  removeFirebaseFollow,
  removeFirebaseTune,
  saveFirebaseAppData,
  clearFirebaseAppData,
  saveProfile
} from "./services/firebaseData";
import { clearAppData, loadAppData, resetAppData, saveAppData } from "./store/db";
import type { AppData, Car, ElectronicsProfile, NotificationSettings, ThemeMode, TrackSession, Tune, TunePhoto, UserAccount } from "./types";
import { snapshotTune, withRevision } from "./utils/changes";
import { serializeTuneForSave, syncAppDataSharedModel, syncTuneSharedModel } from "./utils/sharedTuneModel";
import { deleteOrphanedCloudinaryPhotos, displayPhotoUrl } from "./utils/photoStorage";

type SetupMode = "official" | "universal" | "custom";
type StartingPoint = "blank" | "duplicate" | "baseline" | "import";
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const AdminPage = lazy(() => import("./components/AdminPage").then((module) => ({ default: module.AdminPage })));
const AdminCatalogPage = lazy(() => import("./components/AdminCatalogPage").then((module) => ({ default: module.AdminCatalogPage })));
const BrandPage = lazy(() => import("./components/LibraryPage").then((module) => ({ default: module.BrandPage })));
const CompareView = lazy(() => import("./components/CompareView").then((module) => ({ default: module.CompareView })));
const GarageManager = lazy(() => import("./components/GarageManager").then((module) => ({ default: module.GarageManager })));
const LibraryPage = lazy(() => import("./components/LibraryPage").then((module) => ({ default: module.LibraryPage })));
const PdfMapperPage = lazy(() => import("./components/PdfMapperPage").then((module) => ({ default: module.PdfMapperPage })));
const PublicTunePage = lazy(() => import("./components/PublicTunePage").then((module) => ({ default: module.PublicTunePage })));
const TrackPage = lazy(() => import("./components/LibraryPage").then((module) => ({ default: module.TrackPage })));
const TuningTipsPage = lazy(() => import("./components/TuningTipsPage").then((module) => ({ default: module.TuningTipsPage })));
const UniversalTuneBuilder = lazy(() => import("./components/UniversalTuneBuilder").then((module) => ({ default: module.UniversalTuneBuilder })));

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [communityData, setCommunityData] = useState<AppData>(() => syncAppDataSharedModel(emptyAppData));
  const [activeTuneId, setActiveTuneId] = useState("");
  const [draft, setDraft] = useState<Tune | null>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [route, setRoute] = useState<AppRoute>(() => parseRoute());
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem("rc-theme") as ThemeMode) || "dark");
  const [garageAddNonce, setGarageAddNonce] = useState(0);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [authChecked, setAuthChecked] = useState(!isFirebaseConfigured);
  const [accountDataReady, setAccountDataReady] = useState(!isFirebaseConfigured);
  const [syncStatus, setSyncStatus] = useState(isFirebaseConfigured ? "Firebase account storage ready" : "Firebase is not configured");
  const [onboardingOpen, setOnboardingOpen] = useState(() => localStorage.getItem("rc-onboarding-complete") !== "yes");
  const [online, setOnline] = useState(() => navigator.onLine);
  const [remoteSharedTune, setRemoteSharedTune] = useState<Tune | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const shareRouteId = route.name === "share" ? route.shareId : "";

  useEffect(() => {
    if (isFirebaseConfigured) {
      const empty = syncAppDataSharedModel(emptyAppData);
      window.setTimeout(() => {
        setData(empty);
        setCommunityData(empty);
        void clearAppData();
      }, 0);
      return;
    }

    loadAppData().then((loaded) => {
      const synced = syncAppDataSharedModel(loaded);
      setData(synced);
      setActiveTuneId(synced.tunes[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = listenToFirebaseAuth(async (user) => {
      setAccount(user);
      if (!user) {
        setAuthChecked(true);
        setAccountDataReady(true);
        setSyncStatus(isFirebaseConfigured ? "Sign in to load your cars and tunes." : "Firebase is not configured.");
        const empty = syncAppDataSharedModel(emptyAppData);
        setData(empty);
        setCommunityData(empty);
        setActiveTuneId("");
        setDraft(null);
        void clearAppData();
        return;
      }
      setAccountDataReady(false);
      setSyncStatus("Loading your Firebase garage...");
      try {
        const [cloud, publicData] = await Promise.all([loadFirebaseAppData(user.uid), loadFirebasePublicData()]);
        const syncedPublicData = syncAppDataSharedModel(publicData as AppData);
        setCommunityData(syncedPublicData);
        setData((current) => {
          const syncedCloud = syncAppDataSharedModel(cloud as AppData);
          const hasCloud = Boolean(cloud.cars?.length || cloud.tunes?.length || cloud.electronicsProfiles?.length || cloud.trackSessions?.length);
          const base = current ?? syncAppDataSharedModel(emptyAppData);
          const withGarage = hasCloud ? mergeAppData(base, syncedCloud) : base;
          return withGarage;
        });
        setSyncStatus("Firebase sync ready");
      } catch {
        setSyncStatus("Could not load your Firebase garage. Refresh or check your connection.");
      } finally {
        setAuthChecked(true);
        setAccountDataReady(true);
      }
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
    const root = document.documentElement;
    const editableSelector = "input, textarea, select, [contenteditable='true']";
    let blurTimer: number | undefined;

    const setKeyboardOpen = (open: boolean) => {
      root.classList.toggle("keyboard-open", open);
    };

    const activeElementIsEditable = () => {
      const active = document.activeElement;
      return Boolean(active instanceof HTMLElement && active.matches(editableSelector));
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement && event.target.matches(editableSelector)) {
        window.clearTimeout(blurTimer);
        setKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      blurTimer = window.setTimeout(() => {
        if (!activeElementIsEditable()) setKeyboardOpen(false);
      }, 120);
    };

    const handleViewportChange = () => {
      if (!window.visualViewport) return;
      const keyboardLikelyOpen = window.visualViewport.height < window.innerHeight - 120;
      setKeyboardOpen(keyboardLikelyOpen || activeElementIsEditable());
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      window.clearTimeout(blurTimer);
      root.classList.remove("keyboard-open");
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      window.visualViewport?.removeEventListener("resize", handleViewportChange);
      window.visualViewport?.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    if (!shareRouteId || !isFirebaseConfigured) {
      return;
    }
    let cancelled = false;
    loadFirebaseSharedTune(shareRouteId)
      .then((tune) => {
        if (!cancelled) setRemoteSharedTune(tune && !isHiddenCommunityTune(tune) ? tune : null);
      })
      .catch(() => {
        if (!cancelled) setRemoteSharedTune(null);
      });
    return () => {
      cancelled = true;
    };
  }, [shareRouteId]);

  const activeTune = useMemo(() => data?.tunes.find((tune) => tune.id === activeTuneId) ?? data?.tunes[0], [data, activeTuneId]);

  useEffect(() => {
    if (!activeTune) return;
    if (draft?.id === activeTune.id && draft.updatedAt !== activeTune.updatedAt) return;
    const handle = window.setTimeout(() => setDraft(activeTune), 0);
    return () => window.clearTimeout(handle);
  }, [activeTune, draft]);

  useEffect(() => {
    if (route.name !== "tune") return;
    const handle = window.setTimeout(() => setActiveTuneId(route.tuneId), 0);
    return () => window.clearTimeout(handle);
  }, [route]);

  const isPublicRoute = route.name === "share";
  const isAuthRoute = route.name === "login" || route.name === "signup";

  if (!data) return <AppRestoreScreen label="Loading RC Drift Sync..." />;
  if (isFirebaseConfigured && !authChecked && !isPublicRoute) return <AppRestoreScreen label="Restoring your RC Drift Sync session..." />;
  if (isFirebaseConfigured && account && !accountDataReady) return <AppRestoreScreen label="Loading your saved cars and tunes..." />;

  const appData = data;
  const communityViewData = {
    ...communityData,
    tunes: (communityData.tunes ?? []).filter((tune) => !isHiddenCommunityTune(tune)),
    favorites: appData.favorites ?? [],
    follows: appData.follows ?? [],
    notificationSettings: appData.notificationSettings
  };
  const currentDraft = draft;
  const original = draft ? data.tunes.find((tune) => tune.id === draft.id) ?? draft : null;
  const dirty = Boolean(draft && original && draft.updatedAt !== original.updatedAt);

  async function commit(nextData: AppData): Promise<boolean> {
    const draftMergedData = currentDraft
      ? {
          ...nextData,
          tunes: nextData.tunes.map((tune) => {
            if (tune.id !== currentDraft.id) return tune;
            const car = nextData.cars.find((item) => item.id === currentDraft.carId);
            return serializeTuneForSave(currentDraft.updatedAt >= tune.updatedAt ? currentDraft : tune, car);
          })
        }
      : nextData;
    const syncedData = syncAppDataSharedModel(draftMergedData);
    if (isFirebaseConfigured && !account) {
      setSyncStatus("Please sign in before saving cars or tunes.");
      return false;
    }
    if (account) {
      try {
        await withTimeout(
          saveFirebaseAppData(account.uid, syncedData),
          FIREBASE_SAVE_TIMEOUT_MS,
          "Firebase save timed out. Your account storage did not confirm the write."
        );
        setData(syncedData);
        void deleteOrphanedCloudinaryPhotos(appData, syncedData);
        setSyncStatus("Synced to Firebase");
        return true;
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Check your connection or account permissions.";
        console.error("Firebase save failed", error);
        setSyncStatus(`Firebase save failed. ${detail}`);
        return false;
      }
    } else if (!isFirebaseConfigured) {
      try {
        await saveAppData(syncedData);
        setData(syncedData);
        void deleteOrphanedCloudinaryPhotos(appData, syncedData);
        setSyncStatus("Saved in this browser because Firebase is not configured.");
        return true;
      } catch (error) {
        const detail = error instanceof Error ? error.message : "Local storage failed.";
        setSyncStatus(`Save failed. ${detail}`);
        return false;
      }
    }
    return false;
  }

  function showSaved() {
    return;
  }

  async function saveDraft(): Promise<boolean> {
    if (!original || !currentDraft) return false;
    if (!canManageTune(account, currentDraft)) {
      setSyncStatus("This tune belongs to another driver. Clone it before editing.");
      return false;
    }
    const draftCar = appData.cars.find((car) => car.id === currentDraft.carId);
    const serializedDraft = serializeTuneForSave(currentDraft, draftCar);
    const saved = serializeTuneForSave(withRevision(original, serializedDraft), draftCar);
    const nextData = syncAppDataSharedModel({ ...appData, tunes: appData.tunes.map((tune) => (tune.id === saved.id ? saved : tune)) });
    setDraft(saved);
    const savedToAccount = await commit(nextData);
    if (!savedToAccount) return false;
    showSaved();
    return true;
  }

  async function addTune(carId: string, goToBuilder = true) {
    const car = appData.cars.find((item) => item.id === carId) ?? appData.cars[0];
    if (!car) return;
    const tune = { ...createTune(car), ...userTunePatch(account) };
    const nextData = syncAppDataSharedModel({ ...appData, tunes: [tune, ...appData.tunes] });
    setData(nextData);
    setActiveTuneId(tune.id);
    setDraft(tune);
    if (goToBuilder) navigate("/builder");
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    const savedToAccount = await commit(nextData);
    if (!savedToAccount) return;
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
    const savedToAccount = await commit({ ...appData, tunes: [tune, ...appData.tunes] });
    if (!savedToAccount) return;
    setActiveTuneId(tune.id);
    setDraft(tune);
    navigate("/builder");
    showSaved();
  }

  function updateTune(nextTune: Tune) {
    if (!canManageTune(account, nextTune)) {
      setSyncStatus("This tune belongs to another driver. Clone it before editing.");
      return;
    }
    const car = appData.cars.find((item) => item.id === nextTune.carId);
    const syncedTune = syncTuneSharedModel(nextTune, car);
    setDraft(syncedTune);
    if (route.name !== "builder") {
      const nextData = syncAppDataSharedModel({
        ...appData,
        tunes: appData.tunes.map((tune) => tune.id === syncedTune.id ? syncedTune : tune)
      });
      void commit(nextData);
    }
  }

  async function deleteTune(tuneId: string): Promise<boolean> {
    const tuneToDelete = appData.tunes.find((tune) => tune.id === tuneId || tune.shareId === tuneId);
    if (!tuneToDelete) {
      setSyncStatus("That tune is not loaded in this garage.");
      return false;
    }
    if (!canManageTune(account, tuneToDelete)) {
      setSyncStatus("Only the owner can delete that tune.");
      return false;
    }
    if (account) {
      try {
        await removeFirebaseTune(tuneToDelete);
      } catch {
        setSyncStatus("Delete failed in Firebase. The tune was left in place.");
        return false;
      }
    }
    const tunes = appData.tunes.filter((tune) => tune.id !== tuneToDelete.id && tune.shareId !== tuneId);
    const nextData = syncAppDataSharedModel({ ...appData, tunes });
    if (account) {
      setData(nextData);
      void deleteOrphanedCloudinaryPhotos(appData, nextData);
      setSyncStatus("Tune deleted from Firebase");
    } else {
      const savedToAccount = await commit(nextData);
      if (!savedToAccount) return false;
    }
    setActiveTuneId(tunes[0]?.id ?? "");
    setDraft(tunes[0] ?? null);
    if (route.name === "tune" || route.name === "builder") navigate("/tunes");
    showSaved();
    return true;
  }

  async function saveElectronicsProfile(profile: ElectronicsProfile) {
    const profiles = appData.electronicsProfiles ?? [];
    const exists = profiles.some((item) => item.id === profile.id);
    const nextProfile = { ...profile, updatedAt: new Date().toISOString() };
    const electronicsProfiles = exists ? profiles.map((item) => (item.id === profile.id ? nextProfile : item)) : [nextProfile, ...profiles];
    const savedToAccount = await commit({ ...appData, electronicsProfiles });
    if (!savedToAccount) return;
    showSaved();
  }

  function requestAddCar() {
    setGarageAddNonce((value) => value + 1);
    navigate("/garage");
  }

  async function saveCar(car: Car): Promise<boolean> {
    const nextCar: Car = {
      ...car,
      ...carTemplatePatch(car),
      updatedAt: new Date().toISOString()
    };
    const exists = appData.cars.some((item) => item.id === nextCar.id);
    const cars = exists ? appData.cars.map((item) => (item.id === nextCar.id ? nextCar : item)) : [nextCar, ...appData.cars];
    const savedToAccount = await commit({ ...appData, cars });
    if (!savedToAccount) return false;
    showSaved();
    return true;
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
    const savedToAccount = await commit({ ...appData, cars: appData.cars.filter((car) => car.id !== carId), tunes });
    if (!savedToAccount) return;
    setActiveTuneId(tunes[0]?.id ?? "");
    setDraft(tunes[0] ?? null);
    showSaved();
  }

  async function duplicateTune(
    source: Tune | null = currentDraft,
    options?: { track?: string; surface?: string; nameSuffix?: string; summary?: string; reason?: string; navigateToBuilder?: boolean }
  ) {
    if (!source) return;
    const ownsSource = Boolean(account?.isAdmin) || !source.ownerId || source.ownerId === "local-user" || Boolean(account && source.ownerId === account.uid);
    const isSharedSource = !ownsSource;
    const cloneSource = cloneableTuneSource(source, ownsSource);
    const sourceCar = appData.cars.find((car) => car.id === source.carId);
    const sourceChassis = chassisInfoFromTune(source, sourceCar);
    const nextTrack = options?.track ?? cloneSource.track;
    const nextSurface = options?.surface ?? cloneSource.surface;
    const nextValues = {
      ...cloneSource.values,
      ...(options?.track !== undefined ? { track: nextTrack } : {}),
      ...(options?.surface !== undefined ? { surface: nextSurface } : {})
    };
    const nextSelections = {
      ...cloneSource.selections,
      ...(options?.track !== undefined ? { track: String(nextTrack) } : {}),
      ...(options?.surface !== undefined ? { surface: String(nextSurface) } : {})
    };
    const tune: Tune = {
      ...cloneSource,
      id: `tune-${Date.now()}`,
      name: cloneSource.name.trim() ? `${cloneSource.name}${options?.nameSuffix ?? " copy"}` : "",
      track: nextTrack,
      surface: nextSurface,
      values: nextValues,
      selections: nextSelections,
      photos: cloneSource.photos,
      ...userTunePatch(account),
      shareId: `share-${Date.now()}`,
      visibility: "private",
      cloneEnabled: false,
      sharedPhotosEnabled: false,
      sharedNotesEnabled: false,
      sharedBasicTuneEnabled: true,
      sharedChassisSetupEnabled: true,
      sharedEscTuneEnabled: false,
      sharedServoTuneEnabled: false,
      sharedGyroTuneEnabled: false,
      sharedRadioTuneEnabled: false,
      sharedHistoryEnabled: false,
      sharedOwnerNameEnabled: true,
      pdfDownloadEnabled: true,
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
      sourceBrand: isSharedSource ? sourceChassis.brand : source.sourceBrand,
      sourceModel: isSharedSource ? sourceChassis.model : source.sourceModel,
      forkedAt: isSharedSource ? new Date().toISOString() : source.forkedAt,
      parentVersionId: source.id,
      versionGroupId: source.versionGroupId ?? source.id,
      versionNumber: (source.versionNumber ?? 1) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          id: `rev-duplicate-${Date.now()}`,
          date: new Date().toISOString(),
          summary: options?.summary ?? (isSharedSource ? "Copied from community tune" : "Duplicated from saved tune"),
          changes: [`Created from ${source.name.trim() || "untitled tune"}`],
          snapshot: snapshotTune(source),
          whatChanged: "Created a separate editable copy.",
          reason: options?.reason ?? (isSharedSource ? "Forked from a shared tune." : "Started a new version from an existing setup."),
          sourceTuneId: source.id
        },
        ...(source.history ?? [])
      ]
    };
    const tunes = appData.tunes.map((item) => (item.id === source.id ? { ...item, cloneCount: (item.cloneCount ?? 0) + 1 } : item));
    const savedToAccount = await commit({ ...appData, tunes: [tune, ...tunes] });
    if (!savedToAccount) return;
    setActiveTuneId(tune.id);
    setDraft(tune);
    if (options?.navigateToBuilder !== false) navigate(`/tune/${tune.id}`);
    showSaved();
  }

  function requestDeleteTune(tuneId: string) {
    return deleteTune(tuneId);
  }

  async function duplicateTuneForTrack(source: Tune, track: string, surface: string) {
    const suffix = track.trim() ? ` - ${track.trim()}` : " - new track";
    await duplicateTune(source, {
      track: track.trim(),
      surface: surface.trim(),
      nameSuffix: suffix,
      summary: "Created tune for another track",
      reason: "Kept the same car setup as a starting point for a different track.",
      navigateToBuilder: true
    });
  }

  async function exportTunePdf(tune: Tune) {
    const car = appData.cars.find((item) => item.id === tune.carId);
    if (!car) return;
    const { downloadUniversalTunePdf } = await import("./utils/universalPdfExport");
    await downloadUniversalTunePdf(tune, car, { shareUrl: absoluteShareUrl(tune.shareId || tune.id) });
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
    if (!account) {
      setSyncStatus("Please sign in before saving favorites.");
      return;
    }
    const favorites = appData.favorites ?? [];
    const existing = favorites.find((favorite) => favorite.tuneId === tuneId && favorite.userId === account.uid);
    if (existing) {
      try {
        await removeFirebaseFavorite(existing.id);
      } catch {
        setSyncStatus("Could not remove that favorite from your account. Try again.");
        return;
      }
    }
    const nextFavorites = existing
      ? favorites.filter((favorite) => favorite.id !== existing.id)
      : [{ id: `favorite-${account.uid}-${tuneId}`, tuneId, userId: account.uid, createdAt: new Date().toISOString() }, ...favorites];
    await commit({ ...appData, favorites: nextFavorites });
    showSaved();
  }

  async function addCommunityComment(tuneId: string, body: string) {
    if (!account) {
      setSyncStatus("Please sign in before commenting.");
      return;
    }
    const comment = {
      id: `comment-${Date.now()}`,
      tuneId,
      authorId: account.uid,
      authorName: account.displayName ?? account.username ?? "RC Driver",
      body,
      visibility: "public",
      tuneVisibility: "public",
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
    if (!account) {
      setSyncStatus("Please sign in before following drivers.");
      return;
    }
    const follows = appData.follows ?? [];
    const existing = follows.find((follow) => follow.followingUsername === username && follow.followerId === account.uid);
    if (existing) {
      try {
        await removeFirebaseFollow(existing.id);
      } catch {
        setSyncStatus("Could not unfollow this driver from your account. Try again.");
        return;
      }
    }
    const nextFollows = existing
      ? follows.filter((follow) => follow.id !== existing.id)
      : [{ id: `follow-${account.uid}-${username}`, followerId: account.uid, followingUsername: username, createdAt: new Date().toISOString() }, ...follows];
    const profiles = appData.profiles?.map((profile) =>
      profile.username === username
        ? { ...profile, followerCount: Math.max(0, (profile.followerCount ?? 0) + (existing ? -1 : 1)) }
        : profile
    );
    await commit({ ...appData, follows: nextFollows, profiles });
    showSaved();
  }

  async function resetDemo() {
    const empty = syncAppDataSharedModel(emptyAppData);
    await clearAppData();
    if (account) {
      await clearFirebaseAppData(account.uid);
    } else if (!isFirebaseConfigured) {
      await resetAppData();
    }
    setData(empty);
    setActiveTuneId("");
    setDraft(null);
    showSaved();
  }

  function selectTune(id: string, goToBuilder = true) {
    setActiveTuneId(id);
    const tune = appData.tunes.find((item) => item.id === id);
    if (tune) setDraft(tune);
    if (goToBuilder) navigate(`/tune/${id}`);
    setTimeout(() => editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function editTune(id: string) {
    setActiveTuneId(id);
    const tune = appData.tunes.find((item) => item.id === id);
    if (tune) setDraft(tune);
    navigate("/builder");
  }

  if (compareOpen) {
    return (
      <Suspense fallback={<AppRestoreScreen label="Loading comparison view..." />}>
        <CompareView data={data} onClose={() => setCompareOpen(false)} />
      </Suspense>
    );
  }

  if (route.name === "share") {
    const tune =
      communityData.tunes.find((item) => !isHiddenCommunityTune(item) && (item.shareId === route.shareId || item.id === route.shareId) && item.visibility !== "private") ??
      (remoteSharedTune && (remoteSharedTune.shareId === route.shareId || remoteSharedTune.id === route.shareId) ? remoteSharedTune : undefined);
    const car = tune ? communityData.cars.find((item) => item.id === tune.carId) : undefined;
    return (
      <Suspense fallback={<AppRestoreScreen label="Loading shared tune..." />}>
        <PublicTunePage
          tune={tune}
          car={car}
          onClone={duplicateTune}
          onLike={(sharedTune) => updateSharedTuneStats(sharedTune.id, "likeCount")}
          onShare={(sharedTune) => updateSharedTuneStats(sharedTune.id, "shareCount")}
          onViewed={(sharedTune) => updateSharedTuneStats(sharedTune.id, "viewCount")}
        />
      </Suspense>
    );
  }

  if (isFirebaseConfigured && !account && !isAuthRoute && !isPublicRoute) {
    return (
      <LandingAuthPage
        mode="login"
        syncStatus={syncStatus}
        onLogin={firebaseLogin}
        onGoogleLogin={firebaseGoogleLogin}
        onSignup={firebaseSignUp}
        onResetPassword={firebasePasswordReset}
        onMode={(nextMode) => navigate(`/${nextMode}`)}
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
  if (route.name === "adminCatalog") {
    return (
      <Suspense fallback={<LoadingState label="Loading catalog manager..." />}>
        <AdminCatalogPage account={account} onLogin={() => navigate("/login")} />
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
    <AppShell active={routeToNav(route)} account={account} onLogout={account ? firebaseLogout : undefined}>
      {!online ? <div className="offlineBanner">You are offline. Sign back in when your connection returns to save account changes.</div> : null}
      {/failed|quota|permission|denied/i.test(syncStatus) ? <div className="offlineBanner syncErrorBanner">{syncStatus}</div> : null}
      <Suspense fallback={<LoadingState label="Loading RC Drift Sync..." />}>
        {children}
      </Suspense>
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
    if (!account) {
      return (
        <LandingAuthPage
          mode={route.name}
          syncStatus={syncStatus}
          onLogin={firebaseLogin}
          onGoogleLogin={firebaseGoogleLogin}
          onSignup={firebaseSignUp}
          onResetPassword={firebasePasswordReset}
          onMode={(nextMode) => navigate(`/${nextMode}`)}
        />
      );
    }
    return shell(
      <AccountPage
        mode={route.name}
        account={account}
        syncStatus={syncStatus}
        onLogin={firebaseLogin}
        onGoogleLogin={firebaseGoogleLogin}
        onSignup={firebaseSignUp}
        onLogout={firebaseLogout}
        onResetPassword={firebasePasswordReset}
        onSaveProfile={(patch) => (account ? saveProfile(account, patch) : Promise.resolve())}
      />
    );
  }

  if (route.name === "library") {
    return shell(
      <LibraryPage
        data={communityViewData}
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
        data={communityViewData}
        onClone={duplicateTune}
        onLike={(tuneId) => updateSharedTuneStats(tuneId, "likeCount")}
        onFavorite={toggleFavorite}
        onComment={addCommunityComment}
        onFollow={toggleFollow}
      />
    );
  }

  if (route.name === "tips") {
    return shell(<TuningTipsPage />);
  }

  if (route.name === "profile") {
    return shell(<MyProfilePage data={data} account={account} onSettings={() => navigate("/settings")} />);
  }

  if (route.name === "sessions") {
    return shell(<TrackSessionsPage data={data} activeTune={draft} onSaveSession={saveTrackSession} />);
  }

  if (route.name === "driverProfile") {
    return shell(<ProfilePage data={communityViewData} username={route.username} onFollow={toggleFollow} />);
  }

  if (route.name === "notFound") {
    return shell(<NotFoundPage />);
  }

  if (route.name === "track") {
    return shell(<TrackPage data={communityViewData} trackSlug={route.trackSlug} onClone={duplicateTune} />);
  }
  if (route.name === "brand") {
    return shell(<BrandPage data={communityViewData} brandSlug={route.brandSlug} account={account} onClone={duplicateTune} onCreateTune={(brandSlug) => navigate(`/builder?brand=${brandSlug}`)} />);
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
        onEditTune={editTune}
        onDuplicateTune={duplicateTune}
        onDuplicateTuneForTrack={duplicateTuneForTrack}
        onDeleteTune={deleteTune}
        onUpdateTune={updateTune}
        onExportTunePdf={exportTunePdf}
      />
    );
  }

  if (route.name === "tune") {
    const tune = data.tunes.find((item) => item.id === route.tuneId);
    const car = tune ? data.cars.find((item) => item.id === tune.carId) : undefined;
    return shell(
      <TuneDetailPage
        tune={tune}
        car={car}
        onBack={() => navigate("/tunes")}
        onEdit={() => tune && editTune(tune.id)}
        onDuplicate={() => tune && duplicateTune(tune)}
        onDuplicateForTrack={(track, surface) => tune && duplicateTuneForTrack(tune, track, surface)}
        onDelete={() => tune && requestDeleteTune(tune.id)}
        onShare={(patch) => tune && updateTune({ ...tune, ...patch })}
      />
    );
  }

  if (route.name === "builder") {
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
        onDeleteTune={requestDeleteTune}
        onSaveElectronicsProfile={saveElectronicsProfile}
        onDuplicate={duplicateTune}
        onSelectTune={(id) => selectTune(id, false)}
        onViewTune={(id) => navigate(`/tune/${id}`)}
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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installHelpOpen, setInstallHelpOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const sessions = data.trackSessions ?? [];
  const lastForTune = activeTune ? sessions.find((session) => session.tuneId === activeTune.id) : sessions[0];
  const days = daysSince(lastForTune?.date);
  const publicTunes = data.tunes.filter((tune) => tune.visibility === "public");
  const searchText = search.toLowerCase().trim();
  const searchMatches = searchText
    ? [
        ...data.cars.filter((car) => `${car.name} ${car.chassis} ${car.chassisModel ?? ""} ${car.homeTrack ?? ""}`.toLowerCase().includes(searchText)).map((car) => ({ id: car.id, label: car.name, detail: car.chassis, action: () => navigate("/garage") })),
        ...data.tunes.filter((tune) => `${tune.name} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${Object.values(tune.values).join(" ")}`.toLowerCase().includes(searchText)).map((tune) => ({ id: tune.id, label: tuneDisplayName(tune), detail: tune.track || "Tune", action: () => onSelectTune(tune.id) })),
        ...sessions.filter((session) => `${session.track} ${session.surface} ${session.quickSignals.join(" ")} ${session.symptoms.join(" ")}`.toLowerCase().includes(searchText)).map((session) => ({ id: session.id, label: session.track || "Track session", detail: session.date, action: () => navigate("/sessions") }))
      ].slice(0, 6)
    : [];
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);

  useEffect(() => {
    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
    const updateStandalone = () => setIsStandalone(Boolean(mediaQuery?.matches || ("standalone" in window.navigator && (window.navigator as Navigator & { standalone?: boolean }).standalone)));
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
      setIsStandalone(true);
    };
    updateStandalone();
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    mediaQuery?.addEventListener?.("change", updateStandalone);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      mediaQuery?.removeEventListener?.("change", updateStandalone);
    };
  }, []);

  async function addToPhone() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }
    setInstallHelpOpen(true);
  }

  const recentTunes = data.tunes.slice(0, 3);
  const activeCar = activeTune ? data.cars.find((car) => car.id === activeTune.carId) : data.cars[0];
  const tuneThumb = (tune: Tune) => {
    const car = data.cars.find((item) => item.id === tune.carId);
    const photoUrl = displayPhotoUrl(tune.photos?.[0] ?? car?.photos?.[0]);
    if (photoUrl) return <img src={photoUrl} alt="" />;
    const brand = chassisInfoFromTune(tune, car).brand;
    return (
      <span className="pitlaneTuneLogo" aria-hidden="true">
        <BrandBadge brandName={brand} />
      </span>
    );
  };

  return (
    <main className="appPage pitlaneHomePage">
      <header className="pitlaneHomeHeader" aria-label={APP_NAME}>
        <button className="pitlaneLogoButton" type="button" onClick={() => navigate("/home")} aria-label="RC Drift Sync home">
          <img src="/brand/rc-drift-sync-logo-transparent.png" alt={APP_NAME} />
        </button>
        <button className="pitlaneCloudButton" type="button" onClick={() => navigate("/settings")} aria-label="Settings">
          <Bell size={20} />
          <span aria-hidden="true" />
        </button>
      </header>

      <section className="pitlaneHeroPanel">
        <h1>Tune, Share, Grow.</h1>
        <button className="pitlaneQuickTuneCard exactQuickTuneButton" type="button" onClick={data.cars.length ? onAddTune : onAddCar} aria-label="Quick Tune. Create and save a tune fast.">
          <img src="/images/quick-tune-button.png" alt="" aria-hidden="true" />
        </button>
      </section>

      <section className="pitlaneRecentPanel" aria-label="Recent tunes">
        <div className="pitlaneSectionHead">
          <h2>Recent Tunes</h2>
          <button type="button" onClick={() => navigate("/tunes")}>View All</button>
        </div>
        {recentTunes.length ? (
          <div className="pitlaneTuneList">
            {recentTunes.map((tune) => (
              <button key={tune.id} className="pitlaneTuneRow" type="button" onClick={() => onSelectTune(tune.id)}>
                <span className="pitlaneTuneThumb">{tuneThumb(tune)}</span>
                <span className="pitlaneTuneText">
                  <strong>{tuneDisplayName(tune)}</strong>
                  <em>{tune.surface || tune.track || "Setup tune"}</em>
                  <small>{tune.updatedAt ? new Date(tune.updatedAt).toLocaleDateString() : "Saved tune"}</small>
                </span>
                <MoreHorizontal size={20} />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState title="No tunes yet" body="Create a baseline setup for your next track day." action={<button className="primaryAction" type="button" onClick={onAddTune}>Create Quick Tune</button>} />
        )}
      </section>

      <section className="pitlaneSyncCard" aria-label="Trackside sync">
        <BadgeCheck size={28} />
        <span>
          <strong>Trackside Sync</strong>
          <em>{activeCar ? `${activeCar.name} ready` : "All changes saved"}</em>
        </span>
        <b>Online</b>
      </section>

      <section className="pitlaneUtilityStrip" aria-label="Track tools">
        <button type="button" onClick={() => navigate("/community")}>
          <UsersRound size={17} />
          Community
        </button>
        <button type="button" onClick={onLogSession}>
          <CalendarPlus size={17} />
          {days === null ? "Track Session" : days === 0 ? "Logged Today" : `${days}d Since Log`}
        </button>
        {!isStandalone ? (
          <button type="button" onClick={() => void addToPhone()}>
            <Smartphone size={17} />
            Add to Phone
          </button>
        ) : null}
      </section>

      <section className="homeActionGrid" aria-label="Main actions">
        <button className="homeActionCard primary" type="button" onClick={data.cars.length ? onAddTune : onAddCar}>
          <Wrench size={24} />
          <strong>{data.cars.length ? "Create Quick Tune" : "Add My First Car"}</strong>
          <span>{data.cars.length ? "Start a simple setup for your next track day." : "Add your chassis so tunes have a home."}</span>
        </button>
        <button className="homeActionCard" type="button" onClick={() => (activeTune ? onSelectTune(activeTune.id) : navigate("/tunes"))}>
          <FileText size={24} />
          <strong>{activeTune ? "Continue Last Tune" : "View My Tunes"}</strong>
          <span>{activeTune ? `${tuneDisplayName(activeTune)}${activeTune.track ? ` · ${activeTune.track}` : ""}` : "Your saved tunes will appear here."}</span>
        </button>
        <button className="homeActionCard" type="button" onClick={() => navigate("/community")}>
          <UsersRound size={24} />
          <strong>Find a Setup</strong>
          <span>Browse public RC drift tunes by chassis and parts.</span>
        </button>
        <button className="homeActionCard" type="button" onClick={onLogSession}>
          <CalendarPlus size={24} />
          <strong>Log Track Session</strong>
          <span>{days === null ? "Save how the car felt after driving." : `Last logged ${days === 0 ? "today" : `${days} days ago`}.`}</span>
        </button>
        {!isStandalone ? (
          <button className="homeActionCard" type="button" onClick={() => void addToPhone()}>
            <Smartphone size={24} />
            <strong>Add to Your Phone</strong>
            <span>{installPrompt ? "Install RC Drift Sync as an app." : "Add RC Drift Sync to your home screen."}</span>
          </button>
        ) : null}
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

      <section className="quickGrid compactActions" aria-label="More actions">
        <AppCard onClick={() => {
          setShareInput("");
          setShareInputOpen(true);
        }}>
          <QrCode size={24} />
          <strong>Open Shared Tune</strong>
          <span>Paste a RC Drift Sync share link from another driver.</span>
        </AppCard>
        <AppCard onClick={() => navigate("/tips")}>
          <BookOpenText size={24} />
          <strong>Tuning Tips</strong>
          <span>Plain-language help for setup changes.</span>
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
                disabled={!shareInput.trim()}
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

      {installHelpOpen ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal installHelpModal" role="dialog" aria-modal="true" aria-labelledby="install-help-title">
            <h2 id="install-help-title">Add RC Drift Sync to your phone</h2>
            {isIos ? (
              <div className="installSteps">
                <p>On iPhone, Apple requires you to add web apps manually from Safari.</p>
                <ol>
                  <li>Open RC Drift Sync in Safari.</li>
                  <li>Tap the Share button.</li>
                  <li>Choose Add to Home Screen.</li>
                  <li>Tap Add.</li>
                </ol>
              </div>
            ) : (
              <div className="installSteps">
                <p>If your browser does not show the install prompt automatically:</p>
                <ol>
                  <li>Open the browser menu.</li>
                  <li>Choose Install app or Add to Home screen.</li>
                  <li>Confirm RC Drift Sync.</li>
                </ol>
              </div>
            )}
            <div className="buttonRow">
              <button className="primaryAction" type="button" onClick={() => setInstallHelpOpen(false)}>Got it</button>
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
          <strong>Public tune library</strong>
          <span>{publicTunes.length ? `${publicTunes.length} public tunes available.` : "Public tunes will appear once drivers share them."}</span>
        </AppCard>
        <AppCard>
          <Clock3 size={22} />
          <strong>Track sessions</strong>
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
  onEditTune,
  onDuplicateTune,
  onDuplicateTuneForTrack,
  onDeleteTune,
  onUpdateTune,
  onExportTunePdf
}: {
  data: AppData;
  account: UserAccount | null;
  activeTuneId?: string;
  view: "garage" | "cars" | "tunes";
  startAdding?: number;
  onAddCar: () => void;
  onSaveCar: (car: Car) => void | Promise<boolean | void>;
  onDeleteCar: (carId: string) => void;
  onAddTune: (carId: string) => void;
  onSelectTune: (id: string) => void;
  onEditTune: (id: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onDuplicateTuneForTrack: (tune: Tune, track: string, surface: string) => void;
  onDeleteTune: (tuneId: string) => Promise<boolean> | boolean | void;
  onUpdateTune: (tune: Tune) => void;
  onExportTunePdf: (tune: Tune) => void | Promise<void>;
}) {
  const showCars = view !== "tunes";
  const showTunes = view === "tunes";

  return (
    <main className="appPage">
      <PageHeader eyebrow={APP_NAME} title={view === "cars" ? "Garage" : view === "tunes" ? "Tune Library" : "Garage"} />

      <div className="segmentedNav" aria-label="Garage views">
        <button className={view === "garage" || view === "cars" ? "active" : ""} type="button" onClick={() => navigate("/garage")}>Garage</button>
        <button className={view === "tunes" ? "active" : ""} type="button" onClick={() => navigate("/tunes")}>Tune Library</button>
      </div>

      {showCars ? (
        <div className="garageTopActions">
          <button className="primaryAction garageAddCarButton" type="button" onClick={onAddCar}>
            <Plus size={19} />
            Add Car
          </button>
        </div>
      ) : null}

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
          onExportTunePdf={onExportTunePdf}
          onSelectTune={onSelectTune}
        />
      ) : null}

      {showTunes ? (
        <MyTunesManager
          data={data}
          account={account}
          activeTuneId={activeTuneId}
          onSelectTune={onSelectTune}
          onEditTune={onEditTune}
          onDuplicateTune={onDuplicateTune}
          onDuplicateTuneForTrack={onDuplicateTuneForTrack}
          onDeleteTune={onDeleteTune}
          onUpdateTune={onUpdateTune}
          onExportTunePdf={onExportTunePdf}
          onAddTune={() => (data.cars[0] ? onAddTune(data.cars[0].id) : onAddCar())}
        />
      ) : null}
    </main>
  );
}

function MyTunesManager({
  data,
  account,
  activeTuneId,
  onSelectTune,
  onEditTune,
  onDuplicateTune,
  onDuplicateTuneForTrack,
  onDeleteTune,
  onUpdateTune,
  onExportTunePdf,
  onAddTune
}: {
  data: AppData;
  account: UserAccount | null;
  activeTuneId?: string;
  onSelectTune: (id: string) => void;
  onEditTune: (id: string) => void;
  onDuplicateTune: (tune: Tune) => void;
  onDuplicateTuneForTrack: (tune: Tune, track: string, surface: string) => void;
  onDeleteTune: (tuneId: string) => Promise<boolean> | boolean | void;
  onUpdateTune: (tune: Tune) => void;
  onExportTunePdf: (tune: Tune) => void | Promise<void>;
  onAddTune: () => void;
}) {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Tune | null>(null);
  const [trackCopyTarget, setTrackCopyTarget] = useState<Tune | null>(null);
  const [trackCopyName, setTrackCopyName] = useState("");
  const [trackCopySurface, setTrackCopySurface] = useState("");
  const [moreMenuTuneId, setMoreMenuTuneId] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const ownedTunes = data.tunes.filter((tune) => canManageTune(account, tune));
  const filteredTunes = ownedTunes
    .filter((tune) => {
      const car = data.cars.find((item) => item.id === tune.carId);
      const electronicsText = [
        partDisplayForTune(tune, "esc", ["escBrand", "escModel"], tune.electronics?.esc),
        partDisplayForTune(tune, "motor", ["motorBrand", "motorModel", "motor"], tune.electronics?.motor),
        partDisplayForTune(tune, "gyro", ["gyroBrand", "gyroModel"], tune.electronics?.gyro),
        partDisplayForTune(tune, "servo", ["servoBrand", "servoModel"], tune.electronics?.servo),
        partDisplayForTune(tune, "tire", ["tires", "frontTires", "rearTires"])
      ].map(String).join(" ").toLowerCase();
      const searchable = `${tune.name} ${tune.track} ${tune.surface} ${tune.tags.join(" ")} ${tune.values.tires ?? ""} ${tune.notes} ${chassisSearchText(tune, car)} ${electronicsText}`.toLowerCase();
      return searchable.includes(search.toLowerCase());
    })
    .sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  function updateVisibility(tune: Tune, visibility: Tune["visibility"]) {
    onUpdateTune({
      ...tune,
      visibility,
      cloneEnabled: visibility === "public" ? tune.cloneEnabled : false,
      updatedAt: new Date().toISOString()
    });
  }

  return (
    <DashboardSection title="Tune Library">
      {!account && isFirebaseConfigured ? (
        <AppCard>
          <div className="cardRow">
            <UsersRound size={23} />
            <div>
              <strong>Sign in to view My Tunes</strong>
              <span>Cars and tunes are saved to your RC Drift Sync account, not this device.</span>
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
      </section>

      {filteredTunes.length ? (
        <div className="myTunesList">
          {filteredTunes.map((tune) => {
            const car = data.cars.find((item) => item.id === tune.carId);
            const chassisInfo = chassisInfoFromTune(tune, car);
            const updatedLabel = Number.isNaN(Date.parse(tune.updatedAt)) ? "Updated recently" : `Updated ${new Date(tune.updatedAt).toLocaleDateString()}`;
            return (
              <article key={tune.id} className={`myTuneCard ${activeTuneId === tune.id ? "active" : ""}`}>
                <button className="myTuneMain" type="button" onClick={() => onSelectTune(tune.id)}>
                  <span className="myTuneIdentity">
                    <BrandBadge brandSlug={chassisInfo.brandSlug} />
                    <span className={`visibilityPill ${tune.visibility === "public" ? "public" : ""}`}>{tune.visibility === "public" ? "Public" : "Private"}</span>
                  </span>
                  <strong>{tuneDisplayName(tune)}</strong>
                  <span>{chassisInfo.brand} {chassisInfo.model} - {tune.surface || "Surface not set"} - {tune.track || "Track not set"}</span>
                  <span className="myTuneMetaLine">
                    <b>{updatedLabel}</b>
                  </span>
                  {tune.sourceTuneId ? <small>Copied from {tune.sourceBrand ?? "community"} {tune.sourceModel ?? "setup"}</small> : null}
                </button>
                <BasicTuneSummary tune={tune} car={car} compact />
                <div className="myTuneActions">
                  <button type="button" onClick={() => onSelectTune(tune.id)}>
                    <FileText size={16} />
                    View
                  </button>
                  <button type="button" onClick={() => onEditTune(tune.id)}>
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button type="button" onClick={() => onExportTunePdf(tune)}>
                    <Download size={16} />
                    PDF
                  </button>
                  <div className="myTuneMore">
                    <button
                      type="button"
                      aria-expanded={moreMenuTuneId === tune.id}
                      aria-label={`More actions for ${tuneDisplayName(tune)}`}
                      onClick={() => setMoreMenuTuneId((current) => current === tune.id ? "" : tune.id)}
                    >
                      <MoreHorizontal size={16} />
                      More
                    </button>
                    {moreMenuTuneId === tune.id ? (
                      <div className="myTuneMoreMenu">
                        <span>{tune.visibility === "public" ? "Public tune" : "Private tune"}</span>
                        <button type="button" onClick={() => {
                          updateVisibility(tune, tune.visibility === "public" ? "private" : "public");
                          setMoreMenuTuneId("");
                        }}>
                          {tune.visibility === "public" ? "Unpublish" : "Publish"}
                        </button>
                        <button type="button" onClick={() => {
                          setMoreMenuTuneId("");
                          onDuplicateTune(tune);
                        }}>
                          <CopyPlus size={16} />
                          Duplicate
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMoreMenuTuneId("");
                            setTrackCopyTarget(tune);
                            setTrackCopyName("");
                            setTrackCopySurface(tune.surface || "");
                          }}
                        >
                          <MapPin size={16} />
                          Use at another track
                        </button>
                        <button className="dangerAction" type="button" onClick={() => {
                          setMoreMenuTuneId("");
                          setDeleteError("");
                          setDeleteTarget(tune);
                        }}>
                          <Trash2 size={16} />
                          Delete tune
                        </button>
                      </div>
                    ) : null}
                  </div>
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
            <p>This removes "{deleteTarget.name}" from your saved tunes. This cannot be undone.</p>
            {deleteError ? <p className="errorText" role="alert">{deleteError}</p> : null}
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => {
                setDeleteError("");
                setDeleteTarget(null);
              }} disabled={deleteBusy}>Cancel</button>
              <button
                className="primaryAction destructive"
                type="button"
                disabled={deleteBusy}
                onClick={async () => {
                  const id = deleteTarget.id;
                  setDeleteError("");
                  setDeleteBusy(true);
                  try {
                    const deleted = await onDeleteTune(id);
                    if (deleted !== false) setDeleteTarget(null);
                    else setDeleteError("Delete did not complete. You may need owner/admin permission for this tune.");
                  } catch (error) {
                    setDeleteError(error instanceof Error ? error.message : "Delete failed. Please try again.");
                  } finally {
                    setDeleteBusy(false);
                  }
                }}
              >
                <Trash2 size={17} />
                {deleteBusy ? "Deleting..." : "Delete tune"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {trackCopyTarget ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="track-copy-title">
            <h2 id="track-copy-title">Use this tune at another track?</h2>
            <p>This creates a private editable copy with the same car setup. Add the new track now, then make small changes in the builder.</p>
            <TextField label="Track name" value={trackCopyName} placeholder="Track or location" onChange={(event) => setTrackCopyName(event.target.value)} />
            <TextField label="Surface" value={trackCopySurface} placeholder="P-tile, carpet, asphalt..." onChange={(event) => setTrackCopySurface(event.target.value)} />
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setTrackCopyTarget(null)}>Cancel</button>
              <button
                className="primaryAction"
                type="button"
                onClick={() => {
                  const tune = trackCopyTarget;
                  setTrackCopyTarget(null);
                  onDuplicateTuneForTrack(tune, trackCopyName, trackCopySurface);
                }}
              >
                <CopyPlus size={17} />
                Create track copy
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </DashboardSection>
  );
}

const detailTechnicalFieldPattern = /(slug|catalogitemid|iscustom|owner|share|clone|profileid|userid|carid|sheetid)$/i;
const detailDuplicateFieldPattern = /(customname)$/i;

function hasDriverVisibleDetailValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  const text = String(value ?? "").trim();
  return Boolean(text && !["not applicable", "n/a", "na", "not sure", "skip for now", "undefined", "null", "false"].includes(text.toLowerCase()));
}

function detailLabel(fieldId: string) {
  return fieldId
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\besc\b/gi, "ESC")
    .replace(/\bfdr\b/gi, "FDR")
    .replace(/\bkpi\b/gi, "KPI")
    .replace(/\brpm\b/gi, "RPM")
    .replace(/\bff\b/gi, "FF")
    .replace(/\bfr\b/gi, "FR")
    .replace(/\brf\b/gi, "RF")
    .replace(/\brr\b/gi, "RR")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function tuneDetailPhotos(tune: Tune) {
  return [
    ...(tune.photos ?? []),
    ...(tune.electronics?.esc?.tunePhotos ?? []),
    ...(tune.electronics?.servo?.tunePhotos ?? []),
    ...(tune.electronics?.gyro?.tunePhotos ?? [])
  ].filter((photo) => photo.cloudUrl || photo.dataUrl);
}

interface DetailSetupGroup {
  title: string;
  helper: string;
  keys: readonly string[];
  rows?: Array<[string, unknown]>;
}

const detailSetupGroups: DetailSetupGroup[] = [
  {
    title: "Chassis",
    helper: "Platform, deck, mount positions, and chassis notes.",
    keys: ["chassisCatalogProduct", "chassisBrand", "chassisModel", "upperDeck", "upperDeckBrand", "lowerDeck", "lowerDeckBrand", "chassisDeck", "deckBrand", "transmissionGear", "batteryPosition", "servoPosition", "motorPosition", "chassisCustomizations", "conversionKit", "chassisVariant"]
  },
  {
    title: "Track",
    helper: "Where this setup is meant to run.",
    keys: ["track", "surface", "grip", "trackCondition", "trackConditionPreset", "intendedUse", "setupIntent", "trackNotes"]
  },
  {
    title: "Front Parts",
    helper: "Front suspension, steering parts, wheels, and mount blocks.",
    keys: ["frontShockTower", "frontDamper", "frontDamperBrand", "frontShockOil", "frontDamperOilBrand", "frontShockPiston", "frontPiston", "frontShockShaft", "frontSpringBrand", "frontSpring", "frontUpperArm", "frontUpperArmBrand", "frontLowerArm", "frontLowerArmBrand", "frontLowerArmShims", "frontKnuckle", "frontKnuckleBrand", "frontKnucklePlate", "frontAxle", "frontAxleBrand", "frontHexHub", "frontWheel", "frontWheelBrand", "frontWheelOffset", "frontWheelWidth", "ffToeBlock", "frToeBlock", "ffToeBlockShim", "frToeBlockShim", "frontSpacerNotes", "frontMemo"]
  },
  {
    title: "Rear Parts",
    helper: "Rear arms, hubs, axles, wheels, and rear mount blocks.",
    keys: ["rearShockTower", "rearDamper", "rearDamperBrand", "rearShockOil", "rearDamperOilBrand", "rearShockPiston", "rearPiston", "rearShockShaft", "rearShockMountingNotes", "rearSpringBrand", "rearSpring", "rearSwayBar", "rearSwayBarThickness", "rearUpperArm", "rearUpperArmBrand", "rearLowerArm", "rearLowerArmBrand", "rearLowerArmShims", "rearLowerArmSide", "rearHubCarrier", "rearHubCarrierBrand", "activeToe", "rearAxle", "rearAxleBrand", "rearAxleLength", "rearHexHub", "rearWheel", "rearWheelBrand", "rearWheelOffset", "rearWheelWidth", "rfToeBlock", "rrToeBlock", "rfToeBlockShim", "rrToeBlockShim", "rearSpacerNotes", "rearMemo"]
  },
  {
    title: "Alignment",
    helper: "Camber, toe, steering geometry, and ride-height notes.",
    keys: ["frontRideHeight", "rearRideHeight", "frontCamber", "rearCamber", "frontToe", "rearToe", "caster", "kpi", "ackerman", "steeringAngle", "trail", "skidAngle", "rearRollCenter", "frontTrackWidth", "rearTrackWidth", "bumpSteerNotes", "frontAntiDiveNotes", "rearSquatNotes"]
  },
  {
    title: "Gearing / Diff",
    helper: "Gearing, final drive ratio, differential, and drivetrain setup.",
    keys: ["driveType", "differentialBrand", "differentialProduct", "diffType", "ballDiffSetting", "gearDiffOil", "lsdSetting", "spurGear", "pinionGear", "finalDriveRatio", "internalDriveRatio", "gearPitch", "diffOil", "diffGrease", "diffShimSetup", "rearAxleType", "beltShaftNotes", "drivetrainMemo"]
  },
  {
    title: "Electronics",
    helper: "ESC, motor, servo, gyro, radio, battery, and electronics accessories.",
    keys: ["escBrand", "escModel", "escProfileName", "escFirmwareVersion", "escNotes", "motorBrand", "motorModel", "motor", "motorTurns", "motorTiming", "motorRotor", "motorStator", "motorNotes", "servoBrand", "servoModel", "servoProfileName", "servoHorn", "servoNotes", "gyroBrand", "gyroModel", "gyroProfileName", "gyroGain", "gyroMode", "gyroNotes", "radioBrand", "radioModel", "receiverBrand", "receiverModel", "battery", "powerCapacitor", "escFan", "motorFan"]
  },
  {
    title: "Tires / Wheels",
    helper: "Tires, compounds, wheels, offsets, and tire notes.",
    keys: ["tires", "frontTire", "frontTireBrand", "frontTireCompound", "rearTire", "rearTireBrand", "rearTireCompound", "tireDiameter", "wheelModel", "frontWheel", "frontWheelBrand", "frontWheelOffset", "frontWheelWidth", "rearWheel", "rearWheelBrand", "rearWheelOffset", "rearWheelWidth", "tirePrepNotes", "tireWearNotes"]
  },
  {
    title: "Feel",
    helper: "Primary driver feel notes.",
    keys: ["forwardBite", "sideBite", "angleCapability", "stability", "steeringResponse", "testResult", "changeReason"]
  },
  {
    title: "Notes",
    helper: "General notes and custom setup notes.",
    keys: ["basicCustomNotes", "generalNotes", "notes", "whatChanged", "reasonForChange", "sessionNotes"]
  }
] as const;

function groupedTuneDetailRows(rows: Array<[string, unknown]>) {
  const rowMap = new Map(rows);
  const used = new Set<string>();
  const groups = detailSetupGroups.map((group) => {
    const groupRows = group.keys
      .filter((key) => rowMap.has(key))
      .map((key) => [key, rowMap.get(key)] as [string, unknown]);
    groupRows.forEach(([key]) => used.add(key));
    return { ...group, rows: groupRows };
  }).filter((group) => group.rows.length);
  const otherRows = rows.filter(([key]) => !used.has(key));
  if (otherRows.length) {
    groups.push({
      title: "Other Saved Details",
      helper: "Extra saved fields that do not have a dedicated section yet.",
      keys: [],
      rows: otherRows
    });
  }
  return groups;
}

const detailBrandMergeTargets: Record<string, string> = {
  chassisBrand: "chassisModel",
  deckBrand: "chassisDeck",
  frontDamperBrand: "frontDamper",
  frontDamperOilBrand: "frontShockOil",
  frontSpringBrand: "frontSpring",
  frontUpperArmBrand: "frontUpperArm",
  frontLowerArmBrand: "frontLowerArm",
  frontKnuckleBrand: "frontKnuckle",
  frontAxleBrand: "frontAxle",
  frontWheelBrand: "frontWheel",
  frontTireBrand: "frontTire",
  rearDamperBrand: "rearDamper",
  rearDamperOilBrand: "rearShockOil",
  rearSpringBrand: "rearSpring",
  rearUpperArmBrand: "rearUpperArm",
  rearLowerArmBrand: "rearLowerArm",
  rearHubCarrierBrand: "rearHubCarrier",
  rearAxleBrand: "rearAxle",
  rearWheelBrand: "rearWheel",
  rearTireBrand: "rearTire",
  differentialBrand: "differentialProduct",
  escBrand: "escModel",
  motorBrand: "motorModel",
  servoBrand: "servoModel",
  gyroBrand: "gyroModel",
  radioBrand: "radioModel",
  receiverBrand: "receiverModel"
};

function joinedDetailValue(primary: unknown, secondary: unknown) {
  const first = String(primary ?? "").trim();
  const second = String(secondary ?? "").trim();
  if (!first) return second;
  if (!second) return first;
  if (second.toLowerCase().includes(first.toLowerCase())) return second;
  return `${first} ${second}`.replace(/\s+/g, " ").trim();
}

function mergeDetailBrandRows(rows: Array<[string, unknown]>) {
  const rowMap = new Map(rows);
  Object.entries(detailBrandMergeTargets).forEach(([brandKey, targetKey]) => {
    const brand = rowMap.get(brandKey);
    if (!hasDriverVisibleDetailValue(brand)) return;
    const target = rowMap.get(targetKey);
    if (hasDriverVisibleDetailValue(target)) {
      rowMap.set(targetKey, joinedDetailValue(brand, target));
    }
    rowMap.delete(brandKey);
  });
  if (rowMap.has("motorModel") && rowMap.has("motor") && String(rowMap.get("motorModel")).trim().toLowerCase() === String(rowMap.get("motor")).trim().toLowerCase()) {
    rowMap.delete("motor");
  }
  return Array.from(rowMap.entries());
}

function tuneDetailRowsForTune(tune: Tune) {
  const directRows: Array<[string, unknown]> = [
    ["track", tune.track],
    ["surface", tune.surface],
    ["grip", tune.grip],
    ["setupIntent", tune.setupIntent],
    ["notes", tune.notes],
    ["changeReason", tune.changeReason],
    ["testResult", tune.testResult],
  ];
  const valueRows = Object.entries(tune.values ?? {});
  const rows = [...directRows, ...valueRows].filter(([key, value]) => {
    if (detailTechnicalFieldPattern.test(key) || detailDuplicateFieldPattern.test(key)) return false;
    return hasDriverVisibleDetailValue(value);
  });
  return mergeDetailBrandRows(Array.from(new Map(rows).entries())).slice(0, 120);
}

const readonlyTuneMenuSections = [
  {
    title: "Chassis",
    helper: "Platform, front, rear, drivetrain, alignment, feel, and notes.",
    groups: ["Chassis", "Front Parts", "Rear Parts", "Alignment", "Gearing / Diff", "Feel", "Notes", "Other Saved Details"],
    icon: CarFront
  },
  {
    title: "Surface",
    helper: "Track, surface, grip, condition, and setup intent.",
    groups: ["Track"],
    icon: MapPin
  },
  {
    title: "Electronics",
    helper: "ESC, motor, servo, gyro, radio, battery, and accessories.",
    groups: ["Electronics"],
    icon: SlidersHorizontal
  },
  {
    title: "Tires / Wheels",
    helper: "Tires, compounds, wheels, offsets, widths, and prep notes.",
    groups: ["Tires / Wheels"],
    icon: Wrench
  }
] as const;

function ReadOnlyTuneMenu({ groups }: { groups: Array<DetailSetupGroup & { rows: Array<[string, unknown]> }> }) {
  return (
    <section className="readonlyTuneMenu" aria-label="Read-only tune setup">
      {readonlyTuneMenuSections.map((section, index) => {
        const Icon = section.icon;
        const sectionGroups = section.groups
          .map((groupTitle) => groups.find((group) => group.title === groupTitle))
          .filter((group): group is DetailSetupGroup & { rows: Array<[string, unknown]> } => Boolean(group && group.rows.length));
        const itemCount = sectionGroups.reduce((total, group) => total + group.rows.length, 0);
        if (!itemCount) return null;
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
              {sectionGroups.map((group) => (
                <article className="readonlyTuneGroup" key={group.title}>
                  <h3>{group.title}</h3>
                  <dl>
                    {group.rows.map(([key, value]) => (
                      <div key={key}>
                        <dt>{detailLabel(key)}</dt>
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

function TuneDetailPhotoGallery({ tune, onOpen }: { tune: Tune; onOpen: (photo: TunePhoto) => void }) {
  const photos = tuneDetailPhotos(tune);
  if (!photos.length) {
    return (
      <section className="detailPhotoPanel">
        <header>
          <strong>Photos</strong>
          <span>No photos saved to this tune yet.</span>
        </header>
      </section>
    );
  }
  return (
    <section className="detailPhotoPanel">
      <header>
        <strong>Photos and tune screenshots</strong>
        <span>{photos.length} saved photo{photos.length === 1 ? "" : "s"}. Tap any photo to enlarge.</span>
      </header>
      <div className="photoGrid detailPhotoGrid">
        {photos.map((photo) => (
          <figure className="photoCard" key={photo.id}>
            <button className="publicPhotoButton" type="button" onClick={() => onOpen(photo)}>
              <img src={displayPhotoUrl(photo)} alt={photo.label} />
              <span>{photo.label}</span>
            </button>
          </figure>
        ))}
      </div>
    </section>
  );
}

function TuneDetailPage({
  tune,
  car,
  onBack,
  onEdit,
  onDuplicate,
  onDuplicateForTrack,
  onDelete,
  onShare
}: {
  tune?: Tune;
  car?: Car;
  onBack: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDuplicateForTrack: (track: string, surface: string) => void;
  onDelete: () => Promise<boolean> | boolean | void;
  onShare: (patch: Partial<Tune>) => void;
}) {
  const [tab, setTab] = useState<"setup" | "photos" | "share" | "history">("setup");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [trackCopyOpen, setTrackCopyOpen] = useState(false);
  const [trackName, setTrackName] = useState("");
  const [trackSurface, setTrackSurface] = useState(tune?.surface ?? "");
  const [viewerPhoto, setViewerPhoto] = useState<TunePhoto | null>(null);

  if (!tune) {
    return (
      <main className="appPage">
        <PageHeader eyebrow="Tune" title="Tune not found" />
        <EmptyState title="Tune not found" body="This tune may have been deleted or belongs to another account." action={<button className="primaryAction" type="button" onClick={onBack}>Back to My Tunes</button>} />
      </main>
    );
  }

  const shareId = tune.shareId || tune.id;
  const shareUrl = absoluteShareUrl(shareId);
  const shareEnabled = tune.visibility === "public" || tune.visibility === "unlisted";
  const chassisInfo = chassisInfoFromTune(tune, car);
  const detailRows = tuneDetailRowsForTune(tune);
  const detailGroups = groupedTuneDetailRows(detailRows);

  function enableShare() {
    if (!tune) return;
    onShare({
      visibility: tune.visibility === "private" ? "unlisted" : tune.visibility,
      sharedBasicTuneEnabled: tune.sharedBasicTuneEnabled !== false,
      sharedChassisSetupEnabled: tune.sharedChassisSetupEnabled !== false,
      sharedEscTuneEnabled: tune.sharedEscTuneEnabled ?? true,
      sharedServoTuneEnabled: tune.sharedServoTuneEnabled ?? true,
      sharedGyroTuneEnabled: tune.sharedGyroTuneEnabled ?? true,
      sharedRadioTuneEnabled: tune.sharedRadioTuneEnabled ?? true,
      sharedNotesEnabled: tune.sharedNotesEnabled ?? true,
      sharedHistoryEnabled: tune.sharedHistoryEnabled ?? true,
      pdfDownloadEnabled: tune.pdfDownloadEnabled !== false,
      cloneEnabled: tune.cloneEnabled ?? true
    });
  }

  return (
    <main className="appPage tuneDetailPage">
      <PageHeader eyebrow="Saved tune" title={tuneDisplayName(tune)}>
        <button className="smallPill" type="button" onClick={onBack}>Back</button>
      </PageHeader>

      <section className="tuneDetailHero">
        <BrandBadge brandSlug={chassisInfo.brandSlug} />
        <div>
          <strong>{chassisInfo.brand} {chassisInfo.model}</strong>
          <span>{[tune.track || "Track not set", tune.surface || "Surface not set", tune.visibility ?? "private"].join(" · ")}</span>
        </div>
      </section>

      <nav className="detailTabBar" aria-label="Tune detail tabs">
        {[
          ["setup", "Setup Sheet"],
          ["photos", "Photos"],
          ["share", "Share"],
          ["history", "History"]
        ].map(([id, label]) => (
          <button key={id} className={tab === id ? "active" : ""} type="button" onClick={() => setTab(id as typeof tab)}>
            {label}
          </button>
        ))}
      </nav>

      {tab === "setup" ? (
        <section className="detailTabPanel">
          <BasicTuneSummary tune={tune} car={car} compact />
          <section className="detailValueSheet readonlyTuneSheet">
            <header>
              <strong>Setup Details</strong>
              <span>Read-only tune builder view</span>
            </header>
            {detailGroups.length ? <ReadOnlyTuneMenu groups={detailGroups} /> : <EmptyState title="No detailed setup yet" body="Open the editor and fill only the fields you care about." />}
          </section>
        </section>
      ) : null}

      {tab === "photos" ? (
        <section className="detailTabPanel">
          <TuneDetailPhotoGallery tune={tune} onOpen={setViewerPhoto} />
        </section>
      ) : null}

      {tab === "share" ? (
        <section className="detailTabPanel">
          <section className="shareQrPanel">
            <div>
              <p>Share with friends</p>
              <h3>{shareEnabled ? "QR code ready" : "Create a private share link"}</h3>
              <span>{shareEnabled ? shareUrl : "Your tune stays private until you create a share link."}</span>
            </div>
            {shareEnabled ? <QRCodeSVG value={shareUrl} size={116} bgColor="transparent" fgColor="currentColor" /> : <QrCode size={56} />}
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={enableShare}>{shareEnabled ? "Refresh share settings" : "Create share QR"}</button>
              {shareEnabled ? <button className="smallPill" type="button" onClick={() => navigator.clipboard?.writeText(shareUrl)}>Copy link</button> : null}
            </div>
          </section>
        </section>
      ) : null}

      {tab === "history" ? (
        <section className="detailTabPanel">
          <TuneTimeline tune={tune} />
          <section className="trackCopyPanel">
            <div>
              <p>Try this setup somewhere else</p>
              <h3>Create a track copy</h3>
              <span>Keep this tune as your fallback, then make small changes for another track or surface.</span>
            </div>
            <button className="primaryAction" type="button" onClick={() => setTrackCopyOpen(true)}>
              <MapPin size={17} />
              New track copy
            </button>
          </section>
        </section>
      ) : null}

      <section className="detailActionDock">
        <button className="smallPill" type="button" onClick={onEdit}><Edit3 size={16} /> Edit</button>
        <button className="smallPill" type="button" onClick={onDuplicate}><CopyPlus size={16} /> Duplicate</button>
        <button className="smallPill" type="button" onClick={() => setTrackCopyOpen(true)}><MapPin size={16} /> New track</button>
        <button className="smallPill destructive" type="button" onClick={() => {
          setDeleteError("");
          setDeleteOpen(true);
        }}><Trash2 size={16} /> Delete</button>
      </section>

      {deleteOpen ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="detail-delete-title">
            <h2 id="detail-delete-title">Delete tune?</h2>
            <p>This removes "{tuneDisplayName(tune)}" from your account. This cannot be undone.</p>
            {deleteError ? <p className="errorText" role="alert">{deleteError}</p> : null}
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => {
                setDeleteError("");
                setDeleteOpen(false);
              }} disabled={deleteBusy}>Cancel</button>
              <button
                className="primaryAction destructive"
                type="button"
                disabled={deleteBusy}
                onClick={async () => {
                  setDeleteError("");
                  setDeleteBusy(true);
                  try {
                    const deleted = await onDelete();
                    if (deleted !== false) setDeleteOpen(false);
                    else setDeleteError("Delete did not complete. You may need owner/admin permission for this tune.");
                  } catch (error) {
                    setDeleteError(error instanceof Error ? error.message : "Delete failed. Please try again.");
                  } finally {
                    setDeleteBusy(false);
                  }
                }}
              >
                {deleteBusy ? "Deleting..." : "Delete tune"}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {trackCopyOpen ? (
        <div className="modalShade" role="presentation">
          <section className="confirmModal" role="dialog" aria-modal="true" aria-labelledby="detail-track-copy-title">
            <h2 id="detail-track-copy-title">Create tune for another track?</h2>
            <p>This keeps your old tune untouched and creates a private editable copy.</p>
            <TextField label="Track name" value={trackName} placeholder="Track or location" onChange={(event) => setTrackName(event.target.value)} />
            <TextField label="Surface" value={trackSurface} placeholder="P-tile, carpet, asphalt..." onChange={(event) => setTrackSurface(event.target.value)} />
            <div className="buttonRow">
              <button className="smallPill" type="button" onClick={() => setTrackCopyOpen(false)}>Cancel</button>
              <button className="primaryAction" type="button" onClick={() => onDuplicateForTrack(trackName, trackSurface)}>Create track copy</button>
            </div>
          </section>
        </div>
      ) : null}
      <PhotoLightbox photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
    </main>
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
  onViewTune,
  refEl
}: {
  data: AppData;
  tune: Tune | null;
  dirty: boolean;
  onSave: () => boolean | void | Promise<boolean | void>;
  onUpdateTune: (tune: Tune) => void;
  onCreateBuilderTune: (options: { carId: string; setupMode: SetupMode; startingPoint: StartingPoint; sourceTuneId?: string }) => void;
  onDeleteTune: (tuneId: string) => Promise<boolean> | boolean | void;
  onSaveElectronicsProfile: (profile: ElectronicsProfile) => void;
  onDuplicate: (source?: Tune) => void;
  onSelectTune: (id: string) => void;
  onViewTune: (id: string) => void;
  refEl: RefObject<HTMLDivElement | null>;
}) {
  return (
    <main className="builderPage">
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
          onViewTune={onViewTune}
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

function MyProfilePage({ data, account, onSettings }: { data: AppData; account: UserAccount | null; onSettings: () => void }) {
  const profile = data.profiles?.find((item) => item.uid === account?.uid || item.username === account?.username) ?? data.profiles?.[0];
  const displayName = profile?.displayName ?? account?.displayName ?? "My profile";
  const username = profile?.username ?? account?.username ?? account?.email?.split("@")[0] ?? "your-username";
  const cloneCount = profile?.cloneCount ?? 0;
  return (
    <main className="appPage">
      <PageHeader eyebrow="Driver profile" title={displayName}>
        <button className="iconButton" type="button" onClick={onSettings} aria-label="Settings">
          <Settings size={20} />
        </button>
      </PageHeader>
      <section className="profileSummary">
        <div className="avatar">RC</div>
        <div>
          <strong>@{username}</strong>
          <span>{data.tunes.filter((tune) => tune.visibility === "public").length} public tunes / {cloneCount} clones</span>
        </div>
      </section>
      {data.tunes.some((tune) => tune.visibility === "public" || tune.visibility === "unlisted") ? null : (
        <EmptyState title="Driver profile" body="Share a tune to start building your driver profile." action={<button className="primaryAction" type="button" onClick={() => navigate("/builder")}>Share a tune</button>} />
      )}
      <DashboardSection title="Profile setup">
        <TextField label="Display name" value={displayName} readOnly />
        <TextField label="Public URL" value={`rcdriftsync.com/u/${username}`} readOnly />
      </DashboardSection>
      <DashboardSection title="Shared setup identity">
        <AppCard>
          <div className="cardRow">
            <QrCode size={23} />
            <div>
              <strong>{data.tunes.filter((tune) => tune.visibility === "public").length} public setup cards</strong>
              <span>Share real tunes to build a driver profile other RC drift drivers can inspect and clone.</span>
            </div>
          </div>
        </AppCard>
      </DashboardSection>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="appPage notFoundPage">
      <PageHeader eyebrow={APP_NAME} title="Page not found" />
      <EmptyState
        title="That garage bay is empty"
        body="The link may be old, private, or typed incorrectly. Head back to your garage or browse public RC drift tunes."
        action={
          <div className="buttonRow">
            <button className="primaryAction" type="button" onClick={() => navigate("/garage")}>Open Garage</button>
            <button className="smallPill" type="button" onClick={() => navigate("/community")}>Browse Community</button>
          </div>
        }
      />
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
          <strong>Your garage is account-based</strong>
          <span>Cars and tunes save to your signed-in RC Drift Sync account so they follow you between devices.</span>
          <button className="smallPill" type="button" onClick={() => navigate("/login")}>Account backup</button>
        </AppCard>
      </DashboardSection>
      <DashboardSection title="Start fresh">
        <button className="primaryAction fullWidth" type="button" onClick={onReset}>
          <RefreshCcw size={19} />
          Clear account garage
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
  onLogin,
  onGoogleLogin,
  onSignup,
  onLogout,
  onResetPassword,
  onSaveProfile
}: {
  mode: "login" | "signup";
  account: UserAccount | null;
  syncStatus: string;
  onLogin: (credentials: { email: string; password: string }) => Promise<unknown>;
  onGoogleLogin: () => Promise<unknown>;
  onSignup: (credentials: { email: string; password: string; displayName?: string; username?: string }) => Promise<unknown>;
  onLogout: () => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
  onSaveProfile: (patch: { displayName?: string; username?: string; photoURL?: string }) => Promise<void>;
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
      <PageHeader eyebrow={APP_NAME} title={account ? "Account" : mode === "login" ? "Login" : "Create account"} />
      {!isFirebaseConfigured ? (
        <EmptyState title="Firebase not configured yet" body="Add your Firebase Web App values to .env.local, then restart the dev server. Account-based saving needs Firebase." />
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
            <span>Configure Firebase before using account-based car and tune saving.</span>
          </AppCard>
        </DashboardSection>
      )}
    </main>
  );
}

function LandingAuthPage({
  mode,
  syncStatus,
  onLogin,
  onGoogleLogin,
  onSignup,
  onResetPassword,
  onMode
}: {
  mode: "login" | "signup";
  syncStatus: string;
  onLogin: (credentials: { email: string; password: string }) => Promise<unknown>;
  onGoogleLogin: () => Promise<unknown>;
  onSignup: (credentials: { email: string; password: string; displayName?: string; username?: string }) => Promise<unknown>;
  onResetPassword: (email: string) => Promise<void>;
  onMode: (mode: "login" | "signup") => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState(syncStatus);

  async function submit() {
    try {
      setMessage(mode === "login" ? "Signing in..." : "Creating your garage...");
      if (mode === "login") {
        await onLogin({ email, password });
      } else {
        await onSignup({ email, password, displayName, username });
      }
      setMessage("Signed in. Loading your garage...");
      navigate("/garage");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not sign in.");
    }
  }

  async function googleLogin() {
    try {
      setMessage("Opening Google sign-in...");
      await onGoogleLogin();
      setMessage("Signed in. Loading your garage...");
      navigate("/garage");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Google sign-in failed.");
    }
  }

  async function resetPassword() {
    try {
      await onResetPassword(email);
      setMessage("Password reset email sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Add your email first, then try again.");
    }
  }

  return (
    <main className="authLandingPage">
      <section className="authHeroPanel">
        <div className="authHeroCopy">
          <div className="authBrandLockup">
            <img src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
          </div>
          <p className="authEyebrow">RC drift tuning, saved to your account</p>
          <h1>Dial In. Link Up. Level Up.</h1>
          <p>
            RC Drift Sync keeps your cars, tunes, parts, electronics settings, photos, and setup notes organized in one mobile-first garage.
          </p>
          <div className="authFeatureGrid" aria-label="RC Drift Sync preview">
            <span><CarFront size={18} /> Save every chassis build</span>
            <span><SlidersPreviewIcon /> Guided tune builder</span>
            <span><CopyPlus size={18} /> Clone community setups</span>
            <span><LockKeyhole size={18} /> Private by default</span>
          </div>
        </div>

        <div className="authPreviewPhone" aria-label="App preview">
          <div className="previewTopBar">
            <span>Quick Tune</span>
            <strong>RDX P-tile baseline</strong>
          </div>
          <div className="previewCard">
            <small>Chassis</small>
            <strong>Reve D RDX</strong>
            <span>Deck, shocks, arms, knuckles, wheels</span>
          </div>
          <div className="previewCard two">
            <small>Electronics</small>
            <strong>ESC + Servo profiles</strong>
            <span>Manual settings or tune screenshots</span>
          </div>
          <div className="previewBars">
            {["Forward bite", "Rotation", "Stability"].map((label, index) => (
              <span key={label}><em>{label}</em><i style={{ width: `${64 + index * 8}%` }} /></span>
            ))}
          </div>
        </div>
      </section>

      <section className="authPanel" aria-label={mode === "login" ? "Sign in" : "Create account"}>
        <img className="authPanelLogo" src="/brand/rc-drift-sync-logo-transparent.png" alt="RC Drift Sync" />
        <div className="authPanelHeader">
          <BadgeCheck size={22} />
          <div>
            <h2>{mode === "login" ? "Sign in to continue" : "Create your RC Drift Sync account"}</h2>
            <p>Your cars and tunes save to your account, not just this phone.</p>
          </div>
        </div>

        {!isFirebaseConfigured ? (
          <p className="authMessage">Firebase is not configured, so account sign-in is unavailable.</p>
        ) : null}

        <TextField label="Email" placeholder="driver@example.com" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Password" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {mode === "signup" ? (
          <>
            <TextField label="Display name" placeholder="Chuck" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
            <TextField label="Username" placeholder="chuck-drift" value={username} onChange={(event) => setUsername(event.target.value)} />
          </>
        ) : null}

        <button className="primaryAction fullWidth authMainButton" type="button" onClick={submit} disabled={!isFirebaseConfigured || !email || !password}>
          {mode === "login" ? "Sign in and open my garage" : "Create account and start tuning"}
        </button>
        {isFirebaseConfigured && (!email || !password) ? (
          <p className="disabledHint">Enter your email and password to open your garage.</p>
        ) : null}
        <button className="smallPill fullWidth" type="button" onClick={googleLogin} disabled={!isFirebaseConfigured}>
          Continue with Google
        </button>
        <button className="authSwitchButton" type="button" onClick={() => onMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
        {mode === "login" ? <button className="authSwitchButton" type="button" onClick={resetPassword} disabled={!email || !isFirebaseConfigured}>Send password reset</button> : null}
        {mode === "login" && isFirebaseConfigured && !email ? <p className="disabledHint">Enter your email first to reset your password.</p> : null}
        <p className="authMessage">{message}</p>
      </section>
    </main>
  );
}

function SlidersPreviewIcon() {
  return <SlidersHorizontal size={18} aria-hidden="true" />;
}

function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dashboardSection" aria-label={title}>
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

