/* eslint-disable import/first */
// All mocks must be defined BEFORE any imports that might use them

// Only mock hooks that make API calls
// Set up default mock that returns isSaving: false
// This will be overridden in beforeEach with a smarter mock
jest.mock('@/hooks/program/useProgramSave', () => ({
  useProgramSave: jest.fn(() => ({
    handleSave: jest.fn(),
    isSaving: false,
  })),
}));

// Mock useProgram hook
jest.mock('@/hooks/program/useProgram', () => ({
  useProgram: jest.fn(() => ({
    program: null,
    isLoading: false,
    isError: false,
  })),
}));

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

// Import testSetup FIRST to ensure mocks are hoisted before any other imports
// Note: expo-router is already mocked in testSetup.tsx
import { createTestWrapper, resetAllMocks } from '../../testSetup';
import { useLocalSearchParams } from 'expo-router';

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import EditProgramScreen from '@/app/(drawer)/(tabs)/program/edit';
import type { Program } from '@/domain/program';

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

    const nameInput = screen.getByPlaceholderText('program.enterProgramName');
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

    const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
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

    const nameInput = screen.getByPlaceholderText('program.enterProgramName');
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

    const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
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
        // Check that program name is loaded
        const nameInput = screen.getByPlaceholderText('program.enterProgramName');
        expect(nameInput.props.value).toBe('My Training Program');
      });

      // Check that program description is loaded
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      expect(descriptionInput.props.value).toBe('A comprehensive training program');

      // Check that program type is set to simple (should show week section)
      await waitFor(() => {
        expect(screen.getByText('common.week')).toBeTruthy();
      });

      // Check that simple program type button is selected (not explicitly checked, but week section presence confirms it)
      expect(screen.getByText('program.simple')).toBeTruthy();

      // Check that day name is loaded
      await waitFor(() => {
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
        expect(dayNameInput.props.value).toBe('Push Day');
      });

      // Check that exercise is loaded with correct name
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Check that set data is loaded correctly (reps and rir) - check ALL sets exactly
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');

        // Exact count: 1 set for 1 exercise
        expect(repsInputs.length).toBe(1);
        expect(rirInputs.length).toBe(1);

        // Check ALL set values exactly
        expect(repsInputs[0].props.value).toBe('8');
        expect(rirInputs[0].props.value).toBe('2');
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
        const nameInput = screen.getByPlaceholderText('program.enterProgramName');
        expect(nameInput).toBeTruthy();
      });

      // Clear the name
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
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
        const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
        expect(descriptionInput).toBeTruthy();
      });

      // Clear the description
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
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
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
        expect(dayNameInput).toBeTruthy();
      });

      // Clear the day name
      const dayNameInput = screen.getByPlaceholderText('program.dayName');
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

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInput = screen.getByPlaceholderText('program.dayName');
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

      // Clear the reps input
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        expect(repsInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '');
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

      // Update set with invalid data (reps=0)
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
        // Check that program name is loaded
        const nameInput = screen.getByPlaceholderText('program.enterProgramName');
        expect(nameInput.props.value).toBe('My Alternating Program');
      });

      // Check that program description is loaded
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      expect(descriptionInput.props.value).toBe('An alternating training program');

      // Check that program type is set to alternating (should show alternating weeks section)
      await waitFor(() => {
        expect(screen.getByText('program.alternatingWeeks')).toBeTruthy();
        expect(screen.getByText('program.defineTwoWeeks')).toBeTruthy();
      });

      // Check that alternating program type button is available
      expect(screen.getByText('program.alternating')).toBeTruthy();

      // Check that ALL day names are loaded correctly - exact check
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        // Exact count: 1 day for Week 1 + 1 day for Week 2 = 2 total
        expect(dayNameInputs.length).toBe(2);

        // Check ALL day names exactly
        expect(dayNameInputs[0].props.value).toBe('Week 1 Push Day');
        expect(dayNameInputs[1].props.value).toBe('Week 2 Pull Day');
      });

      // Check that exercises are loaded with correct names
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
        expect(screen.getByText('1. Pull Ups')).toBeTruthy();
      });

      // Check that ALL set data is loaded correctly for both weeks - exact check
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');

        // Exact count: 1 set for Week 1 exercise + 1 set for Week 2 exercise = 2 total
        expect(repsInputs.length).toBe(2);
        expect(rirInputs.length).toBe(2);

        // Check ALL Week 1 set values exactly (Bench Press: 8 reps, 2 rir)
        expect(repsInputs[0].props.value).toBe('8');
        expect(rirInputs[0].props.value).toBe('2');

        // Check ALL Week 2 set values exactly (Pull Ups: 10 reps, 1 rir)
        expect(repsInputs[1].props.value).toBe('10');
        expect(rirInputs[1].props.value).toBe('1');
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
        const nameInput = screen.getByPlaceholderText('program.enterProgramName');
        expect(nameInput).toBeTruthy();
      });

      // Clear the name
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
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
        const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
        expect(descriptionInput).toBeTruthy();
      });

      // Clear the description
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
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
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
      });

      // Clear Week 1 day name
      const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
      fireEvent.changeText(dayNameInputs[0], '');

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
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(1);
      });

      // Clear Week 2 day name
      const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
      fireEvent.changeText(dayNameInputs[1], '');

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

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
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

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
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

      // Clear the reps input for Week 1
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        expect(repsInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '');
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

      // Clear the reps input for Week 2 (last one)
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        if (repsInputs.length > 1) {
          const lastRepsIndex = repsInputs.length - 1;
          fireEvent.changeText(repsInputs[lastRepsIndex], '');
        }
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

      // Update set with invalid data (reps=0) for Week 1
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        if (repsInputs.length > 0 && rirInputs.length > 0) {
          fireEvent.changeText(repsInputs[0], '0');
          fireEvent.changeText(rirInputs[0], '2');
        }
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

      // Update set with invalid data (reps=0) for Week 2
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

      // Should show phase name input after adding phase
      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(1); // Original + new phase
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
        // Check that program name is loaded
        const nameInput = screen.getByPlaceholderText('program.enterProgramName');
        expect(nameInput.props.value).toBe('My Advanced Program');
      });

      // Check that program description is loaded
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
      expect(descriptionInput.props.value).toBe('An advanced training program');

      // Check that program type is set to advanced (should show phases section)
      await waitFor(() => {
        expect(screen.getByText('program.phases')).toBeTruthy();
      });

      // Check that advanced program type button is available
      expect(screen.getByText('program.advanced')).toBeTruthy();

      // Check that phase name is loaded - exact check
      await waitFor(() => {
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        // Exact count: 1 phase
        expect(phaseNameInputs.length).toBe(1);
        expect(phaseNameInputs[0].props.value).toBe('Strength Phase');
      });

      // Check that day name is loaded - exact check
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        // Exact count: 1 day in the phase week
        expect(dayNameInputs.length).toBe(1);
        expect(dayNameInputs[0].props.value).toBe('Push Day');
      });

      // Check that exercise is loaded with correct name
      await waitFor(() => {
        expect(screen.getByText('1. Bench Press')).toBeTruthy();
      });

      // Check that set data is loaded correctly (reps and rir) - check ALL sets exactly
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');

        // Exact count: 1 set for 1 exercise in the phase
        expect(repsInputs.length).toBe(1);
        expect(rirInputs.length).toBe(1);

        // Check ALL set values exactly
        expect(repsInputs[0].props.value).toBe('8');
        expect(rirInputs[0].props.value).toBe('2');
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
        const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
        expect(phaseNameInputs.length).toBeGreaterThan(0);
      });

      // Clear the phase name
      const phaseNameInputs = screen.getAllByPlaceholderText(/program\.phases/);
      fireEvent.changeText(phaseNameInputs[0], '');

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
        const nameInput = screen.getByPlaceholderText('program.enterProgramName');
        expect(nameInput).toBeTruthy();
      });

      // Clear the name
      const nameInput = screen.getByPlaceholderText('program.enterProgramName');
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
        const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
        expect(descriptionInput).toBeTruthy();
      });

      // Clear the description
      const descriptionInput = screen.getByPlaceholderText('program.enterProgramDescription');
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
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
      });

      // Clear the day name
      const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
      fireEvent.changeText(dayNameInputs[0], '');

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

      // Wait for form to initialize
      await waitFor(() => {
        const dayNameInputs = screen.getAllByPlaceholderText('program.dayName');
        expect(dayNameInputs.length).toBeGreaterThan(0);
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

      // Clear the reps input
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        expect(repsInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '');
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

      // Update set with invalid data (reps=0)
      await waitFor(() => {
        const repsInputs = screen.getAllByPlaceholderText('common.reps');
        const rirInputs = screen.getAllByPlaceholderText('workout.rir');
        expect(repsInputs.length).toBeGreaterThan(0);
        expect(rirInputs.length).toBeGreaterThan(0);
        fireEvent.changeText(repsInputs[0], '0');
        fireEvent.changeText(rirInputs[0], '2');
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
