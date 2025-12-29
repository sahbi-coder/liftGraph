import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from 'tamagui';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import EditWorkout from '@/app/(drawer)/(tabs)/workout/edit';
import { DependenciesProvider } from '@/dependencies/provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { createDependencies } from '@/dependencies/createDependencies';
import { createClients } from '@/clients/createClients';
import { createConfig } from '@/config';
import { tamaguiConfig } from 'tamagui.config';

// Mock expo-router with trackable navigation
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
  })),
  useLocalSearchParams: jest.fn(() => ({ workoutId: 'test-workout-id' })),
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

// Mock Firebase clients
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApp: jest.fn(),
  getApps: jest.fn(() => []),
}));

// Mock useAuthenticatedUser hook
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

// Mock FirestoreService methods that AuthProvider uses
// We need to mock the service methods but keep the class structure
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

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

// Mock workout prefill context (these are simple module-level functions)
jest.mock('@/contexts/workoutPrefillContext', () => ({
  getWorkoutPrefillData: jest.fn(() => null),
  clearWorkoutPrefillData: jest.fn(),
}));

// Mock exercise picker context to capture callbacks
// Use a pattern that Jest allows - create state inside factory
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
const mockI18n: any = {
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

// Common exercise data
const EXERCISES = {
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

// Create test wrapper with all providers
function createTestWrapper() {
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

describe('EditWorkout Screen', () => {
  const TestWrapper = createTestWrapper();

  // Helper to get the mock state
  const getExercisePickerMockState = () => {
    const mockModule = jest.requireMock('@/contexts/exercisePickerContext') as {
      __getMockState: () => { callback: any; context: any };
    };
    return mockModule.__getMockState();
  };

  // Helper to add an exercise to the form
  const addExercise = async (exercise: (typeof EXERCISES)[keyof typeof EXERCISES]) => {
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);
    const mockState = getExercisePickerMockState();
    mockState.callback(exercise);
    // Wait for exercise to appear (by name, index may vary)
    await waitFor(() => {
      expect(screen.getByText(new RegExp(exercise.name))).toBeTruthy();
    });
  };

  // Helper to set input value by placeholder
  const setInputValue = (placeholder: string, value: string, index = 0) => {
    const inputs = screen.getAllByPlaceholderText(placeholder);
    expect(inputs.length).toBeGreaterThan(index);
    fireEvent.changeText(inputs[index], value);
  };

  // Helper to check button state
  const checkButtonState = async (enabled: boolean) => {
    const button = await screen.findByTestId('create-workout-button');
    expect(button.props.style.opacity).toBe(enabled ? 1 : 0.6);
  };

  // Helper to create test wrapper with custom workout mock
  const createTestWrapperWithWorkout = (workout: any) => {
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
  };

  // Helper to reset all mocks
  const resetMocks = () => {
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

  beforeEach(() => {
    resetMocks();
  });

  it('should render the workout form', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    // findByTestId automatically waits for the element to appear
    const workoutForm = await screen.findByTestId('workout-form');
    expect(workoutForm).toBeTruthy();
  });

  it('should navigate to exercises screen when add exercise button is pressed', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    expect(mockPush).toHaveBeenCalledWith('/(drawer)/(tabs)/workout/exercises');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should render exercise when exercise is selected', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);
    expect(await screen.findByText('1. Bench Press')).toBeTruthy();
  });

  it('should keep button disabled initially', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await checkButtonState(false);
  });

  it('should keep button disabled when weighted exercise is added with default empty set', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await checkButtonState(false);
    await addExercise(EXERCISES.BENCH_PRESS);
    await checkButtonState(false);
  });

  it('should keep button disabled when bodyweight exercise is added with default empty set', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.PUSH_UPS);
    await checkButtonState(false);
  });

  it('should render and keep button disabled with mixed weighted and bodyweight exercises', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.SQUAT);
    await addExercise(EXERCISES.PULL_UPS);

    expect(screen.getByText(/Squat/)).toBeTruthy();
    expect(screen.getByText(/Pull Ups/)).toBeTruthy();
    await checkButtonState(false);
  });

  it('should keep button disabled when multiple weighted exercises are added', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);
    await addExercise(EXERCISES.DEADLIFT);

    expect(screen.getByText(/Bench Press/)).toBeTruthy();
    expect(screen.getByText(/Deadlift/)).toBeTruthy();
    await checkButtonState(false);
  });

  it('should keep button disabled when multiple bodyweight exercises are added', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.PUSH_UPS);
    await addExercise(EXERCISES.PULL_UPS);

    expect(screen.getByText(/Push Ups/)).toBeTruthy();
    expect(screen.getByText(/Pull Ups/)).toBeTruthy();
    await checkButtonState(false);
  });

  it('should enable button when bodyweight exercise has valid reps and RIR', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.PUSH_UPS);
    setInputValue('common.reps', '10');
    setInputValue('workout.rir', '2');
    await waitFor(() => checkButtonState(true));
  });

  it('should enable button when weighted exercise has valid weight, reps, and RIR', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);
    setInputValue('common.weight', '100');
    setInputValue('common.reps', '8');
    setInputValue('workout.rir', '1');
    await waitFor(() => checkButtonState(true));
  });

  it('should keep button disabled when RIR is out of range (> 10)', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.PUSH_UPS);
    setInputValue('common.reps', '10');
    setInputValue('workout.rir', '11');
    await checkButtonState(false);
  });

  it('should keep button disabled when weighted exercise has reps but no weight', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);
    setInputValue('common.reps', '8');
    setInputValue('workout.rir', '2');
    await checkButtonState(false);
  });

  it('should add a new set when add set button is pressed', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);

    expect(screen.getAllByPlaceholderText('common.reps').length).toBe(1);
    const addSetButtons = screen.getAllByText('workout.addSet');
    fireEvent.press(addSetButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('common.reps').length).toBe(2);
    });
  });

  it('should duplicate previous set when duplicate button is pressed', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);

    setInputValue('common.weight', '100');
    setInputValue('common.reps', '8');
    setInputValue('workout.rir', '2');

    const duplicateButtons = screen.getAllByText('workout.duplicate');
    fireEvent.press(duplicateButtons[0]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText('common.reps').length).toBe(2);
    });

    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');

    expect(weightInputs[1].props.value).toBe('100');
    expect(repsInputs[1].props.value).toBe('8');
    expect(rirInputs[1].props.value).toBe('2');
  });

  it('should remove exercise when remove exercise button is pressed', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);
    await addExercise(EXERCISES.SQUAT);

    expect(screen.getByText(/Bench Press/)).toBeTruthy();
    expect(screen.getByText(/Squat/)).toBeTruthy();

    const removeButton = screen.getByTestId('remove-exercise-button-0');
    fireEvent.press(removeButton);

    await waitFor(() => {
      expect(screen.queryByText(/Bench Press/)).toBeNull();
      expect(screen.getByText(/Squat/)).toBeTruthy();
    });
  });

  it('should show modal with correct text when trying to remove the only set of an exercise', async () => {
    render(
      <TestWrapper>
        <EditWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');
    await addExercise(EXERCISES.BENCH_PRESS);

    expect(screen.getAllByPlaceholderText('common.reps').length).toBe(1);
    const removeSetButton = screen.getByTestId('remove-set-button-0-0');
    fireEvent.press(removeSetButton);

    await waitFor(() => {
      expect(screen.getByText('workout.eachExerciseMustHaveSet')).toBeTruthy();
    });

    expect(screen.getAllByPlaceholderText('common.reps').length).toBe(1);
  });

  it('should render correctly with initial workout data', async () => {
    const mockWorkout = {
      id: 'test-workout-id',
      date: new Date('2025-01-15'),
      notes: 'My workout notes',
      validated: false,
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-15'),
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Bench Press',
          order: 0,
          sets: [
            { weight: 100, reps: 8, rir: 2 },
            { weight: 100, reps: 8, rir: 2 },
          ],
        },
        {
          exerciseId: 'push-ups',
          name: 'Push Ups',
          order: 1,
          sets: [{ weight: 0, reps: 12, rir: 1 }],
        },
      ],
    };

    const ExercisesService = jest.requireMock('@/services/exercises').ExercisesService;
    ExercisesService.mockImplementation(() => ({
      getUserExercises: jest.fn().mockResolvedValue([
        {
          id: 'bench-press',
          name: 'Bench Press',
          category: 'Barbell',
          body_part: 'Chest',
          allowedUnits: ['load', 'reps'],
        },
        {
          id: 'push-ups',
          name: 'Push Ups',
          category: 'Bodyweight',
          body_part: 'Chest',
          allowedUnits: ['reps'],
        },
      ]),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      getExercise: jest.fn(),
      syncExercisesFromLanguage: jest.fn(),
    }));

    const TestWrapperWithMocks = createTestWrapperWithWorkout(mockWorkout);

    render(
      <TestWrapperWithMocks>
        <EditWorkout />
      </TestWrapperWithMocks>,
    );

    await screen.findByTestId('workout-form');

    expect(await screen.findByText(/Bench Press/)).toBeTruthy();
    expect(await screen.findByText(/Push Ups/)).toBeTruthy();

    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    expect(weightInputs.length).toBeGreaterThanOrEqual(2);
    expect(weightInputs[0].props.value).toBe('100');
    expect(weightInputs[1].props.value).toBe('100');

    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputs.length).toBe(3);
    expect(repsInputs[0].props.value).toBe('8');
    expect(repsInputs[1].props.value).toBe('8');
    expect(repsInputs[2].props.value).toBe('12');

    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    expect(rirInputs.length).toBe(3);
    expect(rirInputs[0].props.value).toBe('2');
    expect(rirInputs[1].props.value).toBe('2');
    expect(rirInputs[2].props.value).toBe('1');
  });

  it('should not render validate workout button for future workouts', async () => {
    // Create a workout with a future date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const futureWorkout = {
      id: 'test-workout-id',
      date: tomorrow,
      notes: '',
      validated: false,
      createdAt: tomorrow,
      updatedAt: tomorrow,
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Bench Press',
          order: 0,
          sets: [{ weight: 100, reps: 8, rir: 2 }],
        },
      ],
    };

    const ExercisesService = jest.requireMock('@/services/exercises').ExercisesService;
    ExercisesService.mockImplementation(() => ({
      getUserExercises: jest.fn().mockResolvedValue([
        {
          id: 'bench-press',
          name: 'Bench Press',
          category: 'Barbell',
          body_part: 'Chest',
          allowedUnits: ['load', 'reps'],
        },
      ]),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      getExercise: jest.fn(),
      syncExercisesFromLanguage: jest.fn(),
    }));

    const TestWrapperWithMocks = createTestWrapperWithWorkout(futureWorkout);

    render(
      <TestWrapperWithMocks>
        <EditWorkout />
      </TestWrapperWithMocks>,
    );

    await screen.findByTestId('workout-form');

    // Verify validate button is not rendered (should not find it)
    const validateButton = screen.queryByText('workout.validateWorkout');
    expect(validateButton).toBeNull();
  });

  it('should route back when validate workout button is pressed', async () => {
    // Create a workout with today's date (so validate button is shown)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWorkout = {
      id: 'test-workout-id',
      date: today,
      notes: '',
      validated: false,
      createdAt: today,
      updatedAt: today,
      exercises: [
        {
          exerciseId: 'bench-press',
          name: 'Bench Press',
          order: 0,
          sets: [{ weight: 100, reps: 8, rir: 2 }],
        },
      ],
    };

    const ExercisesService = jest.requireMock('@/services/exercises').ExercisesService;
    ExercisesService.mockImplementation(() => ({
      getUserExercises: jest.fn().mockResolvedValue([
        {
          id: 'bench-press',
          name: 'Bench Press',
          category: 'Barbell',
          body_part: 'Chest',
          allowedUnits: ['load', 'reps'],
        },
      ]),
      createExercise: jest.fn(),
      updateExercise: jest.fn(),
      getExercise: jest.fn(),
      syncExercisesFromLanguage: jest.fn(),
    }));

    const TestWrapperWithMocks = createTestWrapperWithWorkout(todayWorkout);

    render(
      <TestWrapperWithMocks>
        <EditWorkout />
      </TestWrapperWithMocks>,
    );

    await screen.findByTestId('workout-form');

    // Verify validate button is rendered
    const validateButton = await screen.findByText('workout.validateWorkout');
    expect(validateButton).toBeTruthy();

    // Press the validate button
    fireEvent.press(validateButton);

    // Wait for router.back() to be called (it's called after 1.5 seconds in the handler)
    await waitFor(
      () => {
        expect(mockBack).toHaveBeenCalled();
      },
      { timeout: 2000 },
    );
  });
});
