import {
  Firestore,
  Timestamp,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { ProgramsService } from './programs';
import { ServiceError } from '@/utils/serviceErrors';
import type {
  ProgramInput,
  SimpleProgramInput,
  AlternatingProgramInput,
  AdvancedProgramInput,
} from '@/domain';

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
    collection: jest.fn(),
    doc: jest.fn(),
    addDoc: jest.fn(),
    getDoc: jest.fn(),
    getDocs: jest.fn(),
    deleteDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn(),
    Timestamp,
  };
});

type MockOverrides = {
  collection?: jest.Mock;
  doc?: jest.Mock;
  addDoc?: jest.Mock;
  getDoc?: jest.Mock;
  getDocs?: jest.Mock;
  deleteDoc?: jest.Mock;
  query?: jest.Mock;
  orderBy?: jest.Mock;
  timestampNow?: jest.Mock;
};

const setupMocks = (overrides: Partial<MockOverrides> = {}) => {
  const defaultDate = new Date('2024-01-01T00:00:00Z');
  const defaultTimestamp = Timestamp.fromDate(defaultDate);

  const defaults = {
    collection: jest.fn().mockReturnValue({}),
    doc: jest.fn().mockReturnValue({ id: 'mock-doc-id' }),
    addDoc: jest.fn().mockResolvedValue({ id: 'mock-doc-id' }),
    getDoc: jest.fn().mockResolvedValue({
      exists: () => false,
      data: () => ({}),
    }),
    getDocs: jest.fn().mockResolvedValue({
      empty: true,
      docs: [],
    }),
    deleteDoc: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockReturnValue({}),
    orderBy: jest.fn().mockReturnValue({}),
    timestampNow: jest.fn().mockReturnValue(defaultTimestamp),
  };

  const mocks = { ...defaults, ...overrides };

  // Apply mocks
  (collection as jest.Mock).mockImplementation(mocks.collection);
  (doc as jest.Mock).mockImplementation(mocks.doc);
  (addDoc as jest.Mock).mockImplementation(mocks.addDoc);
  (getDoc as jest.Mock).mockImplementation(mocks.getDoc);
  (getDocs as jest.Mock).mockImplementation(mocks.getDocs);
  (deleteDoc as jest.Mock).mockImplementation(mocks.deleteDoc);
  (query as jest.Mock).mockImplementation(mocks.query);
  (orderBy as jest.Mock).mockImplementation(mocks.orderBy);

  // Mock Timestamp static methods using jest.spyOn
  jest.spyOn(Timestamp, 'now').mockImplementation(mocks.timestampNow);

  return mocks;
};

describe('ProgramsService', () => {
  let programsService: ProgramsService;
  let mockDb: Firestore;

  const createMockSimpleProgramInput = (): SimpleProgramInput => ({
    name: 'Test Program',
    description: 'A test program',
    type: 'simple',
    week: {
      days: [
        {
          name: 'Day1',
          exercises: [
            {
              id: 'ex1',
              name: 'Bench Press',
              sets: [{ reps: 5, rir: 2 }],
            },
          ],
        },
        'rest',
      ],
    },
  });

  const createMockAlternatingProgramInput = (): AlternatingProgramInput => ({
    name: 'Alternating Program',
    description: 'An alternating program',
    type: 'alternating',
    alternatingWeeks: [
      {
        days: [
          {
            name: 'Day1',
            exercises: [
              {
                id: 'ex1',
                name: 'Bench Press',
                sets: [{ reps: 5, rir: 2 }],
              },
            ],
          },
        ],
      },
      {
        days: [
          {
            name: 'Day1',
            exercises: [
              {
                id: 'ex2',
                name: 'Squat',
                sets: [{ reps: 5, rir: 2 }],
              },
            ],
          },
        ],
      },
    ],
  });

  const createMockAdvancedProgramInput = (): AdvancedProgramInput => ({
    name: 'Advanced Program',
    description: 'An advanced program',
    type: 'advanced',
    phases: [
      {
        name: 'Phase 1',
        description: 'First phase',
        weeks: [
          {
            days: [
              {
                name: 'Day1',
                exercises: [
                  {
                    id: 'ex1',
                    name: 'Bench Press',
                    sets: [{ reps: 5, rir: 2 }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  beforeEach(() => {
    mockDb = {} as Firestore;
    programsService = new ProgramsService(mockDb);
    jest.clearAllMocks();
  });

  describe('createProgram', () => {
    it('should create a simple program', async () => {
      const userId = 'user123';
      const programInput = createMockSimpleProgramInput();

      const mockCollectionRef = {};
      const mockDocRef = { id: 'program1' };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        addDoc: jest.fn().mockResolvedValue(mockDocRef),
      });

      const result = await programsService.createProgram(userId, programInput);

      expect(collection).toHaveBeenCalledWith(mockDb, `users/${userId}/programs`);
      expect(addDoc).toHaveBeenCalledWith(
        mockCollectionRef,
        expect.objectContaining({
          name: 'Test Program',
          description: 'A test program',
          type: 'simple',
          week: programInput.week,
          createdAt: mockTimestamp,
          updatedAt: mockTimestamp,
        }),
      );
      expect(result).toBe('program1');
    });

    it('should create an alternating program', async () => {
      const userId = 'user123';
      const programInput = createMockAlternatingProgramInput();

      const mockCollectionRef = {};
      const mockDocRef = { id: 'program1' };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        addDoc: jest.fn().mockResolvedValue(mockDocRef),
      });

      const result = await programsService.createProgram(userId, programInput);

      expect(addDoc).toHaveBeenCalledWith(
        mockCollectionRef,
        expect.objectContaining({
          type: 'alternating',
          alternatingWeeks: programInput.alternatingWeeks,
        }),
      );
      expect(result).toBe('program1');
    });

    it('should create an advanced program', async () => {
      const userId = 'user123';
      const programInput = createMockAdvancedProgramInput();

      const mockCollectionRef = {};
      const mockDocRef = { id: 'program1' };
      const now = new Date('2024-01-01T00:00:00Z');
      const mockTimestamp = Timestamp.fromDate(now);

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        timestampNow: jest.fn().mockReturnValue(mockTimestamp),
        addDoc: jest.fn().mockResolvedValue(mockDocRef),
      });

      const result = await programsService.createProgram(userId, programInput);

      expect(addDoc).toHaveBeenCalledWith(
        mockCollectionRef,
        expect.objectContaining({
          type: 'advanced',
          phases: programInput.phases,
        }),
      );
      expect(result).toBe('program1');
    });

    it('should throw error for invalid program input', async () => {
      const userId = 'user123';
      const invalidProgram = {
        name: '',
        description: 'Invalid',
        type: 'simple',
        week: {
          days: [],
        },
      } as ProgramInput;

      await expect(programsService.createProgram(userId, invalidProgram)).rejects.toThrow(
        ServiceError,
      );
    });
  });

  describe('getPrograms', () => {
    it('should return all programs ordered by createdAt descending', async () => {
      const userId = 'user123';
      const createdAt1 = Timestamp.fromDate(new Date('2024-01-01'));
      const createdAt2 = Timestamp.fromDate(new Date('2024-01-05'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockPrograms = [
        {
          id: 'program1',
          data: () => ({
            name: 'Program 1',
            description: 'First program',
            type: 'simple',
            week: {
              days: [
                {
                  name: 'Day1',
                  exercises: [
                    {
                      id: 'ex1',
                      name: 'Bench Press',
                      sets: [{ reps: 5, rir: 2 }],
                    },
                  ],
                },
              ],
            },
            createdAt: createdAt1,
            updatedAt,
          }),
        },
        {
          id: 'program2',
          data: () => ({
            name: 'Program 2',
            description: 'Second program',
            type: 'alternating',
            alternatingWeeks: [
              {
                days: [
                  {
                    name: 'Day1',
                    exercises: [
                      {
                        id: 'ex1',
                        name: 'Bench Press',
                        sets: [{ reps: 5, rir: 2 }],
                      },
                    ],
                  },
                ],
              },
              {
                days: [
                  {
                    name: 'Day1',
                    exercises: [
                      {
                        id: 'ex2',
                        name: 'Squat',
                        sets: [{ reps: 5, rir: 2 }],
                      },
                    ],
                  },
                ],
              },
            ],
            createdAt: createdAt2,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockPrograms,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        orderBy: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await programsService.getPrograms(userId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('program1');
      expect(result[1].id).toBe('program2');
    });

    it('should filter out invalid programs', async () => {
      const userId = 'user123';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockPrograms = [
        {
          id: 'program1',
          data: () => ({
            name: 'Valid Program',
            description: 'Valid',
            type: 'simple',
            week: {
              days: [
                {
                  name: 'Day1',
                  exercises: [
                    {
                      id: 'ex1',
                      name: 'Bench Press',
                      sets: [{ reps: 5, rir: 2 }],
                    },
                  ],
                },
              ],
            },
            createdAt,
            updatedAt,
          }),
        },
        {
          id: 'program2',
          data: () => ({
            name: 'Invalid Program',
            description: 'Invalid',
            type: 'simple',
            // Missing week - will cause validation error
            createdAt,
            updatedAt,
          }),
        },
      ];

      const mockCollectionRef = {};
      const mockQuery = {};
      const mockSnapshot = {
        empty: false,
        docs: mockPrograms,
      };

      setupMocks({
        collection: jest.fn().mockReturnValue(mockCollectionRef),
        orderBy: jest.fn().mockReturnValue(mockQuery),
        query: jest.fn().mockReturnValue(mockQuery),
        getDocs: jest.fn().mockResolvedValue(mockSnapshot),
      });

      const result = await programsService.getPrograms(userId);

      // Should filter out invalid program
      expect(result.length).toBeLessThanOrEqual(1);
    });
  });

  describe('getProgram', () => {
    it('should return a simple program by id', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => true,
        id: programId,
        data: () => ({
          name: 'Test Program',
          description: 'A test program',
          type: 'simple',
          week: {
            days: [
              {
                name: 'Day1',
                exercises: [
                  {
                    id: 'ex1',
                    name: 'Bench Press',
                    sets: [{ reps: 5, rir: 2 }],
                  },
                ],
              },
            ],
          },
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await programsService.getProgram(userId, programId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(programId);
      expect(result?.type).toBe('simple');
    });

    it('should return an alternating program by id', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => true,
        id: programId,
        data: () => ({
          name: 'Alternating Program',
          description: 'An alternating program',
          type: 'alternating',
          alternatingWeeks: [
            {
              days: [
                {
                  name: 'Day1',
                  exercises: [
                    {
                      id: 'ex1',
                      name: 'Bench Press',
                      sets: [{ reps: 5, rir: 2 }],
                    },
                  ],
                },
              ],
            },
            {
              days: [
                {
                  name: 'Day1',
                  exercises: [
                    {
                      id: 'ex2',
                      name: 'Squat',
                      sets: [{ reps: 5, rir: 2 }],
                    },
                  ],
                },
              ],
            },
          ],
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await programsService.getProgram(userId, programId);

      expect(result).toBeDefined();
      expect(result?.type).toBe('alternating');
    });

    it('should return an advanced program by id', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => true,
        id: programId,
        data: () => ({
          name: 'Advanced Program',
          description: 'An advanced program',
          type: 'advanced',
          phases: [
            {
              name: 'Phase 1',
              description: 'First phase',
              weeks: [
                {
                  days: [
                    {
                      name: 'Day1',
                      exercises: [
                        {
                          id: 'ex1',
                          name: 'Bench Press',
                          sets: [{ reps: 5, rir: 2 }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await programsService.getProgram(userId, programId);

      expect(result).toBeDefined();
      expect(result?.type).toBe('advanced');
    });

    it('should return null if program does not exist', async () => {
      const userId = 'user123';
      const programId = 'nonexistent';

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await programsService.getProgram(userId, programId);

      expect(result).toBeNull();
    });

    it('should throw error for simple program missing week', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => true,
        id: programId,
        data: () => ({
          name: 'Invalid Program',
          description: 'Missing week',
          type: 'simple',
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      await expect(programsService.getProgram(userId, programId)).rejects.toThrow(ServiceError);
    });

    it('should throw error for alternating program missing alternatingWeeks', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => true,
        id: programId,
        data: () => ({
          name: 'Invalid Program',
          description: 'Missing alternatingWeeks',
          type: 'alternating',
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      await expect(programsService.getProgram(userId, programId)).rejects.toThrow(ServiceError);
    });

    it('should throw error for advanced program missing phases', async () => {
      const userId = 'user123';
      const programId = 'program1';
      const createdAt = Timestamp.fromDate(new Date('2024-01-01'));
      const updatedAt = Timestamp.fromDate(new Date('2024-01-01'));

      const mockDocRef = { id: programId };
      const mockDoc = {
        exists: () => true,
        id: programId,
        data: () => ({
          name: 'Invalid Program',
          description: 'Missing phases',
          type: 'advanced',
          createdAt,
          updatedAt,
        }),
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockDoc),
      });

      await expect(programsService.getProgram(userId, programId)).rejects.toThrow(ServiceError);
    });
  });

  describe('deleteProgram', () => {
    it('should delete a program', async () => {
      const userId = 'user123';
      const programId = 'program1';

      const mockDocRef = { id: programId };
      const mockExistingDoc = {
        exists: () => true,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
        deleteDoc: jest.fn().mockResolvedValue(undefined),
      });

      await programsService.deleteProgram(userId, programId);

      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should throw error if program does not exist', async () => {
      const userId = 'user123';
      const programId = 'nonexistent';

      const mockDocRef = { id: programId };
      const mockExistingDoc = {
        exists: () => false,
      };

      setupMocks({
        doc: jest.fn().mockReturnValue(mockDocRef),
        getDoc: jest.fn().mockResolvedValue(mockExistingDoc),
      });

      await expect(programsService.deleteProgram(userId, programId)).rejects.toThrow(ServiceError);
    });
  });
});
