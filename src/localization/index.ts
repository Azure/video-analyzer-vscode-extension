let localized: Record<string, string> = {};

async function getLanguage(language: string) {
  const interfaceLocStrings = await import(
    /* webpackMode: "lazy" */ `./${language}.json`
  );
  const swaggerLocStrings = await import(
    /* webpackMode: "lazy" */ `../definitions/v1.0/i18n.${language}.json`
  );

  return {
    ...interfaceLocStrings,
    ...swaggerLocStrings,
  };
}

export async function loadUserLanguage(forceLang?: string) {
  let language = forceLang || navigator.language || navigator.languages[0];
  language = language.toLowerCase().split("-")[0]; // en-US -> en

  try {
    localized = await getLanguage(language);
  } catch (error) {
    language = "en";
    localized = await getLanguage(language);
  }
}

export function localize(key: string) {
  return localized[key];
}
