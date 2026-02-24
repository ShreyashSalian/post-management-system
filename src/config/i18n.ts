import i18n from "i18n";
import path from "path";

// Configure i18n
i18n.configure({
  locales: ["en", "hi"], // Supported languages
  directory: path.join(path.resolve(), "./src/locales"), // Path to translation files
  defaultLocale: "en", // Default language
  queryParameter: "lang", // Language switch via query
  autoReload: true,
  updateFiles: false,
  logDebugFn: function (msg) {
    console.log("i18n debug:", msg); // Logs i18n file loading and key lookups
  },
});

export default i18n;
