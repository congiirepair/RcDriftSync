import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
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
import type { AppData, Car, DriverProfile, ElectronicsProfile, TrackSession, Tune, UserAccount } from "../types";

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

export function listenToFirebaseAuth(callback: (user: UserAccount | null) => void) {
  if (!auth) {
    callback(null);
    return () => undefined;
  }
  return onAuthStateChanged(auth, async (user) => {
    const account = userAccount(user);
    if (!user || !account || !firestore) {
      callback(account);
      return;
    }
    try {
      const userDoc = await getDoc(doc(firestore, "users", account.uid));
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
  const result = await signInWithPopup(auth, provider);
  const username = result.user.email?.split("@")[0].toLowerCase().replace(/[^a-z0-9-]/g, "-") || result.user.uid;
  await setDoc(
    doc(firestore, "users", result.user.uid),
    {
      uid: result.user.uid,
      email: result.user.email ?? "",
      displayName: result.user.displayName ?? "RC Driver",
      username,
      photoURL: result.user.photoURL ?? "",
      settings: { notifications: false, theme: "dark" },
      publicProfile: {
        uid: result.user.uid,
        username,
        displayName: result.user.displayName ?? "RC Driver",
        photoUrl: result.user.photoURL ?? "",
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
      uid: result.user.uid,
      username,
      displayName: result.user.displayName ?? "RC Driver",
      photoUrl: result.user.photoURL ?? "",
      isPublic: true,
      sharedTuneCount: 0,
      cloneCount: 0
    },
    { merge: true }
  );
  const isAdmin = await isFirebaseAdmin(result.user.uid);
  return {
    uid: result.user.uid,
    email: result.user.email,
    displayName: result.user.displayName,
    photoURL: result.user.photoURL,
    username,
    isAdmin
  };
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

async function userCollectionQuery<T>(uid: string, collectionName: string) {
  if (!firestore) return [] as T[];
  const snapshot = await getDocs(collection(firestore, "users", uid, collectionName));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as T);
}

export async function loadFirebaseAppData(uid: string): Promise<Partial<AppData>> {
  if (!firestore) return {};
  const [userCars, userTunes, userProfiles, userSessions, legacyCars, legacyTunes, legacyProfiles, legacySessions] = await Promise.all([
    userCollectionQuery<Car>(uid, "cars"),
    userCollectionQuery<Tune>(uid, "tunes"),
    userCollectionQuery<ElectronicsProfile>(uid, "electronicsProfiles"),
    userCollectionQuery<TrackSession>(uid, "trackSessions"),
    ownerQuery<Car>("cars", uid),
    ownerQuery<Tune>("tunes", uid),
    ownerQuery<ElectronicsProfile>("electronicsProfiles", uid),
    ownerQuery<TrackSession>("trackSessions", uid)
  ]);
  const cars = userCars.length ? userCars : legacyCars;
  const tunes = userTunes.length ? userTunes : legacyTunes;
  const electronicsProfiles = userProfiles.length ? userProfiles : legacyProfiles;
  const trackSessions = userSessions.length ? userSessions : legacySessions;
  return { cars, tunes, electronicsProfiles, trackSessions };
}

export async function loadFirebasePublicData(): Promise<Partial<AppData>> {
  if (!firestore) return {};
  const [tuneSnapshot, profileSnapshot] = await Promise.all([
    getDocs(query(collection(firestore, "tunes"), where("visibility", "==", "public"))),
    getDocs(collection(firestore, "profiles"))
  ]);
  const tunes = tuneSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Tune);
  const profiles = profileSnapshot.docs
    .map((item) => item.data() as DriverProfile)
    .filter((profile) => profile.isPublic !== false);
  return { tunes, profiles };
}

export async function saveFirebaseAppData(uid: string, data: AppData) {
  if (!firestore) return;
  const db = firestore;
  const batch = writeBatch(db);
  const ownedOrLocalTune = (tune: Tune) => !tune.ownerId || tune.ownerId === "local-user" || tune.ownerId === uid;
  const ownedTuneCarIds = new Set(data.tunes.filter(ownedOrLocalTune).map((tune) => tune.carId));
  data.cars.filter((car) => ownedTuneCarIds.has(car.id) || !(car as Car & { ownerId?: string }).ownerId || (car as Car & { ownerId?: string }).ownerId === uid).forEach((car) => {
    const ownedCar = { ...car, ownerId: uid, updatedAt: car.updatedAt ?? new Date().toISOString() };
    batch.set(doc(db, "users", uid, "cars", car.id), ownedCar, { merge: true });
    batch.set(doc(db, "cars", car.id), ownedCar, { merge: true });
  });
  data.tunes.filter(ownedOrLocalTune).forEach((tune) => {
    const ownedTune = {
      ...tune,
      ownerId: uid,
      userId: uid,
      tuneId: tune.id,
      tuneName: tune.name,
      chassis: data.cars.find((car) => car.id === tune.carId)?.chassis ?? "",
      motor: String(tune.values.motor ?? tune.values.motorTiming ?? ""),
      esc: String(tune.values.escModel ?? tune.values.escBrand ?? ""),
      battery: String(tune.values.battery ?? ""),
      tire: String(tune.values.tires ?? ""),
      gearing: [tune.values.pinionGear, tune.values.spurGear].filter(Boolean).join(" / "),
      chassisSetup: tune.values,
      escTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("esc") || key.toLowerCase().includes("boost") || key.toLowerCase().includes("turbo") || key.toLowerCase().includes("throttle"))),
      servoTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("servo") || key.toLowerCase().includes("endpoint"))),
      gyroTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("gyro"))),
      radioTune: Object.fromEntries(Object.entries(tune.values).filter(([key]) => key.toLowerCase().includes("radio") || key.toLowerCase().includes("expo"))),
      updatedAt: tune.updatedAt ?? new Date().toISOString()
    };
    const sharedTune = {
      tuneId: tune.id,
      shareId: tune.shareId ?? tune.id,
      ownerId: uid,
      visibility: tune.visibility ?? "private",
      name: tune.name,
      sheetId: tune.sheetId,
      track: tune.track,
      surface: tune.surface,
      rating: tune.rating,
      tags: tune.tags,
      values: tune.sharedChassisSetupEnabled === false ? {} : tune.values,
      photos: tune.sharedPhotosEnabled ? tune.photos : [],
      notes: tune.sharedNotesEnabled ? tune.notes : "",
      cloneEnabled: Boolean(tune.cloneEnabled),
      updatedAt: tune.updatedAt
    };
    batch.set(doc(db, "users", uid, "tunes", tune.id), ownedTune, { merge: true });
    batch.set(doc(db, "tunes", tune.id), ownedTune, { merge: true });
    if (tune.visibility === "public" || tune.visibility === "unlisted") {
      batch.set(doc(db, "sharedTunes", tune.shareId ?? tune.id), sharedTune, { merge: true });
    }
  });
  (data.electronicsProfiles ?? []).forEach((profile) => {
    const ownedProfile = { ...profile, ownerId: uid, userId: uid };
    batch.set(doc(db, "users", uid, "electronicsProfiles", profile.id), ownedProfile, { merge: true });
    batch.set(doc(db, "electronicsProfiles", profile.id), ownedProfile, { merge: true });
  });
  (data.trackSessions ?? []).forEach((session) => {
    const ownedSession = { ...session, ownerId: uid, userId: uid };
    batch.set(doc(db, "users", uid, "trackSessions", session.id), ownedSession, { merge: true });
    batch.set(doc(db, "trackSessions", session.id), ownedSession, { merge: true });
  });
  if (data.notificationSettings) {
    batch.set(doc(db, "users", uid), { settings: { notifications: data.notificationSettings }, updatedAt: serverTimestamp() }, { merge: true });
  }
  await batch.commit();
}

export async function importLocalDataToFirebase(uid: string, data: AppData) {
  await saveFirebaseAppData(uid, data);
}

export async function removeFirebaseTune(tune: Tune) {
  if (!firestore) return;
  const ownerId = tune.ownerId && tune.ownerId !== "local-user" ? tune.ownerId : auth?.currentUser?.uid;
  if (ownerId) {
    const userTuneRef = doc(firestore, "users", ownerId, "tunes", tune.id);
    const userTune = await getDoc(userTuneRef);
    if (userTune.exists()) await deleteDoc(userTuneRef);
  }
  await deleteDoc(doc(firestore, "tunes", tune.id));
  if (tune.shareId) await deleteDoc(doc(firestore, "sharedTunes", tune.shareId));
}

export async function removeFirebaseCar(car: Car) {
  if (!firestore) return;
  const ownerId = (car as Car & { ownerId?: string }).ownerId ?? auth?.currentUser?.uid;
  if (ownerId) {
    const userCarRef = doc(firestore, "users", ownerId, "cars", car.id);
    const userCar = await getDoc(userCarRef);
    if (userCar.exists()) await deleteDoc(userCarRef);
  }
  await deleteDoc(doc(firestore, "cars", car.id));
}

export async function uploadFirebasePhoto(file: File, path: string) {
  if (!storage) throw new Error("Firebase Storage is not configured.");
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}

export { isFirebaseConfigured };
