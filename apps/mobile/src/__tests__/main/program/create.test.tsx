import {
  createTestWrapper,
  resetAllMocks,
  getExercisePickerMockState,
  EXERCISES,
} from '../../testSetup';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import CreateProgramScreen from '@/app/(drawer)/(tabs)/program/create';

jest.mock('@/hooks/program/useProgramSave', () => ({
  useProgramSave: jest.fn(() => ({
    handleSave: jest.fn(),
    isSaving: false,
  })),
}));
describe('CreateProgramScreen', () => {
  const TestWrapper = createTestWrapper();
  const { useProgramSave } = require('@/hooks/program/useProgramSave');

  // Mock handleSave - we'll spy on this to verify it's called
  const mockHandleSave = jest.fn();

  beforeEach(() => {
    resetAllMocks();

    // Clear the mock handleSave
    mockHandleSave.mockClear();

    // Simple mock: isSaving is always false, handleSave is a spy
    useProgramSave.mockReset();
    useProgramSave.mockImplementation(() => ({
      handleSave: mockHandleSave,
      isSaving: false,
    }));
  });

  it('should render the create program screen', () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    expect(screen.getByText('program.create')).toBeTruthy();
  });

  it('should display program name input', () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    const nameInput = screen.getByPlaceholderText('program.enterProgramName');
    expect(nameInput).toBeTruthy();
  });

  it('should display program description input', () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
    expect(descriptionInput).toBeTruthy();
  });

  it('should display program type selector', () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    expect(screen.getByText('program.simple')).toBeTruthy();
    expect(screen.getByText('program.alternating')).toBeTruthy();
    expect(screen.getByText('program.advanced')).toBeTruthy();
  });

  it('should update name input when user types', () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    const nameInput = screen.getByPlaceholderText('program.enterProgramName');
    fireEvent.changeText(nameInput, 'My Program');

    // Verify the input value is updated
    expect(nameInput.props.value).toBe('My Program');
  });

  it('should update description input when user types', () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
    fireEvent.changeText(descriptionInput, 'My program description');

    // Verify the input value is updated
    expect(descriptionInput.props.value).toBe('My program description');
  });

  it('should change program type when type button is pressed', async () => {
    render(
      <TestWrapper>
        <CreateProgramScreen />
      </TestWrapper>,
    );

    // Initially should show simple program (default)
    expect(screen.getByText('common.week')).toBeTruthy();

    // Click alternating program type
    const alternatingButton = screen.getByText('program.alternating');
    fireEvent.press(alternatingButton);

    await waitFor(() => {
      // Should now show alternating weeks section
      expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
    });
  });

  describe('Simple Program', () => {
    it('should display week section for simple program', () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      expect(screen.getByText('common.week')).toBeTruthy();
    });

    it('should display save button', () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const saveButton = screen.getByText('program.create');
      expect(saveButton).toBeTruthy();
    });

    it('should disable save button when isSaving is true', () => {
      useProgramSave.mockImplementation(() => ({
        handleSave: mockHandleSave,
        isSaving: true,
      }));

      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // When isSaving is true, the button should show "common.saving" text
      // and the button should be disabled (which is indicated by the text change)
      const saveButtonText = screen.getByText('common.saving');
      expect(saveButtonText).toBeTruthy();

      // Verify the button text changed from "program.create" to "common.saving"
      // This indicates the button is in the saving/disabled state
      expect(screen.queryByText('program.create')).toBeNull();
    });

    it('should call handleSave when all required data is valid', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // 1. Fill in program name
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      // 2. Fill in program description
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // 3. Select Day 1 by pressing the Day 1 button in DaySelector
      await waitFor(() => {
        // Find the Day 1 button in DaySelector (it shows "common.day 1")
        const day1Buttons = screen.getAllByText('common.day 1');
        // The first one should be the DaySelector button
        if (day1Buttons.length > 0) {
          // Find the parent Pressable and press it
          const day1Button = day1Buttons[0];
          fireEvent.press(day1Button);
        }
      });

      // 4. Add day name - wait for the day name input to appear
      await waitFor(() => {
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
        expect(dayNameInput).toBeTruthy();
        fireEvent.changeText(dayNameInput, 'Push Day');
      });

      // 5. Add an exercise - wait for the add exercise button to appear
      await waitFor(() => {
        const addExerciseButton = screen.getByText(/program\.addExerciseTo.*common\.day 1/);
        expect(addExerciseButton).toBeTruthy();
        fireEvent.press(addExerciseButton);
      });

      // Wait for the exercise picker callback to be set up
      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        expect(mockState.callback).toBeTruthy();
        expect(mockState.context).toBeTruthy();
      });

      // Get the exercise picker callback and simulate exercise selection
      const mockState = getExercisePickerMockState();
      if (mockState.callback && mockState.context) {
        mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
      }

      // 6. Wait for exercise to appear and add a valid set
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Find the reps and RIR inputs for the first set
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');

        expect(repsInputs.length).toBeGreaterThan(0);
        expect(rirInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '8');
        fireEvent.changeText(rirInputs[0], '2');
      });

      // 7. Click save button
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // 8. Verify handleSave was called
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program name is missing', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in description but not name
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program description is missing', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in name but not description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when no active days are selected', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // Don't select any days - all days should be inactive (rest)

      // Wait for component to fully render with correct mock value
      await waitFor(() => {
        const createText = screen.queryByText('program.create');

        expect(createText).toBeTruthy();
      });
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when day name is missing', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // Select Day 1 but don't add day name
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      // Wait a bit for state to settle
      await waitFor(() => {
        expect(screen.getByPlaceholderText('program.dayName')).toBeTruthy();
      });

      // Try to save without day name - wait for button to show correct text
      await waitFor(() => {
        const createText = screen.queryByText('program.create');

        expect(createText).toBeTruthy();
      });
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when day has no exercises', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // Select Day 1
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      // Add day name
      await waitFor(() => {
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
        fireEvent.changeText(dayNameInput, 'Push Day');
      });

      // Don't add any exercises

      // Try to save - wait for button to show correct text
      await waitFor(() => {
        const createText = screen.queryByText('program.create');

        expect(createText).toBeTruthy();
      });
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when exercise has no valid sets', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // Select Day 1
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      // Add day name
      await waitFor(() => {
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
        fireEvent.changeText(dayNameInput, 'Push Day');
      });

      // Add an exercise
      await waitFor(() => {
        const addExerciseButton = screen.getByText(/program\.addExerciseTo.*common\.day 1/);
        fireEvent.press(addExerciseButton);
      });

      // Wait for the callback to be set up
      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        expect(mockState.callback).toBeTruthy();
        expect(mockState.context).toBeTruthy();
      });

      const mockState = getExercisePickerMockState();
      if (mockState.callback && mockState.context) {
        mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
      }

      // Wait for exercise to appear but don't fill in set data (leave reps/rir empty)
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Try to save without valid sets - wait for button to show correct text
      await waitFor(() => {
        const createText = screen.queryByText('program.create');

        expect(createText).toBeTruthy();
      });
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when exercise has invalid set (reps=0)', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Training Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'A comprehensive training program');

      // Select Day 1
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      // Add day name
      await waitFor(() => {
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
        fireEvent.changeText(dayNameInput, 'Push Day');
      });

      // Add an exercise
      await waitFor(() => {
        const addExerciseButton = screen.getByText(/program\.addExerciseTo.*common\.day 1/);
        fireEvent.press(addExerciseButton);
      });

      // Wait for the callback to be set up
      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        expect(mockState.callback).toBeTruthy();
        expect(mockState.context).toBeTruthy();
      });

      const mockState = getExercisePickerMockState();
      if (mockState.callback && mockState.context) {
        mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
      }

      // Wait for exercise to appear
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Fill in set with invalid data (reps=0)
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        expect(repsInputs.length).toBeGreaterThan(0);
        expect(rirInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '0');
        fireEvent.changeText(rirInputs[0], '2');
      });

      // Try to save with invalid set (reps=0)
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Alternating Program', () => {
    it('should display alternating weeks section when alternating type is selected', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );
      // Click alternating program type
      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);
      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
        expect(screen.getByText('program.defineTwoWeeks')).toBeTruthy();
      });
    });

    it('should call handleSave when all required data is valid for alternating program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // 1. Switch to alternating program type
      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // 2. Fill in program name
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      // 3. Fill in program description
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // 4. For Week 1 - Select Day 1
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      // 5. Add Week 1 Day 1 name
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
      });

      // 6. Add exercise to Week 1 Day 1
      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        expect(addExerciseButtons.length).toBeGreaterThan(0);
        fireEvent.press(addExerciseButtons[0]);
      });

      // Wait for exercise picker callback
      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        expect(mockState.callback).toBeTruthy();
        expect(mockState.context).toBeTruthy();
      });

      const mockState = getExercisePickerMockState();
      if (mockState.callback && mockState.context) {
        mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
      }

      // 7. Add valid set data for Week 1 Day 1
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        expect(repsInputs.length).toBeGreaterThan(0);
        expect(rirInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '8');
        fireEvent.changeText(rirInputs[0], '2');
      });

      // 8. For Week 2 - Select Day 1
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        // Get the second Day 1 button (for Week 2)
        if (day1Buttons.length > 1) {
          fireEvent.press(day1Buttons[1]);
        }
      });

      // 9. Add Week 2 Day 1 name
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        // Get the second day name input (for Week 2)
        if (dayNameInputs.length > 1) {
          fireEvent.changeText(dayNameInputs[1], 'Week 2 Pull Day');
        }
      });

      // 10. Add exercise to Week 2 Day 1
      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        // Get the second add exercise button (for Week 2)
        if (addExerciseButtons.length > 1) {
          fireEvent.press(addExerciseButtons[1]);
        }
      });

      // Wait for exercise picker callback
      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        expect(mockState.callback).toBeTruthy();
        expect(mockState.context).toBeTruthy();
      });

      const mockState2 = getExercisePickerMockState();
      if (mockState2.callback && mockState2.context) {
        mockState2.callback(EXERCISES.PULL_UPS, mockState2.context);
      }

      // 11. Add valid set data for Week 2 Day 1
      await waitFor(() => {
        expect(screen.getByText('1. Pull Ups')).toBeTruthy();
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        // Get the last reps/rir inputs (for Week 2)
        if (repsInputs.length > 1 && rirInputs.length > 1) {
          const lastRepsIndex = repsInputs.length - 1;
          const lastRirIndex = rirInputs.length - 1;
          fireEvent.changeText(repsInputs[lastRepsIndex], '10');
          fireEvent.changeText(rirInputs[lastRirIndex], '1');
        }
      });

      // 12. Click save button
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // 13. Verify handleSave was called
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program name is missing for alternating program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in description but not name
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program description is missing for alternating program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name but not description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 day name is missing', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Select Day 1 in Week 1 but don't add day name
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('program.dayName')).toBeTruthy();
      });

      // Try to save without day name
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 day name is missing', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 completely
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      // Add exercise to Week 1
      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 0) {
          fireEvent.press(addExerciseButtons[0]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        if (repsInputs.length > 0 && rirInputs.length > 0) {
          fireEvent.changeText(repsInputs[0], '8');
          fireEvent.changeText(rirInputs[0], '2');
        }
      });

      // Set up Week 2 - select day but don't add day name
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 1) {
          fireEvent.press(day1Buttons[1]);
        }
      });

      // Try to save without Week 2 day name
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 has no exercises', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 - select day and add name, but no exercises
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      // Don't add any exercises

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 has no exercises', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 completely
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 0) {
          fireEvent.press(addExerciseButtons[0]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        if (repsInputs.length > 0 && rirInputs.length > 0) {
          fireEvent.changeText(repsInputs[0], '8');
          fireEvent.changeText(rirInputs[0], '2');
        }
      });

      // Set up Week 2 - select day and add name, but no exercises
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 1) {
          fireEvent.press(day1Buttons[1]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 1) {
          fireEvent.changeText(dayNameInputs[1], 'Week 2 Pull Day');
        }
      });

      // Don't add any exercises to Week 2

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 exercise has no valid sets', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 - select day, add name, add exercise, but no sets
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 0) {
          fireEvent.press(addExerciseButtons[0]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      // Don't fill in set data (leave reps/rir empty)

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 exercise has no valid sets', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 completely
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 0) {
          fireEvent.press(addExerciseButtons[0]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        if (repsInputs.length > 0 && rirInputs.length > 0) {
          fireEvent.changeText(repsInputs[0], '8');
          fireEvent.changeText(rirInputs[0], '2');
        }
      });

      // Set up Week 2 - select day, add name, add exercise, but no sets
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 1) {
          fireEvent.press(day1Buttons[1]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 1) {
          fireEvent.changeText(dayNameInputs[1], 'Week 2 Pull Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 1) {
          fireEvent.press(addExerciseButtons[1]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.PULL_UPS, mockState.context);
        }
      });

      // Don't fill in set data for Week 2

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 exercise has invalid set (reps=0)', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 - select day, add name, add exercise
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 0) {
          fireEvent.press(addExerciseButtons[0]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      // Fill in set with invalid data (reps=0)
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        if (repsInputs.length > 0 && rirInputs.length > 0) {
          fireEvent.changeText(repsInputs[0], '0');
          fireEvent.changeText(rirInputs[0], '2');
        }
      });

      // Try to save with invalid set (reps=0)
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 exercise has invalid set (reps=0)', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Set up Week 1 completely
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 0) {
          fireEvent.press(addExerciseButtons[0]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        if (repsInputs.length > 0 && rirInputs.length > 0) {
          fireEvent.changeText(repsInputs[0], '8');
          fireEvent.changeText(rirInputs[0], '2');
        }
      });

      // Set up Week 2 - select day, add name, add exercise
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 1) {
          fireEvent.press(day1Buttons[1]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 1) {
          fireEvent.changeText(dayNameInputs[1], 'Week 2 Pull Day');
        }
      });

      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        if (addExerciseButtons.length > 1) {
          fireEvent.press(addExerciseButtons[1]);
        }
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.PULL_UPS, mockState.context);
        }
      });

      // Fill in set with invalid data (reps=0) for Week 2
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        // Get the last inputs (for Week 2)
        if (repsInputs.length > 1 && rirInputs.length > 1) {
          const lastRepsIndex = repsInputs.length - 1;
          const lastRirIndex = rirInputs.length - 1;
          fireEvent.changeText(repsInputs[lastRepsIndex], '0');
          fireEvent.changeText(rirInputs[lastRirIndex], '1');
        }
      });

      // Try to save with invalid set (reps=0)
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when alternating program has incomplete week data', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Switch to alternating program type
      const alternatingButton = screen.getByText('program.alternating');
      fireEvent.press(alternatingButton);

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
      });

      // Fill in name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Alternating Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An alternating training program');

      // Only set up Week 1, but not Week 2
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        if (day1Buttons.length > 0) {
          fireEvent.press(day1Buttons[0]);
        }
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        if (dayNameInputs.length > 0) {
          fireEvent.changeText(dayNameInputs[0], 'Week 1 Push Day');
        }
      });

      // Try to save without completing Week 2
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });
  });
  describe('Advanced Program', () => {
    it('should display phases section when advanced type is selected', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );
      // Click advanced program type
      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);
      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });
    });
    it('should display add phase button for advanced program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );
      // Click advanced program type
      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
      });
    });
    it('should add a new phase when add phase button is pressed', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );
      // Click advanced program type
      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });
      // Should show phase name input after adding phase
      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
      });
    });

    it('should call handleSave when all required data is valid for advanced program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // 1. Switch to advanced program type
      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // 2. Fill in program name
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      // 3. Fill in program description
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // 4. Add a phase
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      // 5. Fill in phase name
      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // 6. Add a week to the phase
      await waitFor(() => {
        const addWeekButtons = screen.getAllByText('program.addWeek');
        expect(addWeekButtons.length).toBeGreaterThan(0);
        fireEvent.press(addWeekButtons[0]);
      });

      // 7. Select Day 1 in the phase week
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        expect(day1Buttons.length).toBeGreaterThan(0);
        fireEvent.press(day1Buttons[0]);
      });

      // 8. Add day name
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(dayNameInputs[0], 'Push Day');
      });

      // 9. Add exercise to the day
      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        expect(addExerciseButtons.length).toBeGreaterThan(0);
        fireEvent.press(addExerciseButtons[0]);
      });

      // Wait for exercise picker callback
      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        expect(mockState.callback).toBeTruthy();
        expect(mockState.context).toBeTruthy();
      });

      const mockState = getExercisePickerMockState();
      if (mockState.callback && mockState.context) {
        mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
      }

      // 10. Add valid set data
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        expect(repsInputs.length).toBeGreaterThan(0);
        expect(rirInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '8');
        fireEvent.changeText(rirInputs[0], '2');
      });

      // 11. Click save button
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // 12. Verify handleSave was called
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase name is missing', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Switch to advanced program type
      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase but don't fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      // Try to save without phase name
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program name is missing for advanced program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in description but not name
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program description is missing for advanced program', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in name but not description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when day name is missing in phase week', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase and fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // Add a week to the phase
      await waitFor(() => {
        const addWeekButtons = screen.getAllByText('program.addWeek');
        expect(addWeekButtons.length).toBeGreaterThan(0);
        fireEvent.press(addWeekButtons[0]);
      });

      // Select Day 1 but don't add day name
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        expect(day1Buttons.length).toBeGreaterThan(0);
        fireEvent.press(day1Buttons[0]);
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText('program.dayName')).toBeTruthy();
      });

      // Try to save without day name
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase day has no exercises', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase and fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // Add a week to the phase
      await waitFor(() => {
        const addWeekButtons = screen.getAllByText('program.addWeek');
        expect(addWeekButtons.length).toBeGreaterThan(0);
        fireEvent.press(addWeekButtons[0]);
      });

      // Select Day 1 and add day name, but no exercises
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        expect(day1Buttons.length).toBeGreaterThan(0);
        fireEvent.press(day1Buttons[0]);
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(dayNameInputs[0], 'Push Day');
      });

      // Don't add any exercises

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase exercise has no valid sets', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase and fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // Add a week to the phase
      await waitFor(() => {
        const addWeekButtons = screen.getAllByText('program.addWeek');
        expect(addWeekButtons.length).toBeGreaterThan(0);
        fireEvent.press(addWeekButtons[0]);
      });

      // Select Day 1 and add day name
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        expect(day1Buttons.length).toBeGreaterThan(0);
        fireEvent.press(day1Buttons[0]);
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(dayNameInputs[0], 'Push Day');
      });

      // Add exercise but don't fill in set data
      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        expect(addExerciseButtons.length).toBeGreaterThan(0);
        fireEvent.press(addExerciseButtons[0]);
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      // Don't fill in set data (leave reps/rir empty)

      // Try to save
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase exercise has invalid set (reps=0)', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase and fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // Add a week to the phase
      await waitFor(() => {
        const addWeekButtons = screen.getAllByText('program.addWeek');
        expect(addWeekButtons.length).toBeGreaterThan(0);
        fireEvent.press(addWeekButtons[0]);
      });

      // Select Day 1 and add day name
      await waitFor(() => {
        const day1Buttons = screen.getAllByText('common.day 1');
        expect(day1Buttons.length).toBeGreaterThan(0);
        fireEvent.press(day1Buttons[0]);
      });

      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(dayNameInputs[0], 'Push Day');
      });

      // Add exercise
      await waitFor(() => {
        const addExerciseButtons = screen.getAllByText(/program\.addExerciseTo.*common\.day 1/);
        expect(addExerciseButtons.length).toBeGreaterThan(0);
        fireEvent.press(addExerciseButtons[0]);
      });

      await waitFor(() => {
        const mockState = getExercisePickerMockState();
        if (mockState.callback && mockState.context) {
          mockState.callback(EXERCISES.BENCH_PRESS, mockState.context);
        }
      });

      // Fill in set with invalid data (reps=0)
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        expect(repsInputs.length).toBeGreaterThan(0);
        expect(rirInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '0');
        fireEvent.changeText(rirInputs[0], '2');
      });

      // Try to save with invalid set (reps=0)
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase week has no active days', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase and fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // Add a week to the phase
      await waitFor(() => {
        const addWeekButtons = screen.getAllByText('program.addWeek');
        expect(addWeekButtons.length).toBeGreaterThan(0);
        fireEvent.press(addWeekButtons[0]);
      });

      // Don't select any active days (all days should be rest)

      // Try to save without active days
      const saveButton = screen.getByText('program.create');
      fireEvent.press(saveButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase has no weeks', async () => {
      render(
        <TestWrapper>
          <CreateProgramScreen />
        </TestWrapper>,
      );

      // Switch to advanced program type
      const advancedButton = screen.getByText('program.advanced');
      fireEvent.press(advancedButton);

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Fill in program name and description
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
      fireEvent.changeText(nameInput, 'My Advanced Program');

      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      fireEvent.changeText(descriptionInput, 'An advanced training program');

      // Add a phase and fill in phase name
      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(phaseNameInputs[0], 'Strength Phase');
      });

      // Don't add any weeks to the phase

      // Try to save without weeks
      await waitFor(() => {
        const saveButton = screen.getByText('program.create');
        expect(saveButton).toBeTruthy();
        fireEvent.press(saveButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });
  });
});
