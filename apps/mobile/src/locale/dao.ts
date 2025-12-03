import { getLocales } from 'expo-localization';

export class Locale {
  get(): string {
    return getLocales()[0]?.languageCode ?? 'en';
  }
}
