import { renderHook, act } from '@testing-library/react-native';
import { useExerciseSelection } from './useExerciseSelection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { setExercisePickerCallback } from '@/contexts/exercisePickerContext';
// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/contexts/exercisePickerContext', () => ({
  setExercisePickerCallback: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  const mockStorage: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
        return Promise.resolve();
      }),
    },
  };
});

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockSetExercisePickerCallback = setExercisePickerCallback as jest.MockedFunction<
  typeof setExercisePickerCallback
>;

describe('useExerciseSelection', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue(mockRouter as any);
    // Reset AsyncStorage mocks to return null (no persisted data)
    // The mock is already set up to return promises, just reset the return values
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('initialization', () => {
    it('should initialize with default exercise', () => {
      const { result } = renderHook(() => useExerciseSelection());

      expect(result.current.selectedExercise).toEqual({ id: 'squat', name: 'Squat' });
    });

    it('should initialize with custom default exercise', () => {
      const defaultExercise = { id: 'bench', name: 'Bench Press' };
      const { result } = renderHook(() => useExerciseSelection({ defaultExercise }));

      expect(result.current.selectedExercise).toEqual(defaultExercise);
    });

    it('should use default exercise picker path', () => {
      renderHook(() => useExerciseSelection());

      // Verify router.push is not called on initialization
      expect(mockRouter.push).not.toHaveBeenCalled();
    });

    it('should use custom exercise picker path', () => {
      const customPath = '/custom/path';
      renderHook(() => useExerciseSelection({ exercisePickerPath: customPath }));

      // Path is only used when opening picker
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('setSelectedExercise', () => {
    it('should update selected exercise', () => {
      const { result } = renderHook(() => useExerciseSelection());

      const newExercise = { id: 'deadlift', name: 'Deadlift' };

      act(() => {
        result.current.setSelectedExercise(newExercise);
      });

      expect(result.current.selectedExercise).toEqual(newExercise);
    });

    it('should update selected exercise multiple times', () => {
      const { result } = renderHook(() => useExerciseSelection());

      act(() => {
        result.current.setSelectedExercise({ id: 'bench', name: 'Bench Press' });
      });

      expect(result.current.selectedExercise.id).toBe('bench');

      act(() => {
        result.current.setSelectedExercise({ id: 'squat', name: 'Squat' });
      });

      expect(result.current.selectedExercise.id).toBe('squat');
    });
  });

  describe('handleExerciseSelect', () => {
    it('should update selected exercise when called', () => {
      const { result } = renderHook(() => useExerciseSelection());

      const exerciseSelection = {
        id: 'deadlift',
        name: 'Deadlift',
        allowedUnits: ['load', 'reps'],
      };

      act(() => {
        result.current.handleExerciseSelect(exerciseSelection);
      });

      expect(result.current.selectedExercise).toEqual({
        id: 'deadlift',
        name: 'Deadlift',
      });
    });

    it('should handle exercise selection with different format', () => {
      const { result } = renderHook(() => useExerciseSelection());

      act(() => {
        result.current.handleExerciseSelect({
          id: 'ohp',
          name: 'Overhead Press',
          allowedUnits: [],
        });
      });

      expect(result.current.selectedExercise).toEqual({
        id: 'ohp',
        name: 'Overhead Press',
      });
    });
  });

  describe('handleOpenExercisePicker', () => {
    it('should set exercise picker callback and navigate to picker', () => {
      const { result } = renderHook(() => useExerciseSelection());

      act(() => {
        result.current.handleOpenExercisePicker();
      });

      expect(mockSetExercisePickerCallback).toHaveBeenCalledWith(expect.any(Function));
      expect(mockRouter.push).toHaveBeenCalledWith('/(tabs)/progress/exercises');
    });

    it('should use custom exercise picker path when provided', () => {
      const customPath = '/custom/exercise/picker';
      const { result } = renderHook(() => useExerciseSelection({ exercisePickerPath: customPath }));

      act(() => {
        result.current.handleOpenExercisePicker();
      });

      expect(mockRouter.push).toHaveBeenCalledWith(customPath);
    });

    it('should set callback that updates selected exercise', () => {
      const { result } = renderHook(() => useExerciseSelection());

      act(() => {
        result.current.handleOpenExercisePicker();
      });

      // Get the callback that was set
      const callback = mockSetExercisePickerCallback.mock.calls[0][0];

      // Call the callback with an exercise selection
      act(() => {
        callback({ id: 'bench', name: 'Bench Press', allowedUnits: ['load', 'reps'] });
      });

      expect(result.current.selectedExercise).toEqual({
        id: 'bench',
        name: 'Bench Press',
      });
    });

    it('should update callback when handleExerciseSelect changes', () => {
      const { result, rerender } = renderHook(() => useExerciseSelection());

      act(() => {
        result.current.handleOpenExercisePicker();
      });

      const firstCallback = mockSetExercisePickerCallback.mock.calls[0][0];

      // Rerender to trigger new callback
      rerender({});

      act(() => {
        result.current.handleOpenExercisePicker();
      });

      const secondCallback = mockSetExercisePickerCallback.mock.calls[1][0];

      // Both callbacks should work
      act(() => {
        firstCallback({ id: 'squat', name: 'Squat', allowedUnits: ['load', 'reps'] });
      });

      expect(result.current.selectedExercise.id).toBe('squat');

      act(() => {
        secondCallback({ id: 'deadlift', name: 'Deadlift', allowedUnits: ['load', 'reps'] });
      });

      expect(result.current.selectedExercise.id).toBe('deadlift');
    });
  });

  describe('integration', () => {
    it('should work with full flow: open picker -> select exercise', () => {
      const { result } = renderHook(() => useExerciseSelection());

      // Initial state
      expect(result.current.selectedExercise.id).toBe('squat');

      // Open picker
      act(() => {
        result.current.handleOpenExercisePicker();
      });

      expect(mockSetExercisePickerCallback).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalled();

      // Simulate exercise selection from picker
      const callback = mockSetExercisePickerCallback.mock.calls[0][0];
      act(() => {
        callback({ id: 'bench', name: 'Bench Press', allowedUnits: ['load', 'reps'] });
      });

      expect(result.current.selectedExercise).toEqual({
        id: 'bench',
        name: 'Bench Press',
      });
    });

    it('should allow manual exercise update without picker', () => {
      const { result } = renderHook(() => useExerciseSelection());

      act(() => {
        result.current.setSelectedExercise({ id: 'ohp', name: 'Overhead Press' });
      });

      expect(result.current.selectedExercise.id).toBe('ohp');
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });
});
