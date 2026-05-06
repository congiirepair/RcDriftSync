export type ThemeMode = "light" | "dark";

export type FieldType = "text" | "number" | "select" | "textarea" | "toggle" | "rating" | "tags";
export type HotspotType = "field" | "holeGroup" | "multiOption";
export type EditorTab = "sheet" | "details" | "photos" | "notes" | "history";

export interface SetupField {
  id: string;
  label: string;
  type: FieldType;
  unit?: string;
  options?: string[];
  section: string;
  placeholder?: string;
}

export interface HotspotOption {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface Hotspot {
  id: string;
  fieldId: string;
  label: string;
  type: HotspotType;
  x: number;
  y: number;
  width: number;
  height: number;
  options?: HotspotOption[];
}

export interface SetupSheetTemplate {
  id: string;
  name: string;
  chassis: string;
  pdfAsset?: string;
  renderedImageAsset?: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  fields: SetupField[];
  hotspots: Hotspot[];
  holeGroups?: Hotspot[];
  defaultValues: Record<string, string | number | boolean | string[]>;
}

export interface Car {
  id: string;
  name: string;
  brand?: string;
  chassis: "Reve D RDX" | "MC-3" | string;
  chassisModel?: string;
  chassisType?: string;
  drivetrainType?: string;
  motorLayout?: string;
  scale?: string;
  motor?: string;
  esc?: string;
  servo?: string;
  gyro?: string;
  radioReceiver?: string;
  battery?: string;
  body?: string;
  defaultTire?: string;
  homeTrack?: string;
  notes?: string;
  photos?: TunePhoto[];
  templateMode?: "official" | "universal";
  officialTemplateEligible?: boolean;
  sheetId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TunePhoto {
  id: string;
  label: string;
  dataUrl: string;
  cloudUrl?: string;
  publicId?: string;
  provider?: "local" | "cloudinary" | "firebase";
  createdAt: string;
}

export interface ChangeEntry {
  id: string;
  date: string;
  summary: string;
  changes: string[];
  snapshot: TuneSnapshot;
}

export interface SetupAssistantEntry {
  id: string;
  tuneId: string;
  createdAt: string;
  surface: string;
  tire: string;
  grip: string;
  symptom: string;
  checkAreas: string[];
  plainLanguage: string;
  testChange?: string;
  result?: "better" | "worse" | "no-change" | "";
  beforeRating?: number;
  afterRating?: number;
  notes?: string;
}

export interface TuneSnapshot {
  name: string;
  carId: string;
  sheetId: string;
  date: string;
  track: string;
  surface: string;
  grip: string;
  rating: number;
  tags: string[];
  values: Record<string, string | number | boolean | string[]>;
  selections: Record<string, string>;
  notes: string;
  setupIntent?: string[];
  bestForTags?: string[];
  trackConditionPreset?: string;
  expectedFeel?: TuneFeelProfile;
  actualFeel?: TuneFeelProfile;
  changeReason?: string;
  testResult?: "better" | "worse" | "no-change" | "";
  confidenceRating?: number;
  summaryChips?: string[];
  electronics?: TuneElectronics;
}

export interface TuneFeelProfile {
  forwardBite: number;
  rotation: number;
  stability: number;
  steeringResponse: number;
  transitionSpeed: number;
  rearGrip: number;
  throttleAggression: number;
  gyroStrength: number;
}

export interface Tune extends TuneSnapshot {
  id: string;
  ownerId?: string;
  ownerUsername?: string;
  ownerDisplayName?: string;
  shareId?: string;
  visibility?: "private" | "unlisted" | "public";
  cloneEnabled?: boolean;
  sharedPhotosEnabled?: boolean;
  sharedNotesEnabled?: boolean;
  sharedChassisSetupEnabled?: boolean;
  sharedEscTuneEnabled?: boolean;
  sharedServoTuneEnabled?: boolean;
  sharedGyroTuneEnabled?: boolean;
  sharedRadioTuneEnabled?: boolean;
  sharedHistoryEnabled?: boolean;
  sharedOwnerNameEnabled?: boolean;
  pdfDownloadEnabled?: boolean;
  clonedFromTuneId?: string;
  clonedFromOwnerId?: string;
  clonedFromShareId?: string;
  sourceTuneId?: string;
  sourceOwnerId?: string;
  versionGroupId?: string;
  versionNumber?: number;
  parentVersionId?: string;
  viewCount?: number;
  cloneCount?: number;
  likeCount?: number;
  shareCount?: number;
  favoriteCount?: number;
  setupAssistantLog?: SetupAssistantEntry[];
  photos: TunePhoto[];
  history: ChangeEntry[];
  updatedAt: string;
  createdAt: string;
}

export type ElectronicsProfileType = "esc" | "servo" | "gyro" | "radio";

export type ElectronicsCategory = "esc" | "motor" | "servo" | "gyro" | "receiver" | "battery" | "other";

export interface TuneElectronicsItem {
  brand: string;
  model: string;
  slug?: string;
  settings: Record<string, string | number | boolean | string[]>;
  notes?: string;
  turns?: string;
  timing?: string;
  rotor?: string;
}

export interface TuneElectronics {
  esc?: TuneElectronicsItem;
  motor?: TuneElectronicsItem;
  servo?: TuneElectronicsItem;
  gyro?: TuneElectronicsItem;
  receiver?: TuneElectronicsItem;
  battery?: TuneElectronicsItem;
  other?: TuneElectronicsItem;
}

export interface ElectronicsProfile {
  id: string;
  ownerId?: string;
  type: ElectronicsProfileType;
  name: string;
  description?: string;
  values: Record<string, string | number | boolean | string[]>;
  createdAt: string;
  updatedAt: string;
}

export interface DriverProfile {
  uid: string;
  username: string;
  displayName: string;
  photoUrl?: string;
  homeTrack?: string;
  favoriteChassis?: string;
  isPublic?: boolean;
  followerCount?: number;
  tuneLikesReceived?: number;
  recentActivity?: string[];
  sharedTuneCount: number;
  cloneCount: number;
}

export interface CommunityComment {
  id: string;
  tuneId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CommunityFavorite {
  id: string;
  tuneId: string;
  userId: string;
  createdAt: string;
}

export interface CommunityFollow {
  id: string;
  followerId: string;
  followingUsername: string;
  createdAt: string;
}

export interface TrackSession {
  id: string;
  ownerId?: string;
  tuneId: string;
  carId: string;
  track: string;
  date: string;
  surface: string;
  grip: string;
  tire: string;
  battery: string;
  ratingBefore: number;
  ratingAfter: number;
  whatChanged: string;
  howFelt: string;
  symptoms: string[];
  quickSignals: string[];
  notes: string;
  photos: TunePhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  tuneCloned: boolean;
  tuneLiked: boolean;
  tuneCommented: boolean;
  followedDriverSharedTune: boolean;
  weeklyTrendingTunes: boolean;
  backupReminder: boolean;
}

export interface AppData {
  cars: Car[];
  tunes: Tune[];
  electronicsProfiles?: ElectronicsProfile[];
  profiles?: DriverProfile[];
  comments?: CommunityComment[];
  favorites?: CommunityFavorite[];
  follows?: CommunityFollow[];
  trackSessions?: TrackSession[];
  notificationSettings?: NotificationSettings;
}

export interface UserAccount {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  username?: string;
  isAdmin?: boolean;
}
