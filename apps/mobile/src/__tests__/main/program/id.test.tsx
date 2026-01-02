/* eslint-disable import/first */
// All mocks must be defined BEFORE any imports that might use them
// Mock useProgram hook
jest.mock('@/hooks/program/useProgram', () => ({
  useProgram: jest.fn(),
}));

// Mock workout prefill context - must include all functions as jest.fn() to match testSetup
jest.mock('@/contexts/workoutPrefillContext', () => ({
  getWorkoutPrefillData: jest.fn(() => null),
  clearWorkoutPrefillData: jest.fn(),
  setWorkoutPrefillData: jest.fn(),
}));

// Import testSetup FIRST to ensure mocks are hoisted before any other imports
import { mockPush, mockBack, createTestWrapper, resetAllMocks } from '../../testSetup';

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import ProgramDetailsScreen from '@/app/(drawer)/(tabs)/program/[id]';
import type { Program } from '@/services';

// Override useLocalSearchParams for program detail screen (needs id param)
const expoRouter = jest.requireMock('expo-router');
expoRouter.useLocalSearchParams.mockReturnValue({ id: 'test-program-id' });

describe('ProgramDetailsScreen', () => {
  const TestWrapper = createTestWrapper();
  const { useProgram } = require('@/hooks/program/useProgram');
  const { setWorkoutPrefillData } = require('@/contexts/workoutPrefillContext');

  beforeEach(() => {
    resetAllMocks();
    // Reset useLocalSearchParams for program detail screen
    expoRouter.useLocalSearchParams.mockReturnValue({ id: 'test-program-id' });
    setWorkoutPrefillData.mockClear();
  });

  describe('Simple Program', () => {
    const simpleProgram: Program = {
      id: 'test-program-id',
      name: 'Simple Training Program',
      description: 'A simple weekly program',
      type: 'simple',
      isCustom: true,
      week: {
        name: 'Week 1',
        days: [
          {
            label: 'Day1',
            name: 'Push Day',
            exercises: [
              {
                id: 'bench-press',
                name: 'Bench Press',
                sets: [
                  { reps: 8, rir: 2 },
                  { reps: 8, rir: 2 },
                  { reps: 8, rir: 2 },
                ],
              },
              {
                id: 'shoulder-press',
                name: 'Shoulder Press',
                sets: [
                  { reps: 10, rir: 1 },
                  { reps: 10, rir: 1 },
                ],
              },
            ],
          },
          {
            label: 'Day2',
            name: 'Pull Day',
            exercises: [
              {
                id: 'deadlift',
                name: 'Deadlift',
                sets: [
                  { reps: 5, rir: 2 },
                  { reps: 5, rir: 2 },
                ],
              },
            ],
          },
          'rest',
          {
            label: 'Day4',
            name: 'Leg Day',
            exercises: [
              {
                id: 'squat',
                name: 'Squat',
                sets: [
                  { reps: 8, rir: 2 },
                  { reps: 8, rir: 2 },
                ],
              },
            ],
          },
        ],
      },
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    beforeEach(() => {
      useProgram.mockReturnValue({
        program: simpleProgram,
        isLoading: false,
        isError: false,
      });
    });

    it('should render the program details', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Simple Training Program')).toBeTruthy();
      });
    });

    it('should display program type as simple', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('program.simpleProgram')).toBeTruthy();
      });
    });

    it('should display weekly schedule label', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Multiple instances exist (header badge and section title)
        const elements = screen.getAllByText('program.weeklySchedule');
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display active days (excluding rest days)', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Helper function to find the Pressable parent and check its background color
        const getDayButtonColor = (dayText: string): string | undefined => {
          const textElement = screen.getByText(dayText);
          // Traverse up the tree to find the Pressable component
          let current = textElement.parent;
          while (current) {
            // Check if this is a Pressable (has onPress or style with backgroundColor)
            if (current.props?.style?.backgroundColor) {
              return current.props.style.backgroundColor;
            }
            // Also check if style is an array (React Native sometimes uses style arrays)
            if (Array.isArray(current.props?.style)) {
              const styleObj = current.props.style.find((s: any) => s?.backgroundColor);
              if (styleObj?.backgroundColor) {
                return styleObj.backgroundColor;
              }
            }
            current = current.parent;
          }
          return undefined;
        };

        // Active days: Day1, Day2, Day4 should have niceOrange background (#f97316)
        expect(getDayButtonColor('common.day 1')).toBe('#f97316');
        expect(getDayButtonColor('common.day 2')).toBe('#f97316');
        expect(getDayButtonColor('common.day 4')).toBe('#f97316');

        // Inactive days: Day3 (rest), Day5, Day6, Day7 should have darkGray background (#1b2433)
        expect(getDayButtonColor('common.day 3')).toBe('#1b2433');
        expect(getDayButtonColor('common.day 5')).toBe('#1b2433');
        expect(getDayButtonColor('common.day 6')).toBe('#1b2433');
        expect(getDayButtonColor('common.day 7')).toBe('#1b2433');
      });
    });

    it('should display exercises for selected day', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
        expect(screen.getByText('Shoulder Press')).toBeTruthy();
      });
    });

    it('should navigate to apply-workout when Apply Day button is pressed', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
      });

      const applyButtons = screen.getAllByText('program.applyDay');
      fireEvent.press(applyButtons[0]);

      expect(setWorkoutPrefillData).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('./apply-workout');
    });

    it('should show delete modal when delete button is pressed', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Simple Training Program')).toBeTruthy();
      });

      const deleteButton = screen.getByText('program.deleteProgram');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('program.deleteProgramConfirm')).toBeTruthy();
      });
    });

    it('should show loading state initially', () => {
      useProgram.mockReturnValue({
        program: null,
        isLoading: true,
        isError: false,
      });

      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      expect(screen.getByText('program.loadingProgram')).toBeTruthy();
    });

    it('should show error state when program cannot be loaded', () => {
      useProgram.mockReturnValue({
        program: null,
        isLoading: false,
        isError: false,
      });

      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      expect(screen.getByText('program.programCouldNotBeLoaded')).toBeTruthy();
    });
  });

  describe('Alternating Program', () => {
    const alternatingProgram: Program = {
      id: 'test-program-id',
      name: 'Alternating Training Program',
      description: 'A program with alternating weeks',
      type: 'alternating',
      isCustom: true,
      alternatingWeeks: [
        {
          name: 'Week A',
          days: [
            {
              label: 'Day1',
              name: 'Push Day',
              exercises: [
                {
                  id: 'bench-press',
                  name: 'Bench Press',
                  sets: [
                    { reps: 8, rir: 2 },
                    { reps: 8, rir: 2 },
                  ],
                },
              ],
            },
            {
              label: 'Day2',
              name: 'Pull Day',
              exercises: [
                {
                  id: 'deadlift',
                  name: 'Deadlift',
                  sets: [{ reps: 5, rir: 2 }],
                },
              ],
            },
            'rest',
            {
              label: 'Day4',
              name: 'Leg Day',
              exercises: [
                {
                  id: 'squat',
                  name: 'Squat',
                  sets: [{ reps: 8, rir: 2 }],
                },
              ],
            },
          ],
        },
        {
          name: 'Week B',
          days: [
            {
              label: 'Day1',
              name: 'Push Day',
              exercises: [
                {
                  id: 'incline-bench-press',
                  name: 'Incline Bench Press',
                  sets: [
                    { reps: 10, rir: 1 },
                    { reps: 10, rir: 1 },
                  ],
                },
              ],
            },
            {
              label: 'Day2',
              name: 'Pull Day',
              exercises: [
                {
                  id: 'bent-over-row',
                  name: 'Bent Over Row',
                  sets: [{ reps: 8, rir: 2 }],
                },
              ],
            },
            'rest',
            {
              label: 'Day4',
              name: 'Leg Day',
              exercises: [
                {
                  id: 'front-squat',
                  name: 'Front Squat',
                  sets: [{ reps: 10, rir: 1 }],
                },
              ],
            },
          ],
        },
      ],
    };

    beforeEach(() => {
      useProgram.mockReturnValue({
        program: alternatingProgram,
        isLoading: false,
        isError: false,
      });
    });

    it('should render the program details', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Alternating Training Program')).toBeTruthy();
      });
    });

    it('should display program type as alternating', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('program.alternatingProgram')).toBeTruthy();
      });
    });

    it('should display alternating weeks label', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Multiple instances exist (header badge and section title)
        const elements = screen.getAllByText('program.alternatingWeeks');
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should display Week A exercises by default', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
        expect(screen.getByText('Deadlift')).toBeTruthy();
        expect(screen.getByText('Squat')).toBeTruthy();
      });
    });

    it('should switch to Week B when Week B is selected', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
      });

      // Find and press Week 2 button (which corresponds to Week B)
      const week2Buttons = screen.getAllByText('program.week2');
      fireEvent.press(week2Buttons[0]);

      await waitFor(() => {
        expect(screen.getByText('Incline Bench Press')).toBeTruthy();
        expect(screen.getByText('Bent Over Row')).toBeTruthy();
        expect(screen.getByText('Front Squat')).toBeTruthy();
      });
    });

    it('should switch back to Week A when Week A is selected', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
      });

      // Switch to Week 2 first (which corresponds to Week B)
      const week2Buttons = screen.getAllByText('program.week2');
      fireEvent.press(week2Buttons[0]);

      await waitFor(() => {
        expect(screen.getByText('Incline Bench Press')).toBeTruthy();
      });

      // Switch back to Week 1 (which corresponds to Week A)
      const week1Buttons = screen.getAllByText('program.week1');
      fireEvent.press(week1Buttons[0]);

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
        expect(screen.queryByText('Incline Bench Press')).toBeNull();
      });
    });

    it('should navigate to apply-workout with correct exercises when Apply Day is pressed for Week A', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
      });

      const applyButtons = screen.getAllByText('program.applyDay');
      fireEvent.press(applyButtons[0]);

      expect(setWorkoutPrefillData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            exerciseId: 'bench-press',
            name: 'Bench Press',
          }),
        ]),
      );
      expect(mockPush).toHaveBeenCalledWith('./apply-workout');
    });

    it('should navigate to apply-workout with correct exercises when Apply Day is pressed for Week B', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Bench Press')).toBeTruthy();
      });

      // Switch to Week 2 (which corresponds to Week B)
      const week2Buttons = screen.getAllByText('program.week2');
      fireEvent.press(week2Buttons[0]);

      await waitFor(() => {
        expect(screen.getByText('Incline Bench Press')).toBeTruthy();
      });

      const applyButtons = screen.getAllByText('program.applyDay');
      fireEvent.press(applyButtons[0]);

      expect(setWorkoutPrefillData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            exerciseId: 'incline-bench-press',
            name: 'Incline Bench Press',
          }),
        ]),
      );
      expect(mockPush).toHaveBeenCalledWith('./apply-workout');
    });
  });

  describe('Advanced Program', () => {
    const advancedProgram: Program = {
      id: 'test-program-id',
      name: 'Advanced Training Program',
      description: 'A multi-phase advanced program',
      type: 'advanced',
      isCustom: true,
      phases: [
        {
          name: 'Phase 1: Strength',
          description: 'Building strength foundation',
          weeks: [
            {
              name: 'Week 1',
              days: [
                {
                  label: 'Day1',
                  name: 'Heavy Day',
                  exercises: [
                    {
                      id: 'bench-press',
                      name: 'Bench Press',
                      sets: [
                        { reps: 5, rir: 2 },
                        { reps: 5, rir: 2 },
                        { reps: 5, rir: 2 },
                      ],
                    },
                  ],
                },
                'rest',
                {
                  label: 'Day3',
                  name: 'Heavy Day',
                  exercises: [
                    {
                      id: 'squat',
                      name: 'Squat',
                      sets: [
                        { reps: 5, rir: 2 },
                        { reps: 5, rir: 2 },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'Week 2',
              days: [
                {
                  label: 'Day1',
                  name: 'Heavy Day',
                  exercises: [
                    {
                      id: 'bench-press',
                      name: 'Bench Press',
                      sets: [
                        { reps: 5, rir: 1 },
                        { reps: 5, rir: 1 },
                        { reps: 5, rir: 1 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'Phase 2: Hypertrophy',
          description: 'Building muscle mass',
          weeks: [
            {
              name: 'Week 1',
              days: [
                {
                  label: 'Day1',
                  name: 'Volume Day',
                  exercises: [
                    {
                      id: 'bench-press',
                      name: 'Bench Press',
                      sets: [
                        { reps: 10, rir: 1 },
                        { reps: 10, rir: 1 },
                        { reps: 10, rir: 1 },
                        { reps: 10, rir: 1 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    beforeEach(() => {
      useProgram.mockReturnValue({
        program: advancedProgram,
        isLoading: false,
        isError: false,
      });
    });

    it('should render the program details', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Advanced Training Program')).toBeTruthy();
      });
    });

    it('should display program type as advanced', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('program.advancedProgram')).toBeTruthy();
      });
    });

    it('should display all phases', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Phase 1: Strength')).toBeTruthy();
        expect(screen.getByText('Phase 2: Hypertrophy')).toBeTruthy();
      });
    });

    it('should display phase descriptions', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Building strength foundation')).toBeTruthy();
        expect(screen.getByText('Building muscle mass')).toBeTruthy();
      });
    });

    it('should display weeks within each phase', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Week names appear in parentheses, so we check for them
        const week1Elements = screen.getAllByText(/Week 1/);
        const week2Elements = screen.getAllByText(/Week 2/);
        expect(week1Elements.length).toBeGreaterThan(0);
        expect(week2Elements.length).toBeGreaterThan(0);
      });
    });

    it('should display exercises for each week', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Multiple instances of exercises exist across phases/weeks
        const benchPressElements = screen.getAllByText('Bench Press');
        const squatElements = screen.getAllByText('Squat');
        expect(benchPressElements.length).toBeGreaterThan(0);
        expect(squatElements.length).toBeGreaterThan(0);
      });
    });

    it('should display set information for exercises', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Multiple instances of reps and RIR exist across sets
        const repsElements = screen.getAllByText('5');
        const rirElements = screen.getAllByText('2');
        expect(repsElements.length).toBeGreaterThan(0);
        expect(rirElements.length).toBeGreaterThan(0);
      });
    });

    it('should navigate to apply-workout when Apply Day button is pressed', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        // Multiple instances of Bench Press exist, just verify at least one exists
        const benchPressElements = screen.getAllByText('Bench Press');
        expect(benchPressElements.length).toBeGreaterThan(0);
      });

      const applyButtons = screen.getAllByText('program.applyDay');
      fireEvent.press(applyButtons[0]);

      expect(setWorkoutPrefillData).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('./apply-workout');
    });

    it('should show delete modal when delete button is pressed', async () => {
      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Advanced Training Program')).toBeTruthy();
      });

      const deleteButton = screen.getByText('program.deleteProgram');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('program.deleteProgramConfirm')).toBeTruthy();
      });
    });

    it('should handle program deletion successfully', async () => {
      jest.useFakeTimers();

      // Mock ProgramsService deleteProgram to resolve successfully
      const ProgramsService = jest.requireMock('@/services/programs').ProgramsService;
      const mockDeleteProgram = jest.fn().mockResolvedValue(undefined);
      ProgramsService.mockImplementation(() => ({
        deleteProgram: mockDeleteProgram,
        createProgram: jest.fn(),
        getProgram: jest.fn(),
        updateProgram: jest.fn(),
        getUserPrograms: jest.fn(),
      }));

      render(
        <TestWrapper>
          <ProgramDetailsScreen />
        </TestWrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText('Advanced Training Program')).toBeTruthy();
      });

      // Open delete modal
      const deleteButton = screen.getByText('program.deleteProgram');
      fireEvent.press(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('program.deleteProgramConfirm')).toBeTruthy();
      });

      // Confirm deletion
      const confirmButton = screen.getByText('common.delete');
      fireEvent.press(confirmButton);

      await act(async () => {
        await jest.runAllTimersAsync();
      });

      expect(mockBack).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });
});
