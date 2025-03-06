import { messages } from "./messages";
import { createI18n } from "vue-i18n";

export default createI18n({
  legacy: false,
  locales: ["en", "de"],
  defaultLocale: "en",
  messages,
});
