/**
 * Unit conversion utilities
 * All weights are stored in kg in the database
 * Frontend converts based on user preference
 */

// Weight conversions
export const kgToLb = (kg: number): number => {
  return Number((kg * 2.20462).toFixed(2));
};

export const lbToKg = (lb: number): number => {
  return Number((lb / 2.20462).toFixed(2));
};

// Distance/Height conversions
export const cmToFeet = (cm: number): { feet: number; inches: number } => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Number((totalInches % 12).toFixed(1));
  return { feet, inches };
};

export const feetToCm = (feet: number, inches: number = 0): number => {
  const totalInches = feet * 12 + inches;
  return Number((totalInches * 2.54).toFixed(1));
};

// Temperature conversions
export const celsiusToFahrenheit = (celsius: number): number => {
  return Number(((celsius * 9) / 5 + 32).toFixed(1));
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return Number((((fahrenheit - 32) * 5) / 9).toFixed(1));
};

/**
 * Format weight for display based on user preference
 */
export const formatWeight = (kg: number, unit: 'kg' | 'lb'): string => {
  if (unit === 'lb') {
    return `${kgToLb(kg)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
};

/**
 * Parse weight input and convert to kg for storage
 */
export const parseWeightInput = (value: string, unit: 'kg' | 'lb'): number => {
  const numValue = parseFloat(value);
  if (isNaN(numValue)) {
    return 0;
  }
  if (unit === 'lb') {
    return lbToKg(numValue);
  }
  return numValue;
};

/**
 * Convert weight from kg (storage) to display unit
 */
export const weightForDisplay = (kg: number, unit: 'kg' | 'lb'): number => {
  if (unit === 'lb') {
    return kgToLb(kg);
  }
  return kg;
};
