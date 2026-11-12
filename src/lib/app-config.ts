const configuredWishLength = Number(import.meta.env["VITE_MAX_WISH_LENGTH"]);

export const appTitle = import.meta.env["VITE_APP_TITLE"] || "Share the Light";
export const appSubtitle =
  import.meta.env["VITE_APP_SUBTITLE"] || "Celebrate Ta Saung Tine Festival";
export const maxWishLength =
  Number.isSafeInteger(configuredWishLength) && configuredWishLength > 0
    ? configuredWishLength
    : 500;
