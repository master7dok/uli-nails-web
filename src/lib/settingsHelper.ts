export function getSettingText(
  settings: Record<string, string> | undefined,
  keyBase: string,
  lang: string,
  fallback: string
): string {
  if (!settings) return fallback;
  const langKey = `${keyBase}_${lang.toLowerCase()}`;
  if (settings[langKey] !== undefined && settings[langKey] !== null && settings[langKey].trim() !== "") {
    return settings[langKey];
  }
  if (settings[keyBase] !== undefined && settings[keyBase] !== null && settings[keyBase].trim() !== "") {
    return settings[keyBase];
  }
  return fallback;
}

export function getInstagramLink(
  language: string,
  settings?: Record<string, string>
): { handle: string; url: string } {
  const isUa = language.toLowerCase() === "ua";
  const raw = isUa
    ? settings?.instagram_secondary || settings?.instagram_ua || "@uli.nail.krk"
    : settings?.instagram_primary || settings?.instagram_pl || "@uli.nails.krk";

  const handle = raw
    .trim()
    .replace(/^@/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//, "")
    .replace(/\/$/, "");

  const cleanHandle = handle || (isUa ? "uli.nail.krk" : "uli.nails.krk");

  return {
    handle: `@${cleanHandle}`,
    url: `https://instagram.com/${cleanHandle}`,
  };
}
