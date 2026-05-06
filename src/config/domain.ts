export const APP_NAME = "RC Drift Sync";
export const APP_DOMAIN = "rcdriftsync.com";
export const APP_ORIGIN = `https://${APP_DOMAIN}`;

export const routeFor = {
  shareTune: (shareId: string) => `/t/${shareId}`,
  publicProfile: (username: string) => `/u/${username}`
};

export const absoluteShareUrl = (shareId: string) => `${APP_ORIGIN}${routeFor.shareTune(shareId)}`;
