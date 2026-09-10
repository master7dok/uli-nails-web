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
