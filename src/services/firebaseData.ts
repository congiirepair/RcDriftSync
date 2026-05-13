import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, firestore, isFirebaseConfigured, storage } from "./firebase";
import type { AppData, Car, CommunityComment, CommunityFavorite, CommunityFollow, DriverProfile, ElectronicsProfile, TrackSession, Tune, TuneElectronicsItem, TunePhoto, UserAccount } from "../types";
import { syncAppDataSharedModel, syncTuneSharedModel } from "../utils/sharedTuneModel";
import { emptyAppData } from "../data/sampleData";

export interface AuthCredentials {
  email: string;
  password: string;
  displayName?: string;
  username?: string;
}

function normalizeAuthEmail(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.includes("@") ? trimmed : `${trimmed}@rcdriftsync.com`;
}

const userAccount = (user: User | null): UserAccount | null =>
  user
    ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    : null;

async function isFirebaseAdmin(uid: string) {
  if (!firestore) return false;
  try {
    const snapshot = await getDoc(doc(firestore, "admins", uid));
    return snapshot.exists();
  } catch {
    return false;
  }
}

function googleUsername(user: User) {
  return user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-") || user.uid;
}

async function ensureGoogleProfile(user: User) {
  if (!firestore) return googleUsername(user);
  const username = googleUsername(user);
  await setDoc(
    doc(firestore, "users", user.uid),
    {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "RC Driver",
      username,
      photoURL: user.photoURL ?? "",
      settings: { notifications: false, theme: "dark" },
      publicProfile: {
        uid: user.uid,
        username,
        displayName: user.displayName ?? "RC Driver",
        photoUrl: user.photoURL ?? "",
        isPublic: true,
        sharedTuneCount: 0,
        cloneCount: 0
      },
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  await setDoc(
    doc(firestore, "profiles", username),
    {
      uid: user.uid,
      username,
      displayName: user.displayName ?? "RC Driver",
      photoUrl: user.photoURL ?? "",
      isPublic: true,
      sharedTuneCount: 0,
      cloneCount: 0
    },
    { merge: true }
  );
  return username;
}

function googleAuthErrorMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  if (code === "auth/operation-not-allowed") {
    return "Google sign-in is not enabled in Firebase. Enable Google under Firebase Authentication > Sign-in method.";
  }
  if (code === "auth/unauthorized-domain") {
    return "This domain is not authorized for Firebase sign-in. Add rcdriftsync.web.app and rcdriftsync.com under Firebase Authentication > Settings > Authorized domains.";
  }
  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was closed before it finished.";
  }
  if (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request") {
    return "Your browser blocked the popup. Redirecting to Google sign-in...";
  }
  return error instanceof Error ? error.message : "Google sign-in failed.";
}

function shouldUseRedirectFallback(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  return code === "auth/popup-blocked" || code === "auth/cancelled-popup-request";
}

export function listenToFirebaseAuth(callback: (user: UserAccount | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  void getRedirectResult(auth).then(async (result) => {
    if (result?.user) await ensureGoogleProfile(result.user);
  }).catch(() => undefined);
  return onAuthStateChanged(auth, async (user) => {
    const account = userAccount(user);
    if (!user || !account || !firestore) {
      callback(account);
      return;
    }
    try {
      const userDoc = await getDoc(doc(firestore, "users", account.uid));
      if (!userDoc.exists() && user.providerData.some((provider) => provider.providerId === "google.com")) {
        await ensureGoogleProfile(user);
      }
      const profile = userDoc.data();
      const isAdmin = await isFirebaseAdmin(account.uid);
      callback({
        ...account,
        username: typeof profile?.username === "string" ? profile.username : undefined,
        displayName: typeof profile?.displayName === "string" ? profile.displayName : account.displayName,
        photoURL: typeof profile?.photoURL === "string" ? profile.photoURL : account.photoURL,
        isAdmin
      });
    } catch {
      callback(account);
    }
  });
}

export async function firebaseSignUp({ email, password, displayName, username }: AuthCredentials) {
  if (!auth || !firestore) throw new Error("Firebase is not configured.");
  const normalizedEmail = normalizeAuthEmail(email);
  const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  if (displayName) await updateProfile(result.user, { displayName });
  const profile: DriverProfile = {
    uid: result.user.uid,
    username: username || normalizedEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    displayName: displayName || normalizedEmail.split("@")[0],
    isPublic: true,
    sharedTuneCount: 0,
    cloneCount: 0
  };
  await setDoc(doc(firestore, "users", result.user.uid), {
    uid: result.user.uid,
    email: normalizedEmail,
    displayName: profile.displayName,
    username: profile.username,
    photoURL: result.user.photoURL ?? "",
    settings: { notifications: false, theme: "dark" },
    publicProfile: profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  await setDoc(doc(firestore, "profiles", profile.username), profile);
  const isAdmin = await isFirebaseAdmin(result.user.uid);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: profile.displayName,
    photoURL: result.user.photoURL,
    username: profile.username,
    isAdmin
  };
}

export async function firebaseLogin({ email, password }: AuthCredentials) {
  if (!auth) throw new Error("Firebase is not configured.");
  const result = await signInWithEmailAndPassword(auth, normalizeAuthEmail(email), password);
  const isAdmin = await isFirebaseAdmin(result.user.uid);
  return { ...userAccount(result.user), isAdmin };
}

export async function firebaseGoogleLogin() {
  if (!auth || !firestore) throw new Error("Firebase is not configured.");
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const result = await signInWithPopup(auth, provider);
    const username = await ensureGoogleProfile(result.user);
    const isAdmin = await isFirebaseAdmin(result.user.uid);
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      username,
      isAdmin
    };
  } catch (error) {
    if (shouldUseRedirectFallback(error)) {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw new Error(googleAuthErrorMessage(error), { cause: error });
  }
}

export async function firebaseLogout() {
  if (!auth) return;
  await signOut(auth);
}

export async function firebasePasswordReset(email: string) {
  if (!auth) throw new Error("Firebase is not configured.");
  await sendPasswordResetEmail(auth, email);
}

export async function saveProfile(account: UserAccount, patch: { displayName?: string; username?: string; photoURL?: string }) {
  if (!auth?.currentUser || !firestore) throw new Error("Firebase is not configured.");
  await updateProfile(auth.currentUser, { displayName: patch.displayName ?? account.displayName ?? undefined, photoURL: patch.photoURL ?? account.photoURL ?? undefined });
  const username = patch.username || account.username || account.email?.split("@")[0] || account.uid;
  await setDoc(
    doc(firestore, "users", account.uid),
    {
      uid: account.uid,
      email: account.email ?? "",
      displayName: patch.displayName ?? account.displayName ?? "RC Driver",
      username,
      photoURL: patch.photoURL ?? account.photoURL ?? "",
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  await setDoc(
    doc(firestore, "profiles", username),
    {
      uid: account.uid,
      username,
      displayName: patch.displayName ?? account.displayName ?? "RC Driver",
      photoUrl: patch.photoURL ?? account.photoURL ?? "",
      isPublic: true,
      sharedTuneCount: 0,
      cloneCount: 0
    },
    { merge: true }
  );
}

async function ownerQuery<T>(collectionName: string, uid: string) {
  if (!firestore) return [] as T[];
  const snapshot = await getDocs(query(collection(firestore, collectionName), where("ownerId", "==", uid)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

async function fieldQuery<T>(collectionName: string, field: string, value: string) {
  if (!firestore) return [] as T[];
  const snapshot = await getDocs(query(collection(firestore, collectionName), where(field, "==", value)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

async function userCollectionQuery<T>(uid: string, collectionName: string) {
  if (!firestore) return [] as T[];
  const snapshot = await getDocs(collection(firestore, "users", uid, collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

function mergeById<T extends { id?: string }>(...groups: T[][]) {
  const map = new Map<string, T>();
  groups.flat().forEach((item, index) => {
    map.set(item.id ?? `item-${index}`, item);
  });
  return Array.from(map.values());
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)).filter((item) => item !== undefined) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefinedDeep(item)])
    ) as T;
  }
  return value;
}

function persistablePhoto(photo: TunePhoto): TunePhoto {
  if (!photo.cloudUrl) return photo;
  return {
    ...photo,
    dataUrl: photo.cloudUrl
  };
}

function persistableElectronicsItem(item: TuneElectronicsItem | undefined): TuneElectronicsItem | undefined {
  if (!item) return item;
  return {
    ...item,
    tunePhotos: item.tunePhotos?.map(persistablePhoto)
  };
}

function persistableTune(tune: Tune): Tune {
  return {
    ...tune,
    photos: tune.photos.map(persistablePhoto),
    electronics: tune.electronics
      ? {
          ...tune.electronics,
          esc: persistableElectronicsItem(tune.electronics.esc),
          servo: persistableElectronicsItem(tune.electronics.servo),
          gyro: persistableElectronicsItem(tune.electronics.gyro),
          motor: persistableElectronicsItem(tune.electronics.motor),
          receiver: persistableElectronicsItem(tune.electronics.receiver),
          battery: persistableElectronicsItem(tune.electronics.battery),
          other: persistableElectronicsItem(tune.electronics.other)
        }
      : tune.electronics
  };
}

function persistableCar(car: Car): Car {
  return {
    ...car,
    photos: car.photos?.map(persistablePhoto) ?? []
  };
}

export async function loadFirebaseAppData(uid: string): Promise<Partial<AppData>> {
  if (!firestore) return {};
  const [userCars, userTunes, userProfiles, userSessions, legacyCars, legacyTunes, legacyProfiles, legacySessions, userFavorites, userFollows] = await Promise.all([
    userCollectionQuery<Car>(uid, "cars"),
    userCollectionQuery<Tune>(uid, "tunes"),
    userCollectionQuery<ElectronicsProfile>(uid, "electronicsProfiles"),
    userCollectionQuery<TrackSession>(uid, "trackSessions"),
    ownerQuery<Car>("cars", uid),
    ownerQuery<Tune>("tunes", uid),
    ownerQuery<ElectronicsProfile>("electronicsProfiles", uid),
    ownerQuery<TrackSession>("trackSessions", uid),
    fieldQuery<CommunityFavorite>("likes", "userId", uid),
    fieldQuery<CommunityFollow>("follows", "followerId", uid)
  ]);
  const belongsToUser = (item: unknown) => {
    const record = item as { ownerId?: string; userId?: string };
    return record.ownerId === uid || record.userId === uid;
  };
  const cars = mergeById(legacyCars, userCars).filter(belongsToUser);
  const tunes = mergeById(legacyTunes, userTunes).filter(belongsToUser);
  const electronicsProfiles = mergeById(legacyProfiles, userProfiles).filter(belongsToUser);
  const trackSessions = mergeById(legacySessions, userSessions).filter(belongsToUser);
  return syncAppDataSharedModel({ cars, tunes, electronicsProfiles, trackSessions, favorites: userFavorites, follows: userFollows } as AppData);
}

export async function loadFirebasePublicData(): Promise<Partial<AppData>> {
  if (!firestore) return {};
  const [tuneSnapshot, sharedSnapshot, profileSnapshot, commentSnapshot] = await Promise.all([
    getDocs(query(collection(firestore, "tunes"), where("visibility", "==", "public"))),
    getDocs(query(collection(firestore, "sharedTunes"), where("visibility", "==", "public"))),
    getDocs(query(collection(firestore, "profiles"), where("isPublic", "==", true))),
    getDocs(query(collection(firestore, "comments"), where("visibility", "==", "public")))
  ]);
  const tunesById = new Map<string, Tune>();
  tuneSnapshot.docs.forEach((item) => tunesById.set(item.id, normalizePublicTune(item.id, item.data())));
  sharedSnapshot.docs.forEach((item) => {
    const tune = normalizePublicTune(item.data().tuneId ?? item.id, item.data());
    tunesById.set(tune.id, tune);
  });
  const profiles = profileSnapshot.docs
    .map((item) => item.data() as DriverProfile)
    .filter((profile) => profile.isPublic !== false);
  const comments = commentSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as CommunityComment);
  return syncAppDataSharedModel({ cars: [], tunes: Array.from(tunesById.values()), profiles, comments } as AppData);
}

export async function loadFirebaseSharedTune(shareId: string): Promise<Tune | null> {
  if (!firestore || !shareId) return null;
  const snapshot = await getDoc(doc(firestore, "sharedTunes", shareId));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data.visibility !== "public" && data.visibility !== "unlisted") return null;
  return syncTuneSharedModel(normalizePublicTune(String(data.tuneId ?? shareId), data));
}

function normalizePublicTune(id: string, data: Record<string, unknown>): Tune {
  return syncTuneSharedModel({
    ...(data as Partial<Tune>),
    id,
    name: String(data.name ?? data.tuneName ?? ""),
    carId: String(data.carId ?? ""),
    sheetId: String(data.sheetId ?? "universal-template"),
    date: String(data.date ?? ""),
    track: String(data.track ?? ""),
    surface: String(data.surface ?? ""),
    grip: String(data.grip ?? ""),
    rating: Number(data.rating ?? 0),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    values: typeof data.values === "object" && data.values ? data.values as Tune["values"] : {},
    selections: typeof data.selections === "object" && data.selections ? data.selections as Tune["selections"] : {},
    notes: String(data.notes ?? ""),
    photos: Array.isArray(data.photos) ? data.photos as Tune["photos"] : [],
    history: Array.isArray(data.history) ? data.history as Tune["history"] : [],
    visibility: data.visibility === "unlisted" ? "unlisted" : "public",
    updatedAt: String(data.updatedAt ?? ""),
    createdAt: String(data.createdAt ?? data.updatedAt ?? "")
  } as Tune);
}

function publicTuneDocument(tune: Tune, uid: string, data: AppData) {
  const safeValues = tune.sharedChassisSetupEnabled === false ? {} : tune.values;
  const safeElectronics = {
    esc: tune.sharedEscTuneEnabled ? tune.electronics?.esc : undefined,
    servo: tune.sharedServoTuneEnabled ? tune.electronics?.servo : undefined,
    gyro: tune.sharedGyroTuneEnabled ? tune.electronics?.gyro : undefined,
    motor: tune.sharedEscTuneEnabled || tune.sharedChassisSetupEnabled !== false ? tune.electronics?.motor : undefined,
    battery: tune.sharedChassisSetupEnabled !== false ? tune.electronics?.battery : undefined
  };
  return {
    tuneId: tune.id,
    id: tune.id,
    shareId: tune.shareId ?? tune.id,
    ownerId: uid,
    ownerDisplayName: tune.sharedOwnerNameEnabled === false ? "" : tune.ownerDisplayName ?? "",
    ownerUsername: tune.sharedOwnerNameEnabled === false ? "" : tune.ownerUsername ?? "",
    visibility: tune.visibility ?? "private",
    name: tune.name,
    carId: tune.carId,
    sheetId: tune.sheetId,
    chassis: data.cars.find((car) => car.id === tune.carId)?.chassis ?? "",
    chassisBrand: tune.chassisBrand,
    chassisBrandSlug: tune.chassisBrandSlug,
    chassisModel: tune.chassisModel,
    chassisModelSlug: tune.chassisModelSlug,
    date: tune.date,
    track: tune.track,
    surface: tune.surface,
    grip: tune.grip,
    rating: tune.rating,
    tags: tune.tags,
    setupIntent: tune.setupIntent ?? [],
    bestForTags: tune.bestForTags ?? [],
    trackConditionPreset: tune.trackConditionPreset ?? "",
    confidenceRating: tune.confidenceRating ?? tune.rating,
    summaryChips: tune.summaryChips ?? [],
    expectedFeel: tune.expectedFeel,
    actualFeel: tune.actualFeel,
    chassisSetup: tune.sharedChassisSetupEnabled === false ? undefined : tune.chassisSetup,
    advancedSetup: tune.sharedChassisSetupEnabled === false ? undefined : tune.advancedSetup,
    values: safeValues,
    selections: tune.sharedChassisSetupEnabled === false ? {} : tune.selections,
    electronics: Object.fromEntries(Object.entries(safeElectronics).filter(([, value]) => value)),
    photos: tune.sharedPhotosEnabled ? tune.photos : [],
    notes: tune.sharedNotesEnabled ? tune.notes : "",
    history: tune.sharedHistoryEnabled ? tune.history : [],
    cloneEnabled: Boolean(tune.cloneEnabled),
    sharedPhotosEnabled: Boolean(tune.sharedPhotosEnabled),
    sharedNotesEnabled: Boolean(tune.sharedNotesEnabled),
    sharedChassisSetupEnabled: tune.sharedChassisSetupEnabled !== false,
    sharedEscTuneEnabled: Boolean(tune.sharedEscTuneEnabled),
    sharedServoTuneEnabled: Boolean(tune.sharedServoTuneEnabled),
    sharedGyroTuneEnabled: Boolean(tune.sharedGyroTuneEnabled),
    sharedRadioTuneEnabled: Boolean(tune.sharedRadioTuneEnabled),
    sharedHistoryEnabled: Boolean(tune.sharedHistoryEnabled),
    sharedOwnerNameEnabled: tune.sharedOwnerNameEnabled !== false,
    pdfDownloadEnabled: tune.pdfDownloadEnabled !== false,
    viewCount: tune.viewCount ?? 0,
    likeCount: tune.likeCount ?? 0,
    cloneCount: tune.cloneCount ?? 0,
    shareCount: tune.shareCount ?? 0,
    favoriteCount: tune.favoriteCount ?? 0,
    cloneInfo: tune.cloneInfo,
    shareSettings: tune.shareSettings,
    updatedAt: tune.updatedAt,
    createdAt: tune.createdAt
  };
}

async function readableDocExists(reference: ReturnType<typeof doc>) {
  try {
    const snapshot = await getDoc(reference);
    return snapshot.exists();
  } catch {
    return false;
  }
}

export async function saveFirebaseAppData(uid: string, data: AppData) {
  if (!firestore) return;
  const db = firestore;
  const batch = writeBatch(db);
  const ownedOrLocalTune = (tune: Tune) => !tune.ownerId || tune.ownerId === "local-user" || tune.ownerId === uid;
  const syncedData = syncAppDataSharedModel(data);
  const ownedTuneCarIds = new Set(syncedData.tunes.filter(ownedOrLocalTune).map((tune) => tune.carId));
  syncedData.cars.filter((car) => {
    const carOwnerId = (car as Car & { ownerId?: string }).ownerId;
    return ownedTuneCarIds.has(car.id) || !carOwnerId || carOwnerId === "local-user" || carOwnerId === uid;
  }).forEach((car) => {
    const ownedCar = stripUndefinedDeep({ ...persistableCar(car), ownerId: uid, updatedAt: car.updatedAt ?? new Date().toISOString() });
    batch.set(doc(db, "users", uid, "cars", car.id), ownedCar, { merge: true });
    batch.set(doc(db, "cars", car.id), ownedCar, { merge: true });
  });
  for (const rawTune of syncedData.tunes.filter(ownedOrLocalTune)) {
    const tune = persistableTune(rawTune);
    const ownedTune = stripUndefinedDeep({
      ...tune,
      ownerId: uid,
      userId: uid,
      tuneId: tune.id,
      tuneName: tune.name,
      chassis: syncedData.cars.find((car) => car.id === tune.carId)?.chassis ?? "",
      motor: String(tune.values.motor ?? tune.values.motorTiming ?? ""),
      esc: String(tune.values.escModel ?? tune.values.escBrand ?? ""),
      battery: String(tune.values.battery ?? ""),
      tire: String(tune.values.tires ?? ""),
      gearing: [tune.values.pinionGear, tune.values.spurGear].filter(Boolean).join(" / "),
      chassisValues: tune.values,
      escTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("esc") || key.toLowerCase().includes("boost") || key.toLowerCase().includes("turbo") || key.toLowerCase().includes("throttle"))),
      servoTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("servo") || key.toLowerCase().includes("endpoint"))),
      gyroTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("gyro"))),
      radioTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("radio") || key.toLowerCase().includes("expo"))),
      chassisSetup: tune.chassisSetup,
      advancedSetup: tune.advancedSetup,
      cloneInfo: tune.cloneInfo,
      shareSettings: tune.shareSettings,
      updatedAt: tune.updatedAt ?? new Date().toISOString()
    });
    const sharedTune = stripUndefinedDeep(publicTuneDocument(tune, uid, syncedData));
    batch.set(doc(db, "users", uid, "tunes", tune.id), ownedTune, { merge: true });
    if (tune.visibility === "public" || tune.visibility === "unlisted") {
      batch.set(doc(db, "tunes", tune.id), sharedTune, { merge: true });
      batch.set(doc(db, "sharedTunes", tune.shareId ?? tune.id), sharedTune, { merge: true });
    } else {
      const publicTuneRef = doc(db, "tunes", tune.id);
      const sharedTuneRef = doc(db, "sharedTunes", tune.shareId ?? tune.id);
      const [publicTuneExists, sharedTuneExists] = await Promise.all([readableDocExists(publicTuneRef), readableDocExists(sharedTuneRef)]);
      if (publicTuneExists) batch.delete(publicTuneRef);
      if (sharedTuneExists) batch.delete(sharedTuneRef);
    }
  }
  (syncedData.electronicsProfiles ?? []).forEach((profile) => {
    const ownedProfile = stripUndefinedDeep({ ...profile, ownerId: uid, userId: uid });
    batch.set(doc(db, "users", uid, "electronicsProfiles", profile.id), ownedProfile, { merge: true });
    batch.set(doc(db, "electronicsProfiles", profile.id), ownedProfile, { merge: true });
  });
  (syncedData.trackSessions ?? []).forEach((session) => {
    const ownedSession = stripUndefinedDeep({ ...session, ownerId: uid, userId: uid });
    batch.set(doc(db, "users", uid, "trackSessions", session.id), ownedSession, { merge: true });
    batch.set(doc(db, "trackSessions", session.id), ownedSession, { merge: true });
  });
  (syncedData.favorites ?? []).filter((favorite) => favorite.userId === uid).forEach((favorite) => {
    const ownedFavorite = stripUndefinedDeep({ ...favorite, userId: uid });
    batch.set(doc(db, "likes", favorite.id), ownedFavorite, { merge: true });
  });
  (syncedData.comments ?? []).filter((comment) => comment.authorId === uid).forEach((comment) => {
    const publicComment = stripUndefinedDeep({ ...comment, authorId: uid, visibility: "public", tuneVisibility: "public" });
    batch.set(doc(db, "comments", comment.id), publicComment, { merge: true });
  });
  (syncedData.follows ?? []).filter((follow) => follow.followerId === uid).forEach((follow) => {
    const ownedFollow = stripUndefinedDeep({ ...follow, followerId: uid });
    batch.set(doc(db, "follows", follow.id), ownedFollow, { merge: true });
  });
  if (syncedData.notificationSettings) {
    batch.set(doc(db, "users", uid), { settings: { notifications: syncedData.notificationSettings }, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}

export async function clearFirebaseAppData(uid: string) {
  if (!firestore) return;
  const db = firestore;
  const batch = writeBatch(db);
  const snapshots = await Promise.allSettled([
    getDocs(collection(db, "users", uid, "cars")),
    getDocs(collection(db, "users", uid, "tunes")),
    getDocs(collection(db, "users", uid, "electronicsProfiles")),
    getDocs(collection(db, "users", uid, "trackSessions")),
    getDocs(query(collection(db, "cars"), where("ownerId", "==", uid))),
    getDocs(query(collection(db, "tunes"), where("ownerId", "==", uid))),
    getDocs(query(collection(db, "electronicsProfiles"), where("ownerId", "==", uid))),
    getDocs(query(collection(db, "trackSessions"), where("ownerId", "==", uid))),
    getDocs(query(collection(db, "sharedTunes"), where("ownerId", "==", uid))),
    getDocs(query(collection(db, "likes"), where("userId", "==", uid))),
    getDocs(query(collection(db, "follows"), where("followerId", "==", uid)))
  ]);
  snapshots.forEach((result) => {
    if (result.status === "fulfilled") result.value.docs.forEach((item) => batch.delete(item.ref));
  });
  batch.set(doc(db, "users", uid), { settings: { notifications: syncAppDataSharedModel(emptyAppData).notificationSettings }, updatedAt: serverTimestamp() }, { merge: true });
  await batch.commit();
}

export async function importLocalDataToFirebase(uid: string, data: AppData) {
  await saveFirebaseAppData(uid, data);
}

export async function removeFirebaseTune(tune: Tune) {
  if (!firestore) return;
  const db = firestore;
  const ownerId = tune.ownerId && tune.ownerId !== "local-user" ? tune.ownerId : auth?.currentUser?.uid;
  const sharedIds = Array.from(new Set([tune.shareId, tune.id].filter((value): value is string => Boolean(value))));
  const deleteTasks = [
    ...(ownerId ? [deleteDoc(doc(db, "users", ownerId, "tunes", tune.id))] : []),
    deleteDoc(doc(db, "tunes", tune.id)),
    ...sharedIds.map((shareId) => deleteDoc(doc(db, "sharedTunes", shareId)))
  ];
  const results = await Promise.allSettled(deleteTasks);
  const allRejected = results.length > 0 && results.every((result) => result.status === "rejected");
  if (allRejected) {
    throw new Error("Could not delete this tune. Check that you are signed in as the owner or have permission to manage shared tunes.");
  }
}

export async function removeFirebaseFavorite(favoriteId: string) {
  if (!firestore || !favoriteId) return;
  await deleteDoc(doc(firestore, "likes", favoriteId));
}

export async function removeFirebaseFollow(followId: string) {
  if (!firestore || !followId) return;
  await deleteDoc(doc(firestore, "follows", followId));
}

export async function removeFirebaseCar(car: Car) {
  if (!firestore) return;
  const db = firestore;
  const ownerId = (car as Car & { ownerId?: string }).ownerId ?? auth?.currentUser?.uid;
  const deleteTasks = [
    ...(ownerId ? [deleteDoc(doc(db, "users", ownerId, "cars", car.id))] : []),
    deleteDoc(doc(db, "cars", car.id))
  ];
  const results = await Promise.allSettled(deleteTasks);
  const allRejected = results.length > 0 && results.every((result) => result.status === "rejected");
  if (allRejected) {
    throw new Error("Could not delete this car. Check that you are signed in as the owner or have permission to manage this car.");
  }
}

export async function uploadFirebasePhoto(file: File, path: string) {
  if (!storage) throw new Error("Firebase Storage is not configured.");
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}

export { isFirebaseConfigured };
