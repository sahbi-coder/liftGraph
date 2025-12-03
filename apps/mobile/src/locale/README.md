# Multi-Language Support

This project uses `i18next` and `react-i18next` for internationalization (i18n).

## Supported Languages

- English (en) - Default
- Spanish (es)
- French (fr)

## Usage

### Basic Translation

```tsx
import { useTranslation } from '@/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return <Text>{t('auth.welcomeBack')}</Text>;
}
```

### Changing Language

```tsx
import { useTranslation } from '@/hooks/useTranslation';
import { changeLanguage } from '@/locale/i18n';

function SettingsScreen() {
  const { i18n } = useTranslation();

  return (
    <>
      <Text>Current language: {i18n.language}</Text>
      <Button onPress={() => changeLanguage('es')}>Switch to Spanish</Button>
    </>
  );
}
```

### Translation Keys Structure

Translation keys are organized by feature/section:

- `common.*` - Common UI elements (buttons, labels, etc.)
- `auth.*` - Authentication screens
- `workout.*` - Workout-related screens
- `program.*` - Program-related screens
- `schedule.*` - Schedule screens
- `progress.*` - Progress tracking screens
- `settings.*` - Settings screens

### Adding New Translations

1. Add the key to all language files in `src/locale/translations/`
2. Use the key in your component with `t('key.path')`

### Adding a New Language

1. Create a new JSON file in `src/locale/translations/` (e.g., `de.json` for German)
2. Copy the structure from `en.json` and translate all values
3. Import and add it to the `resources` object in `src/locale/i18n.ts`

Example:

```typescript
import de from './translations/de.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de }, // Add new language
};
```

## Files

- `i18n.ts` - i18n configuration and initialization (exports `changeLanguage` function)
- `translations/*.json` - Translation files for each language
- `dao.ts` - Locale detection utility
- `hooks/useTranslation.ts` - Hook for accessing translations and i18n instance
