export type UserPreferences = {
  weightUnit: 'kg' | 'lb';
  distanceUnit: 'cm' | 'ft';
  temperatureUnit: 'celsius' | 'fahrenheit';
  onboardingCompleted?: boolean;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
};
