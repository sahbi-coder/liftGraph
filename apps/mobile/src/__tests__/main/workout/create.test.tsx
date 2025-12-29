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
import CreateWorkout from '@/app/(drawer)/(tabs)/workout/create';

describe('CreateWorkout Screen', () => {
  const TestWrapper = createTestWrapper();

  beforeEach(() => {
    resetAllMocks();
  });

  it('should render the workout form', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    // findByTestId automatically waits for the element to appear
    const workoutForm = await screen.findByTestId('workout-form');
    expect(workoutForm).toBeTruthy();
  });

  it('should navigate to exercises screen when add exercise button is pressed', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    // Wait for the form to render
    await screen.findByTestId('workout-form');

    // Find the "Add Exercise" button by testID
    const addExerciseButton = await screen.findByTestId('add-exercise-button');

    // Press the button
    fireEvent.press(addExerciseButton);

    // Assert that router.push was called with the exercises path
    expect(mockPush).toHaveBeenCalledWith('/(drawer)/(tabs)/workout/exercises');
    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it('should render exercise when exercise is selected', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
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

  it('should keep button disabled when weighted exercise is added with default empty set', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Verify button starts disabled
    const createWorkoutButtonBefore = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButtonBefore.props.style.opacity).toBe(0.6);

    // Add weighted exercise (with default set: weight='0', reps='0', rir='0')
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    const weightedExercise = {
      id: 'bench-press',
      name: 'Bench Press',
      allowedUnits: ['load', 'reps'],
    };

    mockState.callback(weightedExercise);

    // Wait for exercise to appear
    await screen.findByText('1. Bench Press');

    // Button should still be disabled because:
    // 1. Date might not be set (required for form validity)
    // 2. Default set has reps=0, which fails validation (reps must be > 0)
    // 3. Default set has weight=0, which fails validation for weighted exercises (weight must be > 0)
    const createWorkoutButtonAfter = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButtonAfter.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when bodyweight exercise is added with default empty set', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Add bodyweight exercise (with default set: reps='0', rir='0')
    const addExerciseButton = await screen.findByTestId('add-exercise-button');
    fireEvent.press(addExerciseButton);

    const mockState = getExercisePickerMockState();
    const bodyweightExercise = {
      id: 'push-ups',
      name: 'Push Ups',
      allowedUnits: ['reps'],
    };

    mockState.callback(bodyweightExercise);

    // Wait for exercise to appear
    await screen.findByText('1. Push Ups');

    // Button should still be disabled because:
    // 1. Date might not be set (required for form validity)
    // 2. Default set has reps=0, which fails validation (reps must be > 0)
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should render and keep button disabled with mixed weighted and bodyweight exercises', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    const addExerciseButton = await screen.findByTestId('add-exercise-button');

    // Add weighted exercise
    fireEvent.press(addExerciseButton);
    const mockState1 = getExercisePickerMockState();
    const weightedExercise = {
      id: 'squat',
      name: 'Squat',
      allowedUnits: ['load', 'reps'],
    };
    mockState1.callback(weightedExercise);
    await screen.findByText('1. Squat');

    // Add bodyweight exercise
    fireEvent.press(addExerciseButton);
    const mockState2 = getExercisePickerMockState();
    const bodyweightExercise = {
      id: 'pull-ups',
      name: 'Pull Ups',
      allowedUnits: ['reps'],
    };
    mockState2.callback(bodyweightExercise);
    await screen.findByText('2. Pull Ups');

    // Verify both exercises are rendered
    const squatExercise = screen.getByText('1. Squat');
    const pullUpsExercise = screen.getByText('2. Pull Ups');
    expect(squatExercise).toBeTruthy();
    expect(pullUpsExercise).toBeTruthy();

    // Button should still be disabled because default sets have invalid values (reps=0, weight=0)
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when multiple weighted exercises are added', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
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

    // Button should still be disabled (default sets have invalid values)
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when multiple bodyweight exercises are added', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
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

    // Button should still be disabled (default sets have invalid values)
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should enable button when bodyweight exercise has valid reps and RIR', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Date is set by default to today's date in useWorkoutFormState

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

    // Wait for exercise to appear
    await screen.findByText('1. Push Ups');

    // Find the reps input field and set valid value (reps > 0)
    // Translation mock returns the key, so placeholder is 'common.reps'
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    expect(repsInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(repsInputs[0], '10');

    // Find the RIR input field and set valid value (0-10)
    // Translation mock returns the key, so placeholder is 'workout.rir'
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    expect(rirInputs.length).toBeGreaterThan(0);
    fireEvent.changeText(rirInputs[0], '2');

    // Wait for form validation to update and button to be enabled
    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(1);
    });
  });

  it('should enable button when weighted exercise has valid weight, reps, and RIR', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
      </TestWrapper>,
    );

    await screen.findByTestId('workout-form');

    // Date is set by default to today's date in useWorkoutFormState

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

    // Wait for exercise to appear
    await screen.findByText('1. Bench Press');

    // Find the weight input field and set valid value (weight > 0)
    // Translation mock returns the key, so placeholder is 'common.weight'
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

    // Wait for form validation to update and button to be enabled
    await waitFor(() => {
      const createWorkoutButton = screen.getByTestId('create-workout-button');
      expect(createWorkoutButton.props.style.opacity).toBe(1);
    });
  });

  it('should keep button disabled when RIR is out of range (> 10)', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
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

    // Set invalid RIR (> 10)
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    fireEvent.changeText(rirInputs[0], '11');

    await screen.findByTestId('create-workout-button');

    // Button should stay disabled (RIR must be between 0-10)
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should keep button disabled when weighted exercise has reps but no weight', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
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

    // Set valid reps but leave weight as 0 (invalid)
    const repsInputs = screen.getAllByPlaceholderText('common.reps');
    fireEvent.changeText(repsInputs[0], '8');

    // Set valid RIR
    const rirInputs = screen.getAllByPlaceholderText('workout.rir');
    fireEvent.changeText(rirInputs[0], '2');

    await screen.findByTestId('create-workout-button');

    // Button should stay disabled (weight must be > 0 for weighted exercises)
    const createWorkoutButton = await screen.findByTestId('create-workout-button');
    expect(createWorkoutButton.props.style.opacity).toBe(0.6);
  });

  it('should add a new set when add set button is pressed', async () => {
    render(
      <TestWrapper>
        <CreateWorkout />
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
        <CreateWorkout />
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
        <CreateWorkout />
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
        <CreateWorkout />
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
        <CreateWorkout />
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
