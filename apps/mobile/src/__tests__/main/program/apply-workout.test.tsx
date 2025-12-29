// Import testSetup FIRST to ensure mocks are hoisted before any other imports
import {
  mockPush,
  mockBack,
  createTestWrapper,
  getExercisePickerMockState,
  resetAllMocks,
} from '../../testSetup';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ApplyWorkout from '@/app/(drawer)/(tabs)/program/apply-workout';

describe('ApplyWorkout Screen', () => {
  const TestWrapper = createTestWrapper();

  beforeEach(() => {
    resetAllMocks();
  });

  it('should render the workout form', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    // findByTestId automatically waits for the element to appear
    const workoutForm = await screen.findByTestId('workout-form');
    expect(workoutForm).toBeTruthy();
  });

  it('should render correctly with initial prefill data', async () => {
    // Mock prefill data with exercises
    const mockPrefillData = {
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

    // Mock exercises service to return the exercises so the form can map them correctly
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

    // Mock getWorkoutPrefillData to return the prefill data
    const workoutPrefillContext = jest.requireMock('@/contexts/workoutPrefillContext');
    workoutPrefillContext.getWorkoutPrefillData.mockReturnValueOnce(mockPrefillData);

    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    // Wait for the form to render
    await screen.findByTestId('workout-form');

    // Verify that both exercises from prefill data are rendered with correct order
    const benchPressExercise = await screen.findByText('1. Bench Press');
    expect(benchPressExercise).toBeTruthy();

    const pushUpsExercise = await screen.findByText('2. Push Ups');
    expect(pushUpsExercise).toBeTruthy();

    // Verify that the sets are rendered correctly
    // For Bench Press (weighted exercise), we should see weight inputs with values
    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    // We expect at least 2 weight inputs for bench press sets
    // (Note: If exercises data hasn't loaded yet, bodyweight exercise might temporarily show weight input)
    expect(weightInputs.length).toBeGreaterThanOrEqual(2);
    // Both sets of bench press should have weight value "100" (converted to string, kg unit)
    // Check the first two weight inputs which should be from bench press
    expect(weightInputs[0].props.value).toBe('100');
    expect(weightInputs[1].props.value).toBe('100');

    // Verify reps inputs - we should have 3 sets total (2 for bench press + 1 for push ups)
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputs.length).toBe(3);
    // First set of bench press should have 8 reps
    expect(repsInputs[0].props.value).toBe('8');
    // Second set of bench press should have 8 reps
    expect(repsInputs[1].props.value).toBe('8');
    // Push ups set should have 12 reps
    expect(repsInputs[2].props.value).toBe('12');

    // Verify RIR inputs
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    expect(rirInputs.length).toBe(3);
    // First set of bench press should have RIR 2
    expect(rirInputs[0].props.value).toBe('2');
    // Second set of bench press should have RIR 2
    expect(rirInputs[1].props.value).toBe('2');
    // Push ups set should have RIR 1
    expect(rirInputs[2].props.value).toBe('1');

    // Verify that clearWorkoutPrefillData was called after reading the data
    expect(workoutPrefillContext.clearWorkoutPrefillData).toHaveBeenCalled();
  });

  it('should navigate to exercises screen when add exercise button is pressed', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    // Wait for the form to render
    await screen.findByTestId('workout-form');

    // Find the "Add Exercise" button by testID
    const addExerciseButton = await screen.findByTestId('add-exercise-button');

    // Press the button
    fireEvent.press(addExerciseButton);

    // Assert that router.push was called with the program exercises path
    expect(mockPush).toHaveBeenCalledWith('/(drawer)/(tabs)/program/exercises');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should render exercise when exercise is selected', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    // Wait for the form to render
    await screen.findByTestId('workout-form');

    // Press the "Add Exercise" button to set up the callback
    // (This is needed to initialize the exercise selection handler)
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    // Get the captured callback from the mock state
    const mockState = getExercisePickerMockState();

    // Directly call the exercise selection callback with mock data
    const mockExercise = {
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    };

    mockState.callback(mockExercise);

    // Wait for the exercise to appear in the form
    // The exercise name should be displayed as "1. Bench Press" (index + 1. name)
    const exerciseName = await screen.findByText('1. Bench Press');
    expect(exerciseName).toBeTruthy();
  });

  it('should keep button disabled initially', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Verify that the Create Workout button is initially disabled
    // Since Tamagui Button doesn't expose disabled directly on props,
    // we check the opacity style prop which is set to 0.6 when disabled
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton).toBeTruthy();
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when weighted exercise with default set is added', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add weighted exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    const weightedExercise = {
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    };

    mockState.callback(weightedExercise);

    await screen.findByText('1. Bench Press');

    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton).toBeTruthy();
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when bodyweight exercise with default set is added', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add bodyweight exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    const bodyweightExercise = {
      id: 'push-ups',
      name: 'Push Ups',
      allowedUnits: ['reps'],
    };

    mockState.callback(bodyweightExercise);

    await screen.findByText('1. Push Ups');

    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton).toBeTruthy();
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when mixed weighted and bodyweight exercises are added', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    const addExerciseButton = await screen.findByTestId('add-exercise-button');

    // Add weighted exercise
    fireEvent.press(addExerciseButton);
    const mockState1 = getExercisePickerMockState();
    mockState1.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });
    await screen.findByText('1. Bench Press');

    // Add bodyweight exercise
    fireEvent.press(addExerciseButton);
    const mockState2 = getExercisePickerMockState();
    mockState2.callback({
      id: 'push-ups',
      name: 'Push Ups',
      allowedUnits: ['reps'],
    });
    await screen.findByText('2. Push Ups');

    // Verify both exercises are rendered
    expect(screen.getByText('1. Bench Press')).toBeTruthy();
    expect(screen.getByText('2. Push Ups')).toBeTruthy();

    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when multiple weighted exercises are added', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    const addExerciseButton = await screen.findByTestId('add-exercise-button');

    // Add first weighted exercise
    fireEvent.press(addExerciseButton);
    const mockState1 = getExercisePickerMockState();
    mockState1.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });
    await screen.findByText('1. Bench Press');

    // Add second weighted exercise
    fireEvent.press(addExerciseButton);
    const mockState2 = getExercisePickerMockState();
    mockState2.callback({
      id: 'deadlift',
      name: 'Deadlift',
      allowedUnits: ['load', 'reps'],
    });
    await screen.findByText('2. Deadlift');

    // Verify both exercises are rendered
    expect(screen.getByText('1. Bench Press')).toBeTruthy();
    expect(screen.getByText('2. Deadlift')).toBeTruthy();

    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when multiple bodyweight exercises are added', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    const addExerciseButton = await screen.findByTestId('add-exercise-button');

    // Add first bodyweight exercise
    fireEvent.press(addExerciseButton);
    const mockState1 = getExercisePickerMockState();
    mockState1.callback({
      id: 'push-ups',
      name: 'Push Ups',
      allowedUnits: ['reps'],
    });
    await screen.findByText('1. Push Ups');

    // Add second bodyweight exercise
    fireEvent.press(addExerciseButton);
    const mockState2 = getExercisePickerMockState();
    mockState2.callback({
      id: 'pull-ups',
      name: 'Pull Ups',
      allowedUnits: ['reps'],
    });
    await screen.findByText('2. Pull Ups');

    // Verify both exercises are rendered
    expect(screen.getByText('1. Push Ups')).toBeTruthy();
    expect(screen.getByText('2. Pull Ups')).toBeTruthy();

    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should enable button when bodyweight exercise has valid reps and RIR', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add bodyweight exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    const bodyweightExercise = {
      id: 'push-ups',
      name: 'Push Ups',
      allowedUnits: ['reps'],
    };

    mockState.callback(bodyweightExercise);

    await screen.findByText('1. Push Ups');

    // Find the reps input field and set valid value (reps > 0)
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(repsInputs[0], '10');

    // Find the RIR input field and set valid value (0-10)
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    expect(rirInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(rirInputs[0], '2');

    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(1);
    });
  });

  it('should enable button when weighted exercise has valid weight, reps, and RIR', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add weighted exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    const weightedExercise = {
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    };

    mockState.callback(weightedExercise);

    await screen.findByText('1. Bench Press');

    // Find the weight input field and set valid value (weight > 0)
    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    expect(weightInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(weightInputs[0], '100');

    // Find the reps input field and set valid value (reps > 0)
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(repsInputs[0], '8');

    // Find the RIR input field and set valid value (0-10)
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    expect(rirInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(rirInputs[0], '1');

    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(1);
    });
  });

  it('should keep button disabled when RIR is out of range (> 10)', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add bodyweight exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    mockState.callback({
      id: 'push-ups',
      name: 'Push Ups',
      allowedUnits: ['reps'],
    });

    await screen.findByText('1. Push Ups');

    // Set valid reps
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    fireEvent.changeText(repsInputs[0], '10');

    // Set invalid RIR
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    fireEvent.changeText(rirInputs[0], '11');

    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(0.6);
    });
  });

  it('should keep button disabled when weight is missing/zero for weighted exercise', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add weighted exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    mockState.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('1. Bench Press');

    // Set invalid weight (0)
    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    fireEvent.changeText(weightInputs[0], '0');

    // Set valid reps
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    fireEvent.changeText(repsInputs[0], '8');

    // Set valid RIR
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    fireEvent.changeText(rirInputs[0], '2');

    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(0.6);
    });
  });

  it('should add a new set when add set button is pressed', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    mockState.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('1. Bench Press');

    // Initially there should be 1 set (default set)
    const repsInputsBefore = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputsBefore.length).toBe(1);

    // Find add set button by text (translation mock returns key)
    const addSetButtons = screen.getAllByText('workout.addSet');
    expect(addSetButtons.length).toBeGreaterThan(0);

    // Press the add set button
    fireEvent.press(addSetButtons[0]);

    // Wait for new set to appear - should now have 2 sets
    await waitFor(() => {
      const repsInputsAfter = screen.getAllByPlaceholderText('common.reps');
      expect(repsInputsAfter.length).toBe(2);
    });
  });

  it('should duplicate previous set when duplicate button is pressed', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    mockState.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('1. Bench Press');

    // Fill in the first set with values
    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');

    fireEvent.changeText(weightInputs[0], '100');
    fireEvent.changeText(repsInputs[0], '8');
    fireEvent.changeText(rirInputs[0], '2');

    // Find duplicate button by text
    const duplicateButtons = screen.getAllByText('workout.duplicate');
    expect(duplicateButtons.length).toBeGreaterThan(0);

    // Press duplicate button
    fireEvent.press(duplicateButtons[0]);

    // Wait for new set to appear with duplicated values
    await waitFor(() => {
      const repsInputsAfter = screen.getAllByPlaceholderText('common.reps');
      expect(repsInputsAfter.length).toBe(2);
    });

    // Verify the duplicated set has the same values
    const weightInputsAfter = screen.getAllByPlaceholderText('common.weight');
    const repsInputsAfter = screen.getAllByPlaceholderText('common.reps');
    const rirInputsAfter = screen.getAllByPlaceholderText('workout.rir');

    expect(weightInputsAfter[1].props.value).toBe('100');
    expect(repsInputsAfter[1].props.value).toBe('8');
    expect(rirInputsAfter[1].props.value).toBe('2');
  });

  it('should remove exercise when remove exercise button is pressed', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add first exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState1 = getExercisePickerMockState();
    mockState1.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('1. Bench Press');

    // Add second exercise
    fireEvent.press(addExerciseButton);
    const mockState2 = getExercisePickerMockState();
    mockState2.callback({
      id: 'squat',
      name: 'Squat',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('2. Squat');

    // Verify both exercises are present
    expect(screen.getByText('1. Bench Press')).toBeTruthy();
    expect(screen.getByText('2. Squat')).toBeTruthy();

    // Find remove exercise button by index (index 0 for first exercise "1. Bench Press")
    const removeButton = screen.getByTestId('remove-exercise-button-0');
    expect(removeButton).toBeTruthy();

    // Press the remove button
    fireEvent.press(removeButton);

    // Wait for exercise to be removed
    await waitFor(() => {
      expect(screen.queryByText('1. Bench Press')).toBeNull();
    });

    // Verify second exercise is still present and is now "1. Squat" (re-indexed)
    await waitFor(() => {
      expect(screen.getByText('1. Squat')).toBeTruthy();
    });
  });

  it('should show modal with correct text when trying to remove the only set of an exercise', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    mockState.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('1. Bench Press');

    // Verify there is only one set (the default set)
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputs.length).toBe(1);

    // Find the remove set button for the first exercise's first set (index 0-0)
    const removeSetButton = screen.getByTestId('remove-set-button-0-0');
    expect(removeSetButton).toBeTruthy();

    // Press the remove set button
    fireEvent.press(removeSetButton);

    // Wait for modal to appear with the warning message
    await waitFor(() => {
      expect(screen.getByText('workout.eachExerciseMustHaveSet')).toBeTruthy();
    });

    // Verify the set was not removed (should still have 1 set)
    const repsInputsAfter = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputsAfter.length).toBe(1);
  });

  it('should navigate back after successfully creating a workout', async () => {
    render(
      <TestWrapper>
        <ApplyWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add exercise
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    mockState.callback({
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    });

    await screen.findByText('1. Bench Press');

    // Fill in valid workout data to enable the submit button
    const weightInputs = screen.getAllByPlaceholderText('common.weight');
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');

    fireEvent.changeText(weightInputs[0], '100');
    fireEvent.changeText(repsInputs[0], '8');
    fireEvent.changeText(rirInputs[0], '2');

    // Wait for button to be enabled
    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(1);
    });

    // Press the create workout button
    const createWorkoutButton = screen.getByTestId('create-workout-button');
    fireEvent.press(createWorkoutButton);

    // Wait for router.back() to be called (after the 1500ms setTimeout)
    // The mock createWorkout should resolve successfully by default
    await waitFor(
      () => {
        expect(mockBack).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 },
    );
  });
});
