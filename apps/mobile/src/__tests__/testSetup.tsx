/* eslint-disable import/first */
// All mocks must be defined BEFORE any imports that might use them
// Jest hoists jest.mock() calls, but we need them here to ensure they're processed first
// This prevents "Unexpected token 'export'" errors when firebase/auth is imported

// Mock expo-router with trackable navigation
export const mockPush = jest.fn();
export const mockBack = jest.fn();
export const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  })),
  useLocalSearchParams: jest.fn(() => ({})),
}));

// Mock @react-navigation/native
const mockNavigation = {
  addListener: jest.fn(() => jest.fn()), // Returns unsubscribe function
  dispatch: jest.fn(),
  goBack: jest.fn(),
  navigate: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  reset: jest.fn(),
  setParams: jest.fn(),
  setOptions: jest.fn(),
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => mockNavigation),
  useFocusEffect: jest.fn((callback) => {
    // Call the callback immediately to simulate screen focus
    if (callback) {
      callback();
    }
  }),
  ThemeProvider: ({ children }: any) => children,
  DefaultTheme: {},
}));

// Mock Firebase clients - MUST be before any imports that use firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: null,
  })),
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('firebase/firestore', () => ({
  initializeFirestore: jest.fn(),
  getFirestore: jest.fn(),
  Firestore: jest.fn(),
}));

// Mock services - MUST be before AuthContext import
jest.mock('@/services/user-profile', () => ({
  UserProfileService: jest.fn().mockImplementation(() => ({
    getUserProfile: jest.fn().mockResolvedValue(null),
    createUserProfile: jest.fn().mockResolvedValue(undefined),
    updateUserProfile: jest.fn().mockResolvedValue(undefined),
  })),
}));

jest.mock('@/services/exercises', () => ({
  ExercisesService: jest.fn().mockImplementation(() => ({
    getUserExercises: jest.fn().mockResolvedValue([]),
    createExercise: jest.fn(),
    updateExercise: jest.fn(),
    getExercise: jest.fn(),
    syncExercisesFromLanguage: jest.fn(),
  })),
}));

jest.mock('@/services/workouts', () => ({
  WorkoutsService: jest.fn().mockImplementation(() => {
    // Create a fresh workout object for each service instance
    const defaultWorkout = {
      id: 'test-workout-id',
      date: new Date('2025-01-15'),
      notes: '',
      exercises: [],
      validated: false,
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
    };

    const getWorkoutMock = jest.fn().mockResolvedValue(defaultWorkout);

    return {
      createWorkout: jest.fn().mockResolvedValue(undefined),
      getWorkout: getWorkoutMock,
      updateWorkout: jest.fn().mockResolvedValue(undefined),
      deleteWorkout: jest.fn().mockResolvedValue(undefined),
      getUserWorkouts: jest.fn(),
      validateWorkout: jest.fn().mockResolvedValue(undefined),
      unvalidateWorkout: jest.fn().mockResolvedValue(undefined),
      getLatestValidatedWorkout: jest.fn(),
    };
  }),
}));

jest.mock('@/services/programs', () => ({
  ProgramsService: jest.fn().mockImplementation(() => ({
    createProgram: jest.fn(),
    getProgram: jest.fn(),
    updateProgram: jest.fn(),
    deleteProgram: jest.fn(),
    getUserPrograms: jest.fn(),
  })),
}));

// Mock AuthService
jest.mock('@/services/auth', () => ({
  AuthService: jest.fn().mockImplementation(() => ({
    signUpWithEmail: jest.fn(),
    signInWithEmail: jest.fn(),
    signOut: jest.fn(),
    resetPassword: jest.fn(),
    getCurrentUser: jest.fn(() => null),
    toAuthUser: jest.fn((user: any) => {
      if (!user) return null;
      return {
        uid: user.uid || 'test-user-id',
        email: user.email || 'test@example.com',
        displayName: user.displayName || 'Test User',
        createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime) : null,
      };
    }),
  })),
}));

// Mock useAuthenticatedUser hook - MUST be before AuthContext import
jest.mock('@/contexts/AuthContext', () => {
  const actual = jest.requireActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuthenticatedUser: jest.fn(() => ({
      user: {
        uid: 'test-user-id',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date(),
      },
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),
    })),
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

// Mock workout prefill context
jest.mock('@/contexts/workoutPrefillContext', () => ({
  getWorkoutPrefillData: jest.fn(() => null),
  clearWorkoutPrefillData: jest.fn(),
  setWorkoutPrefillData: jest.fn(),
}));

// Mock exercise picker context to capture callbacks
jest.mock('@/contexts/exercisePickerContext', () => {
  // State must be created inside the factory
  const mockState = {
    callback: null as ((...args: any[]) => void) | null,
    context: null as any,
  };

  return {
    setExercisePickerCallback: jest.fn((callback: any, context?: any, returnPath?: string) => {
      mockState.callback = callback;
      mockState.context = context || null;
    }),
    getExercisePickerCallback: jest.fn(() => ({
      callback: mockState.callback,
      context: mockState.context,
      returnPath: null,
    })),
    clearExercisePickerCallback: jest.fn(() => {
      mockState.callback = null;
      mockState.context = null;
    }),
    // Export state for test access (using a getter function)
    __getMockState: () => mockState,
  };
});

// Mock i18n initialization
export const mockI18n: any = {
  language: 'en',
  changeLanguage: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  use: jest.fn(() => mockI18n),
  init: jest.fn(),
  t: jest.fn((key: string) => key),
  isInitialized: true,
  hasResourceBundle: jest.fn(() => true),
  getResourceBundle: jest.fn(() => ({})),
  addResourceBundle: jest.fn(),
  removeResourceBundle: jest.fn(),
  loadNamespaces: jest.fn(),
  loadLanguages: jest.fn(),
};

jest.mock('@/locale/i18n', () => ({
  default: mockI18n,
  changeLanguage: jest.fn(),
}));

// Mock react-i18next to use our mock i18n instance
jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(() => ({
    t: (key: string) => key,
    i18n: mockI18n,
  })),
  initReactI18next: {
    type: 'languageDetector',
    init: jest.fn(),
  },
}));

// Mock dayjs
jest.mock('dayjs', () => {
  const createDayjsMock = (date?: any) => {
    const mockDate = date ? new Date(date) : new Date();
    const mockInstance: any = {
      locale: jest.fn(() => mockInstance),
      format: jest.fn((formatStr?: string) => {
        // Return a simple formatted date string
        return mockDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      }),
      fromNow: jest.fn(() => 'a few seconds ago'),
      toDate: jest.fn(() => mockDate),
      valueOf: jest.fn(() => mockDate.getTime()),
      isValid: jest.fn(() => true),
      startOf: jest.fn((unit?: string) => {
        // If unit is 'day', return a new mock instance with time set to midnight
        if (unit === 'day') {
          const startOfDay = new Date(
            mockDate.getFullYear(),
            mockDate.getMonth(),
            mockDate.getDate(),
            0,
            0,
            0,
            0,
          );
          return createDayjsMock(startOfDay);
        }
        // For other units, return the same instance (chainable)
        return mockInstance;
      }),
      isSame: jest.fn((other: any, unit?: string) => {
        // Simple comparison: if unit is 'day', compare dates ignoring time
        if (unit === 'day') {
          const otherDate = other instanceof Date ? other : other?.toDate?.() || new Date();
          return (
            mockDate.getFullYear() === otherDate.getFullYear() &&
            mockDate.getMonth() === otherDate.getMonth() &&
            mockDate.getDate() === otherDate.getDate()
          );
        }
        // Default: compare timestamps
        const otherDate = other instanceof Date ? other : other?.toDate?.() || new Date();
        return mockDate.getTime() === otherDate.getTime();
      }),
      isBefore: jest.fn((other: any, unit?: string) => {
        // Simple comparison: if unit is 'day', compare dates ignoring time
        if (unit === 'day') {
          const otherDate = other instanceof Date ? other : other?.toDate?.() || new Date();
          const mockDateOnly = new Date(
            mockDate.getFullYear(),
            mockDate.getMonth(),
            mockDate.getDate(),
          );
          const otherDateOnly = new Date(
            otherDate.getFullYear(),
            otherDate.getMonth(),
            otherDate.getDate(),
          );
          return mockDateOnly.getTime() < otherDateOnly.getTime();
        }
        // Default: compare timestamps
        const otherDate = other instanceof Date ? other : other?.toDate?.() || new Date();
        return mockDate.getTime() < otherDate.getTime();
      }),
    };
    return mockInstance;
  };

  const mockDayjs: any = jest.fn(createDayjsMock);
  // Add static methods that dayjs might have
  mockDayjs.locale = jest.fn(() => mockDayjs);
  mockDayjs.extend = jest.fn();
  return mockDayjs;
});

// Mock dayjs locale imports (they're side-effect imports)
jest.mock('dayjs/locale/es', () => ({}));
jest.mock('dayjs/locale/fr', () => ({}));

// NOW we can safely import modules that don't depend on firebase
// Note: We'll use dynamic imports for AuthProvider and related modules to avoid
// triggering firebase/auth import during module evaluation
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { DependenciesProvider } from '@/dependencies/provider';
import { createDependencies } from '@/dependencies/createDependencies';
import { createClients } from '@/clients/createClients';
import { createConfig } from '@/config';
import { tamaguiConfig } from 'tamagui.config';

// Helper to get the exercise picker mock state
export const getExercisePickerMockState = () => {
  const mockModule = jest.requireMock('@/contexts/exercisePickerContext') as {
    __getMockState: () => { callback: any; context: any };
  };
  return mockModule.__getMockState();
};

// Helper to reset all mocks
export const resetAllMocks = () => {
  jest.clearAllMocks();
  mockPush.mockClear();
  mockBack.mockClear();
  mockReplace.mockClear();

  const mockState = getExercisePickerMockState();
  mockState.callback = null;
  mockState.context = null;

  const ExercisesService = jest.requireMock('@/services/exercises').ExercisesService;
  ExercisesService.mockImplementation(() => ({
    getUserExercises: jest.fn().mockResolvedValue([]),
    createExercise: jest.fn(),
    updateExercise: jest.fn(),
    getExercise: jest.fn(),
    syncExercisesFromLanguage: jest.fn(),
  }));

  const workoutPrefillContext = jest.requireMock('@/contexts/workoutPrefillContext');
  workoutPrefillContext.getWorkoutPrefillData.mockReturnValue(null);
  workoutPrefillContext.clearWorkoutPrefillData.mockClear();
};

// Create test wrapper with all providers
export function createTestWrapper() {
  // Use require to defer imports until mocks are applied
  const { AuthProvider } = require('@/contexts/AuthContext');
  const { UserPreferencesProvider } = require('@/contexts/UserPreferencesContext');

  const config = createConfig({
    firebase: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain',
      projectId: 'test-project-id',
      storageBucket: 'test-storage-bucket',
      messagingSenderId: 'test-messaging-sender-id',
      appId: 'test-app-id',
    },
  });

  const clients = createClients(config);
  const dependencies = createDependencies(clients);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <DependenciesProvider dependencies={dependencies}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <UserPreferencesProvider>
              <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
                <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
              </TamaguiProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </QueryClientProvider>
      </DependenciesProvider>
    );
  };
}

// Helper to create test wrapper with custom workout mock
export function createTestWrapperWithWorkout(workout: any) {
  // Use require to defer imports until mocks are applied
  const { AuthProvider } = require('@/contexts/AuthContext');
  const { UserPreferencesProvider } = require('@/contexts/UserPreferencesContext');

  const WorkoutsService = jest.requireMock('@/services/workouts').WorkoutsService;
  WorkoutsService.mockImplementation(() => ({
    createWorkout: jest.fn().mockResolvedValue(undefined),
    getWorkout: jest.fn().mockResolvedValue(workout),
    updateWorkout: jest.fn().mockResolvedValue(undefined),
    deleteWorkout: jest.fn().mockResolvedValue(undefined),
    getUserWorkouts: jest.fn(),
    validateWorkout: jest.fn().mockResolvedValue(undefined),
    unvalidateWorkout: jest.fn().mockResolvedValue(undefined),
    getLatestValidatedWorkout: jest.fn(),
  }));

  const config = createConfig({
    firebase: {
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain',
      projectId: 'test-project-id',
      storageBucket: 'test-storage-bucket',
      messagingSenderId: 'test-messaging-sender-id',
      appId: 'test-app-id',
    },
  });

  const clients = createClients(config);
  const dependencies = createDependencies(clients);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return function TestWrapperWithMocks({ children }: { children: React.ReactNode }) {
    return (
      <DependenciesProvider dependencies={dependencies}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <UserPreferencesProvider>
              <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
                <ThemeProvider value={DefaultTheme}>{children}</ThemeProvider>
              </TamaguiProvider>
            </UserPreferencesProvider>
          </AuthProvider>
        </QueryClientProvider>
      </DependenciesProvider>
    );
  };
}

// Common exercise data for tests
export const EXERCISES = {
  BENCH_PRESS: {
    id: 'bench-press',
    name: 'Bench Press',
    allowedUnits: ['load', 'reps'],
  },
  SQUAT: {
    id: 'squat',
    name: 'Squat',
    allowedUnits: ['load', 'reps'],
  },
  DEADLIFT: {
    id: 'deadlift',
    name: 'Deadlift',
    allowedUnits: ['load', 'reps'],
  },
  PUSH_UPS: {
    id: 'push-ups',
    name: 'Push Ups',
    allowedUnits: ['reps'],
  },
  PULL_UPS: {
    id: 'pull-ups',
    name: 'Pull Ups',
    allowedUnits: ['reps'],
  },
} as const;
