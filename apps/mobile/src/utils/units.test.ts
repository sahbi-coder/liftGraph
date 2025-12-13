import {
  kgToLb,
  lbToKg,
  cmToFeet,
  feetToCm,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatWeight,
  parseWeightInput,
  weightForDisplay,
} from './units';

describe('Weight Conversions', () => {
  describe('kgToLb', () => {
    it('should convert kilograms to pounds correctly', () => {
      expect(kgToLb(1)).toBe(2.2);
      expect(kgToLb(10)).toBe(22.05);
      expect(kgToLb(50)).toBe(110.23);
      expect(kgToLb(100)).toBe(220.46);
    });

    it('should handle zero', () => {
      expect(kgToLb(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(kgToLb(2.5)).toBe(5.51);
      expect(kgToLb(0.5)).toBe(1.1);
    });

    it('should round to 2 decimal places', () => {
      const result = kgToLb(1.234);
      expect(result).toBe(2.72);
    });
  });

  describe('lbToKg', () => {
    it('should convert pounds to kilograms correctly', () => {
      expect(lbToKg(1)).toBe(0.45);
      expect(lbToKg(10)).toBe(4.54);
      expect(lbToKg(50)).toBe(22.68);
      expect(lbToKg(100)).toBe(45.36);
    });

    it('should handle zero', () => {
      expect(lbToKg(0)).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(lbToKg(2.5)).toBe(1.13);
      expect(lbToKg(0.5)).toBe(0.23);
    });

    it('should round to 2 decimal places', () => {
      const result = lbToKg(1.234);
      expect(result).toBe(0.56);
      expect(typeof result).toBe('number');
    });

    it('should be inverse of kgToLb (within rounding)', () => {
      const kg = 10;
      const lb = kgToLb(kg);
      const backToKg = lbToKg(lb);
      expect(backToKg).toBeCloseTo(kg, 1);
    });
  });
});

describe('Distance/Height Conversions', () => {
  describe('cmToFeet', () => {
    it('should convert centimeters to feet and inches correctly', () => {
      const result1 = cmToFeet(30.48); // 1 foot
      expect(result1.feet).toBe(1);
      expect(result1.inches).toBe(0);

      const result2 = cmToFeet(182.88); // 6 feet
      expect(result2.feet).toBe(6);
      expect(result2.inches).toBe(0);

      const result3 = cmToFeet(175.26); // 5 feet 9 inches
      expect(result3.feet).toBe(5);
      expect(result3.inches).toBeCloseTo(9, 0);
    });

    it('should handle zero', () => {
      const result = cmToFeet(0);
      expect(result.feet).toBe(0);
      expect(result.inches).toBe(0);
    });

    it('should handle decimal inches', () => {
      const result = cmToFeet(170.18); // 5 feet 7 inches
      expect(result.feet).toBe(5);
      expect(result.inches).toBeCloseTo(7, 0);
    });

    it('should round inches to 1 decimal place', () => {
      const result = cmToFeet(100);
      expect(result.inches).toBe(3.4);
      expect(typeof result.inches).toBe('number');
    });
  });

  describe('feetToCm', () => {
    it('should convert feet and inches to centimeters correctly', () => {
      expect(feetToCm(1, 0)).toBe(30.5); // 1 foot = 30.48cm, rounded to 30.5
      expect(feetToCm(6, 0)).toBe(182.9); // 6 feet = 182.88cm, rounded to 182.9
      expect(feetToCm(5, 9)).toBe(175.3);
    });

    it('should handle zero', () => {
      expect(feetToCm(0, 0)).toBe(0);
    });

    it('should handle inches only when feet is 0', () => {
      expect(feetToCm(0, 12)).toBe(30.5); // 12 inches = 1 foot
    });

    it('should handle default inches parameter', () => {
      expect(feetToCm(5)).toBe(152.4);
    });

    it('should round to 1 decimal place', () => {
      const result = feetToCm(5, 7.5);
      expect(result).toBe(171.4);
      expect(typeof result).toBe('number');
    });

    it('should be inverse of cmToFeet (within rounding)', () => {
      const cm = 175;
      const { feet, inches } = cmToFeet(cm);
      const backToCm = feetToCm(feet, inches);
      expect(backToCm).toBeCloseTo(cm, 0);
    });
  });
});

describe('Temperature Conversions', () => {
  describe('celsiusToFahrenheit', () => {
    it('should convert celsius to fahrenheit correctly', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(celsiusToFahrenheit(37)).toBe(98.6);
    });

    it('should handle negative temperatures', () => {
      expect(celsiusToFahrenheit(-40)).toBe(-40); // -40 is the same in both
      expect(celsiusToFahrenheit(-10)).toBe(14);
    });

    it('should handle decimal values', () => {
      expect(celsiusToFahrenheit(20.5)).toBe(68.9);
      expect(celsiusToFahrenheit(36.5)).toBe(97.7);
    });

    it('should round to 1 decimal place', () => {
      const result = celsiusToFahrenheit(25.123);
      expect(result).toBe(77.2);
      expect(typeof result).toBe('number');
    });
  });

  describe('fahrenheitToCelsius', () => {
    it('should convert fahrenheit to celsius correctly', () => {
      expect(fahrenheitToCelsius(32)).toBe(0);
      expect(fahrenheitToCelsius(212)).toBe(100);
      expect(fahrenheitToCelsius(98.6)).toBe(37);
    });

    it('should handle negative temperatures', () => {
      expect(fahrenheitToCelsius(-40)).toBe(-40); // -40 is the same in both
      expect(fahrenheitToCelsius(14)).toBe(-10);
    });

    it('should handle decimal values', () => {
      expect(fahrenheitToCelsius(68.9)).toBe(20.5);
      expect(fahrenheitToCelsius(97.7)).toBe(36.5);
    });

    it('should round to 1 decimal place', () => {
      const result = fahrenheitToCelsius(77.123);
      expect(result).toBe(25.1);
      expect(typeof result).toBe('number');
    });

    it('should be inverse of celsiusToFahrenheit (within rounding)', () => {
      const celsius = 25;
      const fahrenheit = celsiusToFahrenheit(celsius);
      const backToCelsius = fahrenheitToCelsius(fahrenheit);
      expect(backToCelsius).toBeCloseTo(celsius, 0);
    });
  });
});

describe('Weight Formatting and Parsing', () => {
  describe('formatWeight', () => {
    it('should format weight in kg correctly', () => {
      expect(formatWeight(10, 'kg')).toBe('10.0 kg');
      expect(formatWeight(50.5, 'kg')).toBe('50.5 kg');
      expect(formatWeight(0, 'kg')).toBe('0.0 kg');
    });

    it('should format weight in lb correctly', () => {
      expect(formatWeight(10, 'lb')).toBe('22.05 lbs');
      expect(formatWeight(50, 'lb')).toBe('110.23 lbs');
      expect(formatWeight(0, 'lb')).toBe('0 lbs');
    });

    it('should handle decimal values', () => {
      expect(formatWeight(10.123, 'kg')).toBe('10.1 kg');
      expect(formatWeight(10.123, 'lb')).toBe('22.32 lbs');
    });
  });

  describe('parseWeightInput', () => {
    it('should parse and convert kg input to kg', () => {
      expect(parseWeightInput('10', 'kg')).toBe(10);
      expect(parseWeightInput('50.5', 'kg')).toBe(50.5);
      expect(parseWeightInput('0', 'kg')).toBe(0);
    });

    it('should parse and convert lb input to kg', () => {
      expect(parseWeightInput('10', 'lb')).toBe(4.54);
      expect(parseWeightInput('50', 'lb')).toBe(22.68);
      expect(parseWeightInput('0', 'lb')).toBe(0);
    });

    it('should handle invalid input', () => {
      expect(parseWeightInput('', 'kg')).toBe(0);
      expect(parseWeightInput('abc', 'kg')).toBe(0);
      expect(parseWeightInput('', 'lb')).toBe(0);
      expect(parseWeightInput('abc', 'lb')).toBe(0);
    });

    it('should handle decimal input', () => {
      expect(parseWeightInput('10.5', 'kg')).toBe(10.5);
      expect(parseWeightInput('10.5', 'lb')).toBe(4.76);
    });

    it('should handle negative input', () => {
      expect(parseWeightInput('-10', 'kg')).toBe(-10);
      expect(parseWeightInput('-10', 'lb')).toBe(-4.54);
    });
  });

  describe('weightForDisplay', () => {
    it('should return kg value when unit is kg', () => {
      expect(weightForDisplay(10, 'kg')).toBe(10);
      expect(weightForDisplay(50.5, 'kg')).toBe(50.5);
      expect(weightForDisplay(0, 'kg')).toBe(0);
    });

    it('should convert kg to lb when unit is lb', () => {
      expect(weightForDisplay(10, 'lb')).toBe(22.05);
      expect(weightForDisplay(50, 'lb')).toBe(110.23);
      expect(weightForDisplay(0, 'lb')).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(weightForDisplay(10.5, 'kg')).toBe(10.5);
      expect(weightForDisplay(10.5, 'lb')).toBe(23.15);
    });

    it('should be consistent with formatWeight', () => {
      const kg = 50;
      const displayValue = weightForDisplay(kg, 'lb');
      const formatted = formatWeight(kg, 'lb');
      expect(formatted).toBe(`${displayValue.toFixed(2)} lbs`);
    });
  });
});
