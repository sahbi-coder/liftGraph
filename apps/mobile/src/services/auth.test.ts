import {
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { AuthService } from './auth';

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}));

type MockOverrides = {
  createUserWithEmailAndPassword?: jest.Mock;
  signInWithEmailAndPassword?: jest.Mock;
  signOut?: jest.Mock;
  sendPasswordResetEmail?: jest.Mock;
  updateProfile?: jest.Mock;
};

const setupMocks = (overrides: Partial<MockOverrides> = {}) => {
  const defaults = {
    createUserWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: 'default-user',
        email: 'default@example.com',
        displayName: null,
        metadata: { creationTime: null },
      },
    }),
    signInWithEmailAndPassword: jest.fn().mockResolvedValue({
      user: {
        uid: 'default-user',
        email: 'default@example.com',
      },
    }),
    signOut: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
    updateProfile: jest.fn().mockResolvedValue(undefined),
  };

  const mocks = { ...defaults, ...overrides };

  // Apply mocks
  (createUserWithEmailAndPassword as jest.Mock).mockImplementation(
    mocks.createUserWithEmailAndPassword,
  );
  (signInWithEmailAndPassword as jest.Mock).mockImplementation(mocks.signInWithEmailAndPassword);
  (firebaseSignOut as jest.Mock).mockImplementation(mocks.signOut);
  (sendPasswordResetEmail as jest.Mock).mockImplementation(mocks.sendPasswordResetEmail);
  (updateProfile as jest.Mock).mockImplementation(mocks.updateProfile);

  return mocks;
};

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuth: Auth & { currentUser: User | null };

  beforeEach(() => {
    mockAuth = { currentUser: null } as Auth & { currentUser: User | null };
    authService = new AuthService(mockAuth);
    jest.clearAllMocks();
  });

  describe('signUpWithEmail', () => {
    it('should create user with email and password and update profile', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';

      const mockUser = {
        uid: 'user123',
        email,
        displayName: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
        },
      } as User;

      const mockUserCredential = {
        user: mockUser,
      } as UserCredential;

      setupMocks({
        createUserWithEmailAndPassword: jest.fn().mockResolvedValue(mockUserCredential),
        updateProfile: jest.fn().mockResolvedValue(undefined),
      });

      const result = await authService.signUpWithEmail(email, password, displayName);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, email, password);
      expect(updateProfile).toHaveBeenCalledWith(mockUser, { displayName });
      expect(result).toBe(mockUserCredential);
    });

    it('should throw error if user creation fails', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';

      const error = new Error('Email already in use');
      setupMocks({
        createUserWithEmailAndPassword: jest.fn().mockRejectedValue(error),
      });

      await expect(authService.signUpWithEmail(email, password, displayName)).rejects.toThrow(
        'Email already in use',
      );
      expect(updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('signInWithEmail', () => {
    it('should sign in user with email and password', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      const mockUser = {
        uid: 'user123',
        email,
      } as User;

      const mockUserCredential = {
        user: mockUser,
      } as UserCredential;

      setupMocks({
        signInWithEmailAndPassword: jest.fn().mockResolvedValue(mockUserCredential),
      });

      const result = await authService.signInWithEmail(email, password);

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, email, password);
      expect(result).toBe(mockUserCredential);
    });

    it('should throw error if sign in fails', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const error = new Error('Invalid credentials');
      setupMocks({
        signInWithEmailAndPassword: jest.fn().mockRejectedValue(error),
      });

      await expect(authService.signInWithEmail(email, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      setupMocks({
        signOut: jest.fn().mockResolvedValue(undefined),
      });

      await authService.signOut();

      expect(firebaseSignOut).toHaveBeenCalledWith(mockAuth);
    });

    it('should throw error if sign out fails', async () => {
      const error = new Error('Sign out failed');
      setupMocks({
        signOut: jest.fn().mockRejectedValue(error),
      });

      await expect(authService.signOut()).rejects.toThrow('Sign out failed');
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      const email = 'test@example.com';

      setupMocks({
        sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
      });

      await authService.resetPassword(email);

      expect(sendPasswordResetEmail).toHaveBeenCalledWith(mockAuth, email);
    });

    it('should throw error if reset fails', async () => {
      const email = 'nonexistent@example.com';
      const error = new Error('User not found');
      setupMocks({
        sendPasswordResetEmail: jest.fn().mockRejectedValue(error),
      });

      await expect(authService.resetPassword(email)).rejects.toThrow('User not found');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user if authenticated', () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
      } as User;

      mockAuth.currentUser = mockUser;

      const result = authService.getCurrentUser();

      expect(result).toBe(mockUser);
    });

    it('should return null if not authenticated', () => {
      mockAuth.currentUser = null;

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('toAuthUser', () => {
    it('should convert User to AuthUser with all fields', () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
        },
      } as User;

      const result = authService.toAuthUser(mockUser);

      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      });
    });

    it('should handle missing email and displayName', () => {
      const mockUser = {
        uid: 'user123',
        email: null,
        displayName: null,
        metadata: {
          creationTime: '2024-01-01T00:00:00Z',
        },
      } as unknown as User;

      const result = authService.toAuthUser(mockUser);

      expect(result).toEqual({
        uid: 'user123',
        email: '',
        displayName: '',
        createdAt: new Date('2024-01-01T00:00:00Z'),
      });
    });

    it('should handle missing creation time', () => {
      const mockUser = {
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        metadata: {
          creationTime: null,
        },
      } as unknown as User;

      const result = authService.toAuthUser(mockUser);

      expect(result).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        displayName: 'Test User',
        createdAt: null,
      });
    });

    it('should return null if user is null', () => {
      const result = authService.toAuthUser(null);

      expect(result).toBeNull();
    });
  });
});
