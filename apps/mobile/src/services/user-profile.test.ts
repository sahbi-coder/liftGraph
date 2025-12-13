import { Firestore, Timestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserProfileService } from './user-profile';
import { ServiceError } from '@/utils/serviceErrors';

// Mock Firestore functions
jest.mock('firebase/firestore', () => {
  // Create a mock Timestamp class that works with instanceof and has toDate() method
  class Timestamp {
    seconds: number;
    nanoseconds: number;

    constructor(seconds: number, nanoseconds: number = 0) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }

    toDate(): Date {
      return new Date(this.seconds * 1000);
    }

    toMillis(): number {
      return this.seconds * 1000;
    }

    static fromDate(date: Date): Timestamp {
      return new Timestamp(Math.floor(date.getTime() / 1000));
    }

    static now(): Timestamp {
      return Timestamp.fromDate(new Date());
    }
  }

  return {
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: jest.fn(),
    updateDoc: jest.fn(),
    Timestamp,
  };
});

type MockOverrides = {
  doc?: jest.Mock;
  getDoc?: jest.Mock;
  setDoc?: jest.Mock;
  updateDoc?: jest.Mock;
  timestampNow?: jest.Mock;
};

const setupMocks = (overrides: Partial<MockOverrides> = {}) => {
  const defaultDate = new Date('2024-01-01T00:00:00Z');
  const defaultTimestamp = Timestamp.fromDate(defaultDate);

  const defaults = {
    doc: jest.fn().mockReturnValue({ id: 'mock-doc-id' }),
    getDoc: jest.fn().mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    }),
    setDoc: jest.fn().mockResolvedValue(undefined),
    updateDoc: jest.fn().mockResolvedValue(undefined),
    timestampNow: jest.fn().mockReturnValue(defaultTimestamp),
  };

  const mocks = { ...defaults, ...overrides };

  // Apply mocks
  (doc as jest.Mock).mockImplementation(mocks.doc);
  (getDoc as jest.Mock).mockImplementation(mocks.getDoc);
  (setDoc as jest.Mock).mockImplementation(mocks.setDoc);
  (updateDoc as jest.Mock).mockImplementation(mocks.updateDoc);

  // Mock Timestamp static methods using jest.spyOn
  jest.spyOn(Timestamp, 'now').mockImplementation(mocks.timestampNow);

  return mocks;
};

describe('UserProfileService', () => {
  let userProfileService: UserProfileService;
  let mockDb: Firestore;

  beforeEach(() => {
    mockDb = {} as Firestore;
    userProfileService = new UserProfileService(mockDb);
    jest.clearAllMocks();
  });

  describe('createUserProfile', () => {
    it('should create user profile with valid data', async () => {
      const uid = 'user123';
      const profileData = {
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          weightUnit: 'kg' as const,
          distanceUnit: 'cm' as const,
          temperatureUnit: 'celsius' as const,
          onboardingCompleted: false,
        },
      };

      const mockDocRef = { id: uid };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await userProfileService.createUserProfile(uid, profileData);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', uid);
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, {
        ...profileData,
        uid,
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should throw error for invalid preferences', async () => {
      const uid = 'user123';
      const profileData = {
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          weightUnit: 'invalid' as any,
          distanceUnit: 'cm' as const,
          temperatureUnit: 'celsius' as const,
        },
      };

      await expect(userProfileService.createUserProfile(uid, profileData)).rejects.toThrow(
        ServiceError,
      );
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should create profile without preferences', async () => {
      const uid = 'user123';
      const profileData = {
        email: 'test@example.com',
        displayName: 'Test User',
      } as any;

      const mockDocRef = { id: uid };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        setDoc: jest.fn().mockResolvedValue(undefined),
      });

      await userProfileService.createUserProfile(uid, profileData);

      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when it exists', async () => {
      const uid = 'user123';
      const mockDocRef = { id: uid };
      const now = new Date('2024-01-01T00:00:00Z');
      const createdAt = Timestamp.fromDate(now);
      const updatedAt = Timestamp.fromDate(now);

      const mockData = {
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          weightUnit: 'kg',
          distanceUnit: 'cm',
          temperatureUnit: 'celsius',
          onboardingCompleted: false,
        },
        createdAt,
        updatedAt,
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockData,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDocSnap),
      });

      const result = await userProfileService.getUserProfile(uid);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', uid);
      expect(getDoc).toHaveBeenCalledWith(mockDocRef);
      expect(result).toEqual({
        uid,
        email: 'test@example.com',
        displayName: 'Test User',
        preferences: {
          weightUnit: 'kg',
          distanceUnit: 'cm',
          temperatureUnit: 'celsius',
          onboardingCompleted: false,
        },
        createdAt: now,
        updatedAt: now,
      });
    });

    it('should return null when profile does not exist', async () => {
      const uid = 'user123';
      const mockDocRef = { id: uid };
      const mockDocSnap = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDocSnap),
      });

      const result = await userProfileService.getUserProfile(uid);

      expect(result).toBeNull();
    });

    it('should throw error for invalid profile data', async () => {
      const uid = 'user123';
      const mockDocRef = { id: uid };
      const now = new Date('2024-01-01T00:00:00Z');
      const createdAt = Timestamp.fromDate(now);
      const updatedAt = Timestamp.fromDate(now);

      const mockData = {
        email: 'invalid-email', // Invalid email
        displayName: 'Test User',
        preferences: {
          weightUnit: 'kg',
          distanceUnit: 'cm',
          temperatureUnit: 'celsius',
        },
        createdAt,
        updatedAt,
      };

      const mockDocSnap = {
        exists: () => true,
        data: () => mockData,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDocSnap),
      });

      await expect(userProfileService.getUserProfile(uid)).rejects.toThrow(ServiceError);
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile with partial data', async () => {
      const uid = 'user123';
      const updateData = {
        displayName: 'Updated Name',
      };

      const mockDocRef = { id: uid };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        updateDoc: jest.fn().mockResolvedValue(undefined),
      });

      await userProfileService.updateUserProfile(uid, updateData);

      expect(doc).toHaveBeenCalledWith(mockDb, 'users', uid);
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, {
        ...updateData,
        updatedAt: now,
      });
    });

    it('should update preferences', async () => {
      const uid = 'user123';
      const updateData = {
        preferences: {
          weightUnit: 'lb' as const,
          distanceUnit: 'ft' as const,
          temperatureUnit: 'fahrenheit' as const,
          onboardingCompleted: true,
        },
      };

      const mockDocRef = { id: uid };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        updateDoc: jest.fn().mockResolvedValue(undefined),
      });

      await userProfileService.updateUserProfile(uid, updateData);

      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
