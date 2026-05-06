import type { AppData } from "../types";

export const emptyAppData: AppData = {
  cars: [],
  tunes: [],
  electronicsProfiles: [],
  profiles: [],
  comments: [],
  favorites: [],
  follows: [],
  trackSessions: [],
  notificationSettings: {
    tuneCloned: false,
    tuneLiked: false,
    tuneCommented: false,
    followedDriverSharedTune: false,
    weeklyTrendingTunes: false,
    backupReminder: true
  }
};

export const demoData = emptyAppData;
