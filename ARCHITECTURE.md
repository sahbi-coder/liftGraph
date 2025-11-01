# LiftGraph Architecture

This document describes the architecture and design patterns used in LiftGraph, inspired by the Junior project.

## Design Philosophy

LiftGraph follows a clean, scalable architecture that prioritizes:
- **Type Safety**: TypeScript everywhere
- **Component Reusability**: Shared packages for common code
- **Developer Experience**: Fast feedback loops with hot reload
- **Maintainability**: Clear separation of concerns
- **Scalability**: Easy to add new features

## Architecture Patterns from Junior

### 1. Monorepo Structure
```
liftGraph/
├── apps/           # Applications
│   └── mobile/     # React Native app
└── packages/       # Shared packages
    └── common/     # Shared types and utilities
```

**Why?**
- Share code between apps (if we add web/backend later)
- Centralized dependency management
- Single source of truth for types
- Atomic commits across related changes

### 2. Expo Router (File-Based Routing)

```typescript
// apps/mobile/src/app/index.tsx -> Route: "/"
// apps/mobile/src/app/workout/[id].tsx -> Route: "/workout/:id"
```

**Benefits:**
- Intuitive route structure
- Automatic deep linking
- Type-safe navigation with TypeScript
- Less boilerplate vs React Navigation

### 3. Tamagui UI System

```typescript
// tamagui.config.ts
themes: {
  light: {
    background: '#FFFFFF',
    primaryButton: '#FF5722',
    // ...
  },
}

// Usage in components:
<Button backgroundColor="$primaryButton">Click Me</Button>
```

**Advantages:**
- Consistent design system
- Type-safe styles
- Optimized for React Native performance
- Easy theming (light/dark mode)

### 4. TypeScript Configuration

```
tsconfig/
├── base.json       # Base config for all packages
└── expo.base.json  # Extended config for Expo apps
```

**Features:**
- Strict type checking
- Path aliases (`@/` for src/)
- Composite projects for monorepo
- Shared compiler options

### 5. Provider Pattern

```typescript
// _layout.tsx
<TamaguiProvider>
  <ThemeProvider>
    <Screen />
  </ThemeProvider>
</TamaguiProvider>
```

**Purpose:**
- Global state management
- Theme context
- Future: Auth, API clients, etc.

## Key Architectural Decisions

### State Management

**Current:** React hooks (`useState`, `useEffect`)

**Future Considerations:**
- Add `@tanstack/react-query` for server state (like Junior)
- Add `zustand` or `@xstate/react` for complex client state
- Keep local component state simple

### Data Flow

```
User Input
    ↓
Component (View)
    ↓
Custom Hooks (Logic)
    ↓
Data Layer (Storage/API)
```

### Styling Strategy

1. **Tamagui Components**: Primary UI building blocks
2. **Theme Tokens**: Use `$` prefixed tokens (e.g., `$primaryButton`)
3. **Custom Components**: Build on top of Tamagui primitives
4. **Responsive**: Use Tamagui's media queries

Example:
```typescript
<YStack 
  padding="$4"           // Theme token
  $gtMd={{ padding: "$6" }}  // Responsive
>
  <Text>Content</Text>
</YStack>
```

### File Organization

```
apps/mobile/src/
├── app/              # Routes (Expo Router)
│   ├── _layout.tsx   # Root layout
│   └── index.tsx     # Home screen
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── theme/           # Theme configuration
├── utils/           # Helper functions
└── types/           # TypeScript types
```

### Component Patterns

**1. Screen Components** (Routes)
- Located in `src/app/`
- Handle navigation
- Compose smaller components
- Minimal business logic

**2. UI Components**
- Located in `src/components/`
- Pure, reusable
- Accept props for customization
- Use Tamagui primitives

**3. Custom Hooks**
- Located in `src/hooks/`
- Encapsulate logic
- Reusable across components
- Return data and actions

## Patterns for Powerlifting Features

### Workout Tracking

```typescript
// Future structure
src/
├── workouts/
│   ├── hooks/
│   │   ├── useWorkout.ts
│   │   └── useWorkouts.ts
│   ├── components/
│   │   ├── WorkoutCard.tsx
│   │   └── ExerciseSet.tsx
│   └── types.ts
```

### Data Persistence Strategy

**Options:**
1. **AsyncStorage**: Simple key-value (good for settings)
2. **SQLite**: Structured data (better for workouts)
3. **Firebase**: Cloud sync (future enhancement)

**Recommendation:** Start with AsyncStorage, migrate to SQLite when needed.

## Performance Considerations

### From Junior Project

1. **Lazy Loading**: Load screens on demand
2. **Memoization**: Use `React.memo()` for expensive components
3. **Image Optimization**: Use `expo-image` for caching
4. **List Virtualization**: `FlashList` for long lists

### LiftGraph Specific

1. **Workout Lists**: Virtualize with pagination
2. **Charts**: Lazy load chart library
3. **Images**: Optimize exercise demonstration images
4. **Offline First**: Cache data locally

## Testing Strategy

### Unit Tests
```typescript
// packages/common/src/__tests__/types.test.ts
describe('WorkoutSchema', () => {
  it('validates workout data', () => {
    const result = WorkoutSchema.parse(validWorkout);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// apps/mobile/src/app/__tests__/index.test.tsx
describe('Home Screen', () => {
  it('renders correctly', () => {
    render(<IndexRoute />);
    expect(screen.getByText('LiftGraph')).toBeTruthy();
  });
});
```

## Security Considerations

1. **No sensitive data in source code**
2. **Use environment variables** for API keys
3. **Validate user input** with Zod schemas
4. **Sanitize data** before storage/display

## Scalability Path

### Phase 1: MVP (Current)
- ✅ Project structure
- ✅ Home screen
- 🎯 Basic workout logging
- 🎯 Local data storage

### Phase 2: Enhanced Features
- Progress tracking
- Charts and analytics
- Exercise library
- Workout templates

### Phase 3: Social Features
- User accounts
- Cloud sync
- Share workouts
- Community features

### Phase 4: Advanced
- AI-powered suggestions
- Form check with camera
- Wearable integration
- Coach/trainer mode

## Comparison: Junior vs LiftGraph

| Feature | Junior | LiftGraph |
|---------|--------|-----------|
| **Purpose** | Kids English learning | Powerlifting tracking |
| **UI Library** | Tamagui | Tamagui ✓ |
| **Routing** | Expo Router | Expo Router ✓ |
| **State** | React Query + XState | To be determined |
| **Backend** | Firebase | To be determined |
| **Auth** | Firebase Auth + OAuth | To be added |
| **CMS** | Storyblok | Not needed |
| **Monorepo** | Yarn Workspaces | Yarn Workspaces ✓ |

## Extensibility

The architecture supports adding:
- **Backend** → Add `apps/backend/` with Firebase Functions
- **Web App** → Add `apps/web/` sharing code with mobile
- **Admin Panel** → Add `apps/admin/` for content management
- **More Packages** → Add `packages/api/`, `packages/ui/`, etc.

## Best Practices

1. **Keep components small** - Single responsibility
2. **Use TypeScript strictly** - No `any` types
3. **Write tests** - Test business logic
4. **Document complex logic** - Comments for "why", not "what"
5. **Follow conventions** - Consistent naming and structure
6. **Optimize later** - Make it work, then make it fast

## Resources

- [React Native Best Practices](https://reactnative.dev/docs/performance)
- [Expo Router Documentation](https://docs.expo.dev/router/)
- [Tamagui Documentation](https://tamagui.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

This architecture provides a solid foundation for building a scalable, maintainable powerlifting tracking app while learning from the proven patterns in the Junior project.

