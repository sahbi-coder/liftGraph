// Import testSetup FIRST to ensure mocks are hoisted before any other imports
import {
  mockPush,
  mockBack,
  createTestWrapper,
  createTestWrapperWithWorkout,
  getExercisePickerMockState,
  resetAllMocks,
  EXERCISES,
} from '../../testSetup';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import EditWorkout from '@/app/(drawer)/(tabs)/schedule/edit';

// Override useLocalSearchParams for edit screen (needs workoutId param)
const expoRouter = jest.requireMock('expo-router');
expoRouter.useLocalSearchParams.mockReturnValue({ workoutId: 'test-workout-id' });

describe('Schedule EditWorkout Screen', () => {
  const TestWrapper = createTestWrapper();

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

  beforeEach(() => {
    resetAllMocks();
    // Reset useLocalSearchParams for edit screen
    expoRouter.useLocalSearchParams.mockReturnValue({ workoutId: 'test-workout-id' });
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

    expect(mockPush).toHaveBeenCalledWith('/(drawer)/(tabs)/schedule/exercises');
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
