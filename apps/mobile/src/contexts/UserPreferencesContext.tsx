import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  PropsWithChildren,
  useCallback,
} from 'react';
import { useAuth } from './AuthContext';
import { useDependencies } from '@/dependencies/provider';
import type { UserPreferences } from '@/domain';

type UserPreferencesContextType = {
  preferences: UserPreferences | null;
  loading: boolean;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  refreshPreferences: () => Promise<void>;
};

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  weightUnit: 'kg',
  distanceUnit: 'cm',
  temperatureUnit: 'celsius',
  onboardingCompleted: false,
};

export const UserPreferencesProvider = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const { services } = useDependencies();
  const firestoreService = services.firestore;
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      const profile = await firestoreService.getUserProfile(user.uid);
      if (profile?.preferences) {
        setPreferences(profile.preferences);
      } else {
        // No preferences yet, use defaults
        setPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      setPreferences(defaultPreferences);
    } finally {
      setLoading(false);
    }
  }, [user, firestoreService]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const updatePreferences = useCallback(
    async (prefs: Partial<UserPreferences>) => {
      if (!user) {
        throw new Error('User must be authenticated to update preferences');
      }

      const currentPrefs = preferences || defaultPreferences;
      const updatedPrefs: UserPreferences = {
        ...currentPrefs,
        ...prefs,
      };

      try {
        await firestoreService.updateUserProfile(user.uid, {
          preferences: updatedPrefs,
        });
        setPreferences(updatedPrefs);
      } catch (error) {
        console.error('Error updating preferences:', error);
        throw error;
      }
    },
    [user, preferences, firestoreService],
  );

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        loading,
        updatePreferences,
        refreshPreferences: loadPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
