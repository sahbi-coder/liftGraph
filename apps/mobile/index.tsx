import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

export function App() {
  // @ts-ignore - context is available at runtime but not recognised by TS
  const ctx = require.context('./src/app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
