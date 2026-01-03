import { createTestWrapper, resetAllMocks } from '../../testSetup';
import { useLocalSearchParams } from 'expo-router';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import EditProgramScreen from '@/app/(drawer)/(tabs)/program/edit';
import type { Program } from '@/domain/program';

// Mock useAlertModal to prevent infinite loops in useEffect
// Create stable mock functions that won't cause re-renders
const createStableMockFunctions = () => {
  const mockShowError = jest.fn();
  const mockShowSuccess = jest.fn();
  const mockShowWarning = jest.fn();
  const mockShowInfo = jest.fn();
  const mockHide = jest.fn();
  const mockAlertModalComponent = jest.fn(() => null);

  return {
    showError: mockShowError,
    showSuccess: mockShowSuccess,
    showWarning: mockShowWarning,
    showInfo: mockShowInfo,
    hide: mockHide,
    AlertModalComponent: mockAlertModalComponent,
    alertModal: {
      visible: false,
      message: '',
      type: 'info' as const,
    },
  };
};

let mockAlertModalReturn = createStableMockFunctions();

jest.mock('@/hooks/common/useAlertModal', () => ({
  useAlertModal: jest.fn(() => mockAlertModalReturn),
}));

// Mock dependencies
jest.mock('@/hooks/program/useProgram', () => ({
  useProgram: jest.fn(() => ({
    program: null,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/hooks/program/useProgramSave', () => ({
  useProgramSave: jest.fn(() => ({
    handleSave: jest.fn(),
    isSaving: false,
  })),
}));

describe('EditProgramScreen', () => {
  const TestWrapper = createTestWrapper();
  const { useProgramSave } = require('@/hooks/program/useProgramSave');
  const { useProgram } = require('@/hooks/program/useProgram');

  // Mock handleSave - we'll spy on this to verify it's called
  const mockHandleSave = jest.fn();

  // Mock program data
  const mockSimpleProgram: Program = {
    id: 'test-program-id',
    name: 'My Training Program',
    description: 'A comprehensive training program',
    type: 'simple',
    isCustom: true,
    week: {
      days: [
        {
          label: 'Day1',
          name: 'Push Day',
          exercises: [
            {
              id: 'bench-press',
              name: 'Bench Press',
              sets: [{ reps: 8, rir: 2 }],
            },
          ],
        },
        'rest',
        'rest',
        'rest',
        'rest',
        'rest',
        'rest',
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAlternatingProgram: Program = {
    id: 'test-program-id',
    name: 'My Alternating Program',
    description: 'An alternating training program',
    type: 'alternating',
    isCustom: true,
    alternatingWeeks: [
      {
        days: [
          {
            label: 'Day1',
            name: 'Week 1 Push Day',
            exercises: [
              {
                id: 'bench-press',
                name: 'Bench Press',
                sets: [{ reps: 8, rir: 2 }],
              },
            ],
          },
          'rest',
          'rest',
          'rest',
          'rest',
          'rest',
          'rest',
        ],
      },
      {
        days: [
          {
            label: 'Day1',
            name: 'Week 2 Pull Day',
            exercises: [
              {
                id: 'pull-ups',
                name: 'Pull Ups',
                sets: [{ reps: 10, rir: 1 }],
              },
            ],
          },
          'rest',
          'rest',
          'rest',
          'rest',
          'rest',
          'rest',
        ],
      },
    ],
  };

  const mockAdvancedProgram: Program = {
    id: 'test-program-id',
    name: 'My Advanced Program',
    description: 'An advanced training program',
    type: 'advanced',
    isCustom: true,
    phases: [
      {
        name: 'Strength Phase',
        description: 'Building strength',
        weeks: [
          {
            days: [
              {
                label: 'Day1',
                name: 'Push Day',
                exercises: [
                  {
                    id: 'bench-press',
                    name: 'Bench Press',
                    sets: [{ reps: 8, rir: 2 }],
                  },
                ],
              },
              'rest',
              'rest',
              'rest',
              'rest',
              'rest',
              'rest',
            ],
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    resetAllMocks();

    // Clear the mock handleSave
    mockHandleSave.mockClear();

    // Reset alert modal mocks with stable functions
    mockAlertModalReturn = createStableMockFunctions();
    const { useAlertModal } = require('@/hooks/common/useAlertModal');
    useAlertModal.mockReturnValue(mockAlertModalReturn);

    // Simple mock: isSaving is always false, handleSave is a spy
    useProgramSave.mockReset();
    useProgramSave.mockImplementation(() => ({
      handleSave: mockHandleSave,
      isSaving: false,
    }));

    // Default mock for useProgram - no program loaded
    useProgram.mockReset();
    useProgram.mockImplementation(() => ({
      program: null,
      isLoading: false,
      isError: false,
    }));

    // Default mock for useLocalSearchParams - return program ID
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: 'test-program-id',
    });
  });

  it('should render the edit program screen', () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    expect(screen.getByText('program.update')).toBeTruthy();
  });

  it('should display program name input', () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    // Check by rendered value instead of placeholder
    const nameInput = screen.getByDisplayValue('My Training Program');
    expect(nameInput).toBeTruthy();
  });

  it('should display program description input', () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    // Check by rendered value instead of placeholder
    const descriptionInput = screen.getByDisplayValue('A comprehensive training program');
    expect(descriptionInput).toBeTruthy();
  });

  it('should display program type selector', () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    expect(screen.getByText('program.simple')).toBeTruthy();
    expect(screen.getByText('program.alternating')).toBeTruthy();
    expect(screen.getByText('program.advanced')).toBeTruthy();
  });

  it('should update name input when user types', () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    // Get input by rendered value instead of placeholder
    const nameInput = screen.getByDisplayValue('My Training Program');
    fireEvent.changeText(nameInput, 'Updated Program Name');

    // Verify the input value is updated
    expect(nameInput.props.value).toBe('Updated Program Name');
  });

  it('should update description input when user types', () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    // Get input by rendered value instead of placeholder
    const descriptionInput = screen.getByDisplayValue('A comprehensive training program');
    fireEvent.changeText(descriptionInput, 'Updated description');

    // Verify the input value is updated
    expect(descriptionInput.props.value).toBe('Updated description');
  });

  it('should change program type when type button is pressed', async () => {
    useProgram.mockImplementation(() => ({
      program: mockSimpleProgram,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    // Initially should show simple program
    expect(screen.getByText('common.week')).toBeTruthy();

    // Click alternating program type
    const alternatingButton = screen.getByText('program.alternating');
    fireEvent.press(alternatingButton);

    await waitFor(() => {
      // Should now show alternating weeks section
      expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
    });
  });

  it('should show loading state when program is loading', () => {
    useProgram.mockImplementation(() => ({
      program: null,
      isLoading: true,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    expect(screen.getByText('program.loadingProgram')).toBeTruthy();
  });

  it('should show error state when program is not found', () => {
    useProgram.mockImplementation(() => ({
      program: null,
      isLoading: false,
      isError: true,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    expect(screen.getByText('program.programCouldNotBeLoaded')).toBeTruthy();
  });

  it('should handle missing program ID', () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({
      id: undefined,
    });

    useProgram.mockImplementation(() => ({
      program: null,
      isLoading: false,
      isError: false,
    }));

    render(
      <TestWrapper>
        <EditProgramScreen />
      </TestWrapper>,
    );

    // The component should show an error and navigate back
    // We can't easily test the navigation, but we can verify the component renders
    // The actual error handling is done in useEffect
    expect(screen.queryByText('program.update')).toBeNull();
  });

  describe('Simple Program', () => {
    it('should display week section for simple program', () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      expect(screen.getByText('common.week')).toBeTruthy();
    });

    it('should display update button', () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      const updateButton = screen.getByText('program.update');
      expect(updateButton).toBeTruthy();
    });

    it('should disable update button when isSaving is true', () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      useProgramSave.mockImplementation(() => ({
        handleSave: mockHandleSave,
        isSaving: true,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // When isSaving is true, the button should show "common.saving" text
      const saveButtonText = screen.getByText('common.saving');
      expect(saveButtonText).toBeTruthy();

      // Verify the button text changed from "program.update" to "common.saving"
      expect(screen.queryByText('program.update')).toBeNull();
    });

    it('should render initial data correctly for simple program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        // Check that program name is loaded - check rendered value
        const nameInput = screen.getByDisplayValue('My Training Program');
        expect(nameInput).toBeTruthy();
        expect(nameInput.props.value).toBe('My Training Program');
      });

      // Check that program description is loaded - check rendered value
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue('A comprehensive training program');
        expect(descriptionInput).toBeTruthy();
        expect(descriptionInput.props.value).toBe('A comprehensive training program');
      });

      // Check that program type is set to simple (should show week section)
      await waitFor(() => {
        expect(screen.getByText('common.week')).toBeTruthy();
      });

      // Check that simple program type button is selected (not explicitly checked, but week section presence confirms it)
      expect(screen.getByText('program.simple')).toBeTruthy();

      // Check that day name is loaded - check rendered value
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Push Day');
        expect(dayNameInput).toBeTruthy();
        expect(dayNameInput.props.value).toBe('Push Day');
      });

      // Check that exercise is loaded with correct name
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Check that set data is loaded correctly (reps and rir) - check ALL sets exactly from rendered values
      await waitFor(() => {
        // Check rendered reps value
        const repsInput = screen.getByDisplayValue('8');
        expect(repsInput).toBeTruthy();
        expect(repsInput.props.value).toBe('8');

        // Check rendered rir value
        const rirInput = screen.getByDisplayValue('2');
        expect(rirInput).toBeTruthy();
        expect(rirInput.props.value).toBe('2');

        // Verify exact count of all reps and rir inputs
        const allRepsInputs = screen.getAllByDisplayValue('8');
        const allRirInputs = screen.getAllByDisplayValue('2');
        expect(allRepsInputs.length).toBe(1);
        expect(allRirInputs.length).toBe(1);
      });

      // Verify exact exercise count
      const exerciseElements = screen.getAllByText(/^1\./);
      expect(exerciseElements.length).toBe(1);
      expect(exerciseElements[0].props.children).toContain('Bench Press');
    });

    it('should call handleSave when all required data is valid', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('program.update')).toBeTruthy();
      });

      // Click update button
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // Verify handleSave was called
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program name is missing', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('My Training Program');
        expect(nameInput).toBeTruthy();
      });

      // Clear the name - get by rendered value
      const nameInput = screen.getByDisplayValue('My Training Program');
      fireEvent.changeText(nameInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program description is missing', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue('A comprehensive training program');
        expect(descriptionInput).toBeTruthy();
      });

      // Clear the description - get by rendered value
      const descriptionInput = screen.getByDisplayValue('A comprehensive training program');
      fireEvent.changeText(descriptionInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when no active days are selected', async () => {
      const programWithNoActiveDays: Program = {
        ...mockSimpleProgram,
        week: {
          days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
        },
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoActiveDays,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for component to fully render
      await waitFor(() => {
        const updateText = screen.queryByText('program.update');
        expect(updateText).toBeTruthy();
      });

      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when day name is missing', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Clear the day name - get by rendered value
      const dayNameInput = screen.getByDisplayValue('Push Day');
      fireEvent.changeText(dayNameInput, '');

      // Try to save
      await waitFor(() => {
        const updateText = screen.queryByText('program.update');
        expect(updateText).toBeTruthy();
      });
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when day has no exercises', async () => {
      const programWithNoExercises: Program = {
        ...mockSimpleProgram,
        week: {
          days: [
            {
              label: 'Day1',
              name: 'Push Day',
              exercises: [],
            },
            'rest',
            'rest',
            'rest',
            'rest',
            'rest',
            'rest',
          ],
        },
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoExercises,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize - check by rendered value
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Try to save
      await waitFor(() => {
        const updateText = screen.queryByText('program.update');
        expect(updateText).toBeTruthy();
      });
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when exercise has no valid sets', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Clear the reps input - get by rendered value
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('8');
        expect(repsInput).toBeTruthy();
        fireEvent.changeText(repsInput, '');
      });

      // Try to save
      await waitFor(() => {
        const updateText = screen.queryByText('program.update');
        expect(updateText).toBeTruthy();
      });
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when exercise has invalid set (reps=0)', async () => {
      useProgram.mockImplementation(() => ({
        program: mockSimpleProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Update set with invalid data (reps=0) - get by rendered values
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('8');
        const rirInput = screen.getByDisplayValue('2');
        expect(repsInput).toBeTruthy();
        expect(rirInput).toBeTruthy();
        fireEvent.changeText(repsInput, '0');
        fireEvent.changeText(rirInput, '2');
      });

      // Try to save with invalid set (reps=0)
      await waitFor(() => {
        const updateButton = screen.getByText('program.update');
        expect(updateButton).toBeTruthy();
        fireEvent.press(updateButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Alternating Program', () => {
    it('should display alternating weeks section when alternating type is selected', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
        expect(screen.getByText('program.defineTwoWeeks')).toBeTruthy();
      });
    });

    it('should render initial data correctly for alternating program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        // Check that program name is loaded - check rendered value
        const nameInput = screen.getByDisplayValue('My Alternating Program');
        expect(nameInput).toBeTruthy();
        expect(nameInput.props.value).toBe('My Alternating Program');
      });

      // Check that program description is loaded - check rendered value
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue('An alternating training program');
        expect(descriptionInput).toBeTruthy();
        expect(descriptionInput.props.value).toBe('An alternating training program');
      });

      // Check that program type is set to alternating (should show alternating weeks section)
      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
        expect(screen.getByText('program.defineTwoWeeks')).toBeTruthy();
      });

      // Check that alternating program type button is available
      expect(screen.getByText('program.alternating')).toBeTruthy();

      // Check that ALL day names are loaded correctly - exact check from rendered values
      await waitFor(() => {
        // Check rendered day name values
        const week1DayInput = screen.getByDisplayValue('Week 1 Push Day');
        expect(week1DayInput).toBeTruthy();
        expect(week1DayInput.props.value).toBe('Week 1 Push Day');

        const week2DayInput = screen.getByDisplayValue('Week 2 Pull Day');
        expect(week2DayInput).toBeTruthy();
        expect(week2DayInput.props.value).toBe('Week 2 Pull Day');

        // Verify exact count
        const allWeek1DayInputs = screen.getAllByDisplayValue('Week 1 Push Day');
        const allWeek2DayInputs = screen.getAllByDisplayValue('Week 2 Pull Day');
        expect(allWeek1DayInputs.length).toBe(1);
        expect(allWeek2DayInputs.length).toBe(1);
      });

      // Check that exercises are loaded with correct names
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
        expect(screen.getByText('1. Pull Ups')).toBeTruthy();
      });

      // Check that ALL set data is loaded correctly for both weeks - exact check from rendered values
      await waitFor(() => {
        // Check Week 1 rendered set values (Bench Press: 8 reps, 2 rir)
        const week1RepsInput = screen.getByDisplayValue('8');
        expect(week1RepsInput).toBeTruthy();
        expect(week1RepsInput.props.value).toBe('8');

        const week1RirInput = screen.getByDisplayValue('2');
        expect(week1RirInput).toBeTruthy();
        expect(week1RirInput.props.value).toBe('2');

        // Check Week 2 rendered set values (Pull Ups: 10 reps, 1 rir)
        const week2RepsInput = screen.getByDisplayValue('10');
        expect(week2RepsInput).toBeTruthy();
        expect(week2RepsInput.props.value).toBe('10');

        const week2RirInput = screen.getByDisplayValue('1');
        expect(week2RirInput).toBeTruthy();
        expect(week2RirInput.props.value).toBe('1');

        // Verify exact count of all inputs
        const allReps8Inputs = screen.getAllByDisplayValue('8');
        const allRir2Inputs = screen.getAllByDisplayValue('2');
        const allReps10Inputs = screen.getAllByDisplayValue('10');
        const allRir1Inputs = screen.getAllByDisplayValue('1');
        expect(allReps8Inputs.length).toBe(1);
        expect(allRir2Inputs.length).toBe(1);
        expect(allReps10Inputs.length).toBe(1);
        expect(allRir1Inputs.length).toBe(1);
      });

      // Verify exact exercise count and names
      const exerciseElements = screen.getAllByText(/^1\./);
      expect(exerciseElements.length).toBe(2);
      // Check that both exercises are present with correct names
      const exerciseTexts = exerciseElements.map((el) => el.props.children);
      expect(exerciseTexts.some((text) => text?.includes('Bench Press'))).toBe(true);
      expect(exerciseTexts.some((text) => text?.includes('Pull Ups'))).toBe(true);
    });

    it('should call handleSave when all required data is valid for alternating program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('program.update')).toBeTruthy();
      });

      // Click update button
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // Verify handleSave was called
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program name is missing for alternating program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('My Alternating Program');
        expect(nameInput).toBeTruthy();
      });

      // Clear the name - get by rendered value
      const nameInput = screen.getByDisplayValue('My Alternating Program');
      fireEvent.changeText(nameInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program description is missing for alternating program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue('An alternating training program');
        expect(descriptionInput).toBeTruthy();
      });

      // Clear the description - get by rendered value
      const descriptionInput = screen.getByDisplayValue('An alternating training program');
      fireEvent.changeText(descriptionInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 day name is missing', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Week 1 Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Clear Week 1 day name - get by rendered value
      const dayNameInput = screen.getByDisplayValue('Week 1 Push Day');
      fireEvent.changeText(dayNameInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 day name is missing', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Week 2 Pull Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Clear Week 2 day name - get by rendered value
      const dayNameInput = screen.getByDisplayValue('Week 2 Pull Day');
      fireEvent.changeText(dayNameInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 has no exercises', async () => {
      const programWithNoWeek1Exercises: Program = {
        ...mockAlternatingProgram,
        alternatingWeeks: [
          {
            days: [
              {
                label: 'Day1',
                name: 'Week 1 Push Day',
                exercises: [],
              },
              'rest',
              'rest',
              'rest',
              'rest',
              'rest',
              'rest',
            ],
          },
          mockAlternatingProgram.alternatingWeeks[1],
        ],
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoWeek1Exercises,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize - check by rendered value
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Week 1 Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 has no exercises', async () => {
      const programWithNoWeek2Exercises: Program = {
        ...mockAlternatingProgram,
        alternatingWeeks: [
          mockAlternatingProgram.alternatingWeeks[0],
          {
            days: [
              {
                label: 'Day1',
                name: 'Week 2 Pull Day',
                exercises: [],
              },
              'rest',
              'rest',
              'rest',
              'rest',
              'rest',
              'rest',
            ],
          },
        ],
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoWeek2Exercises,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize - check by rendered value
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Week 1 Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 exercise has no valid sets', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Clear the reps input for Week 1 - get by rendered value
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('8');
        expect(repsInput).toBeTruthy();
        fireEvent.changeText(repsInput, '');
      });

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 exercise has no valid sets', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Pull Ups')).toBeTruthy();
      });

      // Clear the reps input for Week 2 - get by rendered value
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('10');
        expect(repsInput).toBeTruthy();
        fireEvent.changeText(repsInput, '');
      });

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 1 exercise has invalid set (reps=0)', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Update set with invalid data (reps=0) for Week 1 - get by rendered values
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('8');
        const rirInput = screen.getByDisplayValue('2');
        expect(repsInput).toBeTruthy();
        expect(rirInput).toBeTruthy();
        fireEvent.changeText(repsInput, '0');
        fireEvent.changeText(rirInput, '2');
      });

      // Try to save with invalid set (reps=0)
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when Week 2 exercise has invalid set (reps=0)', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAlternatingProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Pull Ups')).toBeTruthy();
      });

      // Update set with invalid data (reps=0) for Week 2 - get by rendered values
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('10');
        const rirInput = screen.getByDisplayValue('1');
        expect(repsInput).toBeTruthy();
        expect(rirInput).toBeTruthy();
        fireEvent.changeText(repsInput, '0');
        fireEvent.changeText(rirInput, '1');
      });

      // Try to save with invalid set (reps=0)
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when alternating program has incomplete week data', async () => {
      const incompleteProgram: Program = {
        ...mockAlternatingProgram,
        alternatingWeeks: [
          mockAlternatingProgram.alternatingWeeks[0],
          {
            days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
          },
        ],
      };

      useProgram.mockImplementation(() => ({
        program: incompleteProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const updateButton = screen.getByText('program.update');
        expect(updateButton).toBeTruthy();
        fireEvent.press(updateButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Advanced Program', () => {
    it('should display phases section when advanced type is selected', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });
    });

    it('should display add phase button for advanced program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
      });
    });

    it('should add a new phase when add phase button is pressed', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        const addPhaseButton = screen.getByText('program.addPhase');
        expect(addPhaseButton).toBeTruthy();
        fireEvent.press(addPhaseButton);
      });

      // Should show phase name input after adding phase - check by rendered value
      await waitFor(() => {
        // Original phase should still be there
        const originalPhase = screen.getByDisplayValue('Strength Phase');
        expect(originalPhase).toBeTruthy();
        // New phase input should exist (empty or with default value)
        const allPhaseInputs = screen.queryAllByDisplayValue('');
        // At least one empty phase input should exist (the new one)
        expect(allPhaseInputs.length).toBeGreaterThan(0);
      });
    });

    it('should render initial data correctly for advanced program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        // Check that program name is loaded - check rendered value
        const nameInput = screen.getByDisplayValue('My Advanced Program');
        expect(nameInput).toBeTruthy();
        expect(nameInput.props.value).toBe('My Advanced Program');
      });

      // Check that program description is loaded - check rendered value
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue('An advanced training program');
        expect(descriptionInput).toBeTruthy();
        expect(descriptionInput.props.value).toBe('An advanced training program');
      });

      // Check that program type is set to advanced (should show phases section)
      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Check that advanced program type button is available
      expect(screen.getByText('program.advanced')).toBeTruthy();

      // Check that phase name is loaded - exact check from rendered value
      await waitFor(() => {
        const phaseNameInput = screen.getByDisplayValue('Strength Phase');
        expect(phaseNameInput).toBeTruthy();
        expect(phaseNameInput.props.value).toBe('Strength Phase');

        // Verify exact count
        const allPhaseNameInputs = screen.getAllByDisplayValue('Strength Phase');
        expect(allPhaseNameInputs.length).toBe(1);
      });

      // Check that day name is loaded - exact check from rendered value
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Push Day');
        expect(dayNameInput).toBeTruthy();
        expect(dayNameInput.props.value).toBe('Push Day');

        // Verify exact count
        const allDayNameInputs = screen.getAllByDisplayValue('Push Day');
        expect(allDayNameInputs.length).toBe(1);
      });

      // Check that exercise is loaded with correct name
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Check that set data is loaded correctly (reps and rir) - check ALL sets exactly from rendered values
      await waitFor(() => {
        // Check rendered reps value
        const repsInput = screen.getByDisplayValue('8');
        expect(repsInput).toBeTruthy();
        expect(repsInput.props.value).toBe('8');

        // Check rendered rir value
        const rirInput = screen.getByDisplayValue('2');
        expect(rirInput).toBeTruthy();
        expect(rirInput.props.value).toBe('2');

        // Verify exact count of all reps and rir inputs
        const allRepsInputs = screen.getAllByDisplayValue('8');
        const allRirInputs = screen.getAllByDisplayValue('2');
        expect(allRepsInputs.length).toBe(1);
        expect(allRirInputs.length).toBe(1);
      });

      // Verify exact exercise count and name
      const exerciseElements = screen.getAllByText(/^1\./);
      expect(exerciseElements.length).toBe(1);
      expect(exerciseElements[0].props.children).toContain('Bench Press');

      // Verify add phase button is present (confirming advanced program structure)
      await waitFor(() => {
        expect(screen.getByText('program.addPhase')).toBeTruthy();
      });
    });

    it('should call handleSave when all required data is valid for advanced program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('program.update')).toBeTruthy();
      });

      // Click update button
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      // Verify handleSave was called
      await waitFor(() => {
        expect(mockHandleSave).toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase name is missing', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const phaseNameInput = screen.getByDisplayValue('Strength Phase');
        expect(phaseNameInput).toBeTruthy();
      });

      // Clear the phase name - get by rendered value
      const phaseNameInput = screen.getByDisplayValue('Strength Phase');
      fireEvent.changeText(phaseNameInput, '');

      // Try to save
      await waitFor(() => {
        const updateButton = screen.getByText('program.update');
        expect(updateButton).toBeTruthy();
        fireEvent.press(updateButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program name is missing for advanced program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('My Advanced Program');
        expect(nameInput).toBeTruthy();
      });

      // Clear the name - get by rendered value
      const nameInput = screen.getByDisplayValue('My Advanced Program');
      fireEvent.changeText(nameInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when program description is missing for advanced program', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const descriptionInput = screen.getByDisplayValue('An advanced training program');
        expect(descriptionInput).toBeTruthy();
      });

      // Clear the description - get by rendered value
      const descriptionInput = screen.getByDisplayValue('An advanced training program');
      fireEvent.changeText(descriptionInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when day name is missing in phase week', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Clear the day name - get by rendered value
      const dayNameInput = screen.getByDisplayValue('Push Day');
      fireEvent.changeText(dayNameInput, '');

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase day has no exercises', async () => {
      const programWithNoExercises: Program = {
        ...mockAdvancedProgram,
        phases: [
          {
            ...mockAdvancedProgram.phases[0],
            weeks: [
              {
                days: [
                  {
                    label: 'Day1',
                    name: 'Push Day',
                    exercises: [],
                  },
                  'rest',
                  'rest',
                  'rest',
                  'rest',
                  'rest',
                  'rest',
                ],
              },
            ],
          },
        ],
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoExercises,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize - check by rendered value
      await waitFor(() => {
        const dayNameInput = screen.getByDisplayValue('Push Day');
        expect(dayNameInput).toBeTruthy();
      });

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase exercise has no valid sets', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Clear the reps input - get by rendered value
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('8');
        expect(repsInput).toBeTruthy();
        fireEvent.changeText(repsInput, '');
      });

      // Try to save
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase exercise has invalid set (reps=0)', async () => {
      useProgram.mockImplementation(() => ({
        program: mockAdvancedProgram,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Update set with invalid data (reps=0) - get by rendered values
      await waitFor(() => {
        const repsInput = screen.getByDisplayValue('8');
        const rirInput = screen.getByDisplayValue('2');
        expect(repsInput).toBeTruthy();
        expect(rirInput).toBeTruthy();
        fireEvent.changeText(repsInput, '0');
        fireEvent.changeText(rirInput, '2');
      });

      // Try to save with invalid set (reps=0)
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase week has no active days', async () => {
      const programWithNoActiveDays: Program = {
        ...mockAdvancedProgram,
        phases: [
          {
            ...mockAdvancedProgram.phases[0],
            weeks: [
              {
                days: ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'],
              },
            ],
          },
        ],
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoActiveDays,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Try to save without active days
      const updateButton = screen.getByText('program.update');
      fireEvent.press(updateButton);

      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });

    it('should not call handleSave when phase has no weeks', async () => {
      const programWithNoWeeks: Program = {
        ...mockAdvancedProgram,
        phases: [
          {
            ...mockAdvancedProgram.phases[0],
            weeks: [],
          },
        ],
      };

      useProgram.mockImplementation(() => ({
        program: programWithNoWeeks,
        isLoading: false,
        isError: false,
      }));

      render(
        <TestWrapper>
          <EditProgramScreen />
        </TestWrapper>,
      );

      // Try to save without weeks
      await waitFor(() => {
        const updateButton = screen.getByText('program.update');
        expect(updateButton).toBeTruthy();
        fireEvent.press(updateButton);
      });

      // handleSave should not be called (validation should fail)
      await waitFor(() => {
        expect(mockHandleSave).not.toHaveBeenCalled();
      });
    });
  });
});
