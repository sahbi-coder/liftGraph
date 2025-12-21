import { useEffect, useRef, useState, useCallback } from 'react';
import { z } from 'zod';

interface ValidationField {
  schema: z.ZodSchema | (() => z.ZodSchema);
  getValue: () => string;
}

export function useValidateAuthScreen(fields: ValidationField[]) {
  const [errors, setErrors] = useState<(string | undefined)[]>(
    new Array(fields.length).fill(undefined),
  );
  const debounceTimers = useRef<{ [key: number]: ReturnType<typeof setTimeout> }>({});
  const previousValues = useRef<string[]>(fields.map((field) => field.getValue()));

  const validateField = useCallback(
    (index: number) => {
      const field = fields[index];
      if (!field) return;

      const value = field.getValue();

      // Get schema (support both static and dynamic schemas)
      const schema = typeof field.schema === 'function' ? field.schema() : field.schema;

      // Validate the field
      const result = schema.safeParse(value);

      if (!result.success) {
        const errorMessage = result.error.errors[0].message;
        setErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = errorMessage;
          return newErrors;
        });
      } else {
        setErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = undefined;
          return newErrors;
        });
      }
    },
    [fields],
  );

  const handleFieldChange = useCallback(
    (index: number) => {
      // Clear existing timer for this field
      if (debounceTimers.current[index]) {
        clearTimeout(debounceTimers.current[index]);
      }

      // Clear errors while typing
      setErrors((prev) => {
        const newErrors = [...prev];
        newErrors[index] = undefined;
        return newErrors;
      });

      // Set new timer for validation after 1 second
      debounceTimers.current[index] = setTimeout(() => {
        validateField(index);
      }, 1000);
    },
    [validateField],
  );

  // Watch for value changes and trigger validation
  useEffect(() => {
    // Update arrays if fields length changed
    if (previousValues.current.length !== fields.length) {
      previousValues.current = fields.map((field) => field.getValue());
      setErrors(new Array(fields.length).fill(undefined));
    }

    const currentValues = fields.map((field) => field.getValue());

    fields.forEach((field, index) => {
      const currentValue = currentValues[index];
      const previousValue = previousValues.current[index];

      // If value changed, trigger validation
      if (currentValue !== previousValue) {
        previousValues.current[index] = currentValue;
        handleFieldChange(index);
      }
    });
  });

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach((timer) => {
        clearTimeout(timer);
      });
    };
  }, []);

  const hasErrors = errors.some((error) => error !== undefined);

  return {
    error: errors.filter((error) => error !== undefined)[0] || undefined,
    handleFieldChange,
    hasErrors,
  };
}
