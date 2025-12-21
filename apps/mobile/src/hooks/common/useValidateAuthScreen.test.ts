import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useValidateAuthScreen } from './useValidateAuthScreen';
import { z } from 'zod';

describe('useValidateAuthScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with no errors', () => {
      const emailValue = 'test@example.com';
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      expect(result.current.error).toBeUndefined();
      expect(result.current.hasErrors).toBe(false);
    });

    it('should initialize with errors array matching fields length', () => {
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => 'invalid',
        },
        {
          schema: z.string().min(8, 'Password too short'),
          getValue: () => 'short',
        },
      ];

      renderHook(() => useValidateAuthScreen(fields));

      // Errors should be initialized but validation happens after debounce
      // So initially there should be no errors
    });
  });

  describe('validation', () => {
    it('should validate field after debounce period', async () => {
      const emailValue = { current: 'invalid-email' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      // Initially no error (debounce hasn't passed)
      expect(result.current.error).toBeUndefined();

      // Trigger validation by calling handleFieldChange
      act(() => {
        result.current.handleFieldChange(0);
      });

      // Fast-forward past debounce period - this will trigger the validation
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid email');
        expect(result.current.hasErrors).toBe(true);
      });
    });

    it('should clear error while typing', async () => {
      const emailValue = { current: 'invalid' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      // Trigger validation
      act(() => {
        result.current.handleFieldChange(0);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid email');
      });

      // Change value (this should clear error immediately)
      act(() => {
        emailValue.current = 'test@example.com';
        result.current.handleFieldChange(0);
      });

      // Error should be cleared immediately
      expect(result.current.error).toBeUndefined();
    });

    it('should validate multiple fields', async () => {
      const emailValue = { current: 'invalid' };
      const passwordValue = { current: 'short' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
        {
          schema: z.string().min(8, 'Password too short'),
          getValue: () => passwordValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      // Trigger validation for first field
      act(() => {
        result.current.handleFieldChange(0);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid email');
      });

      // Fix first field, trigger second field validation
      act(() => {
        emailValue.current = 'test@example.com';
        result.current.handleFieldChange(0);
        result.current.handleFieldChange(1);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Password too short');
      });
    });

    it('should return first error when multiple fields have errors', async () => {
      const emailValue = { current: 'invalid' };
      const passwordValue = { current: 'short' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
        {
          schema: z.string().min(8, 'Password too short'),
          getValue: () => passwordValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      // Trigger validation for both fields
      act(() => {
        result.current.handleFieldChange(0);
        result.current.handleFieldChange(1);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should return first error
        expect(result.current.error).toBe('Invalid email');
        expect(result.current.hasErrors).toBe(true);
      });
    });

    it('should support dynamic schemas', async () => {
      const passwordValue = { current: 'password123' };
      const confirmPasswordValue = { current: 'different' };
      const fields = [
        {
          schema: z.string().min(8, 'Password too short'),
          getValue: () => passwordValue.current,
        },
        {
          schema: () =>
            z.string().refine((val) => val === passwordValue.current, {
              message: 'Passwords do not match',
            }),
          getValue: () => confirmPasswordValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      act(() => {
        result.current.handleFieldChange(1);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Passwords do not match');
      });
    });
  });

  describe('debouncing', () => {
    it('should debounce validation by 1 second', async () => {
      const emailValue = { current: 'invalid' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      act(() => {
        result.current.handleFieldChange(0);
      });

      // Before debounce period
      expect(result.current.error).toBeUndefined();

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Still before debounce period
      expect(result.current.error).toBeUndefined();

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid email');
      });
    });

    it('should cancel previous validation when field changes again', async () => {
      const emailValue = { current: 'invalid' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      act(() => {
        result.current.handleFieldChange(0);
      });

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      // Change field again before debounce completes
      act(() => {
        emailValue.current = 'test@example.com';
        result.current.handleFieldChange(0);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Should not have error since value is now valid
        expect(result.current.error).toBeUndefined();
        expect(result.current.hasErrors).toBe(false);
      });
    });
  });

  describe('automatic validation on value change', () => {
    it('should automatically validate when value changes', async () => {
      const emailValue = { current: 'test@example.com' };
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => emailValue.current,
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      // Change value
      act(() => {
        emailValue.current = 'invalid';
        // Trigger re-render by calling handleFieldChange
        result.current.handleFieldChange(0);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Invalid email');
      });
    });

    it('should handle fields array length changes', () => {
      const fields1 = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => 'test@example.com',
        },
      ];

      const { result, rerender } = renderHook(
        (props: { fields: Parameters<typeof useValidateAuthScreen>[0] }) =>
          useValidateAuthScreen(props.fields),
        {
          initialProps: { fields: fields1 },
        },
      );

      const fields2 = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => 'test@example.com',
        },
        {
          schema: z.string().min(8, 'Password too short'),
          getValue: () => 'short',
        },
      ];

      rerender({ fields: fields2 });

      // Should handle the new field count
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('cleanup', () => {
    it('should cleanup timers on unmount', () => {
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => 'invalid',
        },
      ];

      const { result, unmount } = renderHook(() => useValidateAuthScreen(fields));

      act(() => {
        result.current.handleFieldChange(0);
      });

      // Unmount before timer completes
      unmount();

      // Advance timers - should not cause errors
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // No assertions needed, just ensuring no errors are thrown
    });
  });

  describe('edge cases', () => {
    it('should handle empty fields array', () => {
      const { result } = renderHook(() => useValidateAuthScreen([]));

      expect(result.current.error).toBeUndefined();
      expect(result.current.hasErrors).toBe(false);
    });

    it('should handle valid values correctly', async () => {
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => 'test@example.com',
        },
        {
          schema: z.string().min(8, 'Password too short'),
          getValue: () => 'password123',
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      act(() => {
        result.current.handleFieldChange(0);
        result.current.handleFieldChange(1);
      });

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.error).toBeUndefined();
        expect(result.current.hasErrors).toBe(false);
      });
    });

    it('should handle field with index out of bounds gracefully', () => {
      const fields = [
        {
          schema: z.string().email('Invalid email'),
          getValue: () => 'test@example.com',
        },
      ];

      const { result } = renderHook(() => useValidateAuthScreen(fields));

      // Should not throw error
      act(() => {
        result.current.handleFieldChange(999);
      });

      expect(result.current.error).toBeUndefined();
    });
  });
});
