import { dbRun, dbGet, dbAll } from '../server/database';
import { Lesson, Exercise, TestCase, TestResult, ExerciseSubmission, LessonProgress } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';

export class LessonService {
  /**
   * Create a new lesson
   */
  async createLesson(lessonData: Omit<Lesson, 'id'>): Promise<Lesson> {
    const id = uuidv4();

    await dbRun(`
      INSERT INTO lessons (id, title, description, content, prerequisites, exercises, difficulty, estimated_time, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      lessonData.title,
      lessonData.description,
      JSON.stringify(lessonData.content),
      JSON.stringify(lessonData.prerequisites),
      JSON.stringify(lessonData.exercises.map(e => e.id)),
      lessonData.difficulty,
      lessonData.estimatedTime,
      JSON.stringify(lessonData.tags)
    ]);

    // Create exercises for this lesson
    for (const exercise of lessonData.exercises) {
      await this.createExercise(exercise, id);
    }

    return { id, ...lessonData };
  }

  /**
   * Get all lessons with optional filtering
   */
  async getLessons(difficulty?: string): Promise<Lesson[]> {
    let query = 'SELECT * FROM lessons';
    let params: any[] = [];

    if (difficulty) {
      query += ' WHERE difficulty = ?';
      params.push(difficulty);
    }

    query += ' ORDER BY created_at ASC';

    const lessons = params ? await dbAll(query, params) : await dbAll(query);

    return lessons.map((lesson: any) => {
      if (!lesson) return null;
      return {
        ...lesson,
        content: JSON.parse(lesson.content || '{}'),
        prerequisites: JSON.parse(lesson.prerequisites || '[]'),
        exercises: JSON.parse(lesson.exercises || '[]'),
        tags: JSON.parse(lesson.tags || '[]')
      };
    }).filter(Boolean);
  }

  /**
   * Get lesson by ID with full exercise details
   */
  async getLessonById(id: string): Promise<Lesson | null> {
    const lesson = await dbGet('SELECT * FROM lessons WHERE id = ?', [id]);

    if (!lesson) return null;

    // Get exercises for this lesson
    const exerciseIds = JSON.parse(lesson.exercises || '[]');
    const exercises = await this.getExercisesByIds(exerciseIds);

    return {
      ...lesson,
      content: JSON.parse(lesson.content || '{}'),
      prerequisites: JSON.parse(lesson.prerequisites || '[]'),
      exercises,
      tags: JSON.parse(lesson.tags || '[]')
    };
  }

  /**
   * Create a new exercise
   */
  async createExercise(exerciseData: Omit<Exercise, 'id'>, lessonId: string): Promise<Exercise> {
    const id = uuidv4();

    await dbRun(`
      INSERT INTO exercises (id, lesson_id, title, description, starter_code, test_cases, hints, solution, difficulty, points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      lessonId,
      exerciseData.title,
      exerciseData.description,
      exerciseData.starterCode,
      JSON.stringify(exerciseData.testCases),
      JSON.stringify(exerciseData.hints),
      exerciseData.solution,
      exerciseData.difficulty,
      exerciseData.points
    ]);

    return { id, ...exerciseData };
  }

  /**
   * Get exercises for a lesson
   */
  async getExercisesForLesson(lessonId: string): Promise<Exercise[]> {
    const exercises = await dbAll(
      'SELECT * FROM exercises WHERE lesson_id = ? ORDER BY created_at ASC',
      [lessonId]
    );

    return exercises.map((exercise: any) => {
      if (!exercise) return null;
      return {
        ...exercise,
        testCases: JSON.parse(exercise.test_cases || '[]'),
        hints: JSON.parse(exercise.hints || '[]')
      };
    }).filter(Boolean);
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(id: string): Promise<Exercise | null> {
    const exercise = await dbGet('SELECT * FROM exercises WHERE id = ?', [id]);

    if (!exercise) return null;

    return {
      ...exercise,
      testCases: JSON.parse(exercise.test_cases),
      hints: JSON.parse(exercise.hints)
    };
  }

  /**
   * Get multiple exercises by IDs
   */
  private async getExercisesByIds(ids: string[]): Promise<Exercise[]> {
    if (ids.length === 0) return [];

    const placeholders = ids.map(() => '?').join(',');
    const exercises = await dbAll(
      `SELECT * FROM exercises WHERE id IN (${placeholders})`,
      ids
    );

    return exercises.map((exercise: any) => {
      if (!exercise) return null;
      return {
        ...exercise,
        testCases: JSON.parse(exercise.test_cases || '[]'),
        hints: JSON.parse(exercise.hints || '[]')
      };
    }).filter(Boolean);
  }

  /**
   * Submit exercise solution and run tests
   */
  async submitExercise(
    exerciseId: string,
    userId: string,
    code: string
  ): Promise<ExerciseSubmission> {
    const exercise = await this.getExerciseById(exerciseId);
    if (!exercise) {
      throw new Error('Exercise not found');
    }

    const results: TestResult[] = [];
    let passedCount = 0;

    // Run each test case
    for (const testCase of exercise.testCases) {
      try {
        const result = await this.runTestCase(code, testCase);
        results.push(result);

        if (result.passed) {
          passedCount++;
        }
      } catch (error: any) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          actualOutput: '',
          expectedOutput: testCase.expectedOutput,
          executionTime: 0,
          error: error.message
        });
      }
    }

    const passed = passedCount === exercise.testCases.length;
    const score = passed ? exercise.points : Math.round((passedCount / exercise.testCases.length) * exercise.points);

    const submission: ExerciseSubmission = {
      exerciseId,
      code,
      results,
      passed,
      score,
      timestamp: new Date()
    };

    // Save submission to database
    await this.saveSubmission(userId, submission);

    // Update user progress
    await this.updateUserProgress(userId, exerciseId, passed, score);

    return submission;
  }

  /**
   * Run a single test case against the submitted code
   */
  private async runTestCase(code: string, testCase: TestCase): Promise<TestResult> {
    // Import assembler service dynamically to avoid circular dependencies
    const { assemblerService } = await import('../assembler/assemblerService');

    const startTime = Date.now();
    const result = await assemblerService.compileAndRun(code, testCase.input, {
      timeout: 3000, // 3 seconds for test cases
      allowSystemCalls: false
    });

    const executionTime = Date.now() - startTime;

    // Normalize output for comparison
    const actualOutput = (result.output || '').trim().replace(/\r\n/g, '\n');
    const expectedOutput = testCase.expectedOutput.trim().replace(/\r\n/g, '\n');

    const passed = result.success && actualOutput === expectedOutput;

    return {
      testCaseId: testCase.id,
      passed,
      actualOutput,
      expectedOutput,
      executionTime,
      error: result.error || undefined
    };
  }

  /**
   * Save submission to database
   */
  private async saveSubmission(userId: string, submission: ExerciseSubmission): Promise<void> {
    await dbRun(`
      INSERT INTO submissions (id, user_id, exercise_id, code, results, passed, score, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(),
      userId,
      submission.exerciseId,
      submission.code,
      JSON.stringify(submission.results),
      submission.passed ? 1 : 0,
      submission.score,
      submission.timestamp.toISOString()
    ]);
  }

  /**
   * Update user progress for a lesson/exercise
   */
  private async updateUserProgress(
    userId: string,
    exerciseId: string,
    passed: boolean,
    score: number
  ): Promise<void> {
    // Get the lesson ID for this exercise
    const exercise = await dbGet('SELECT lesson_id FROM exercises WHERE id = ?', [exerciseId]);
    if (!exercise) return;

    const lessonId = exercise.lesson_id;

    // Check if progress record exists
    const existingProgress = await dbGet(
      'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    if (existingProgress) {
      // Update existing progress
      const completedExercises = JSON.parse(existingProgress.completed_exercises || '[]');
      if (passed && !completedExercises.includes(exerciseId)) {
        completedExercises.push(exerciseId);
      }

      await dbRun(`
        UPDATE user_progress
        SET completed = ?, score = ?, attempts = attempts + 1, last_attempt = ?, completed_exercises = ?
        WHERE user_id = ? AND lesson_id = ?
      `, [
        completedExercises.length > 0 ? 1 : 0,
        Math.max(existingProgress.score, score),
        new Date().toISOString(),
        JSON.stringify(completedExercises),
        userId,
        lessonId
      ]);
    } else {
      // Create new progress record
      const completedExercises = passed ? [exerciseId] : [];

      await dbRun(`
        INSERT INTO user_progress (id, user_id, lesson_id, completed, score, time_spent, attempts, last_attempt, completed_exercises)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        userId,
        lessonId,
        passed ? 1 : 0,
        score,
        0, // time_spent - TODO: implement time tracking
        1,  // attempts
        new Date().toISOString(),
        JSON.stringify(completedExercises)
      ]);
    }
  }

  /**
   * Get user progress for all lessons
   */
  async getUserProgress(userId: string): Promise<LessonProgress[]> {
    const progressRecords = await dbAll(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [userId]
    );

    return progressRecords.map((record: any) => ({
      lessonId: record.lesson_id,
      completed: record.completed === 1,
      score: record.score,
      timeSpent: record.time_spent,
      attempts: record.attempts,
      lastAttempt: new Date(record.last_attempt),
      completedExercises: JSON.parse(record.completed_exercises || '[]')
    }));
  }

  /**
   * Get user progress for a specific lesson
   */
  async getUserLessonProgress(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const record = await dbGet(
      'SELECT * FROM user_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    if (!record) return null;

    return {
      lessonId: record.lesson_id,
      completed: record.completed === 1,
      score: record.score,
      timeSpent: record.time_spent,
      attempts: record.attempts,
      lastAttempt: new Date(record.last_attempt),
      completedExercises: JSON.parse(record.completed_exercises || '[]')
    };
  }

  /**
   * Get recommended next lesson based on user progress
   */
  async getRecommendedLesson(userId: string): Promise<Lesson | null> {
    const userProgress = await this.getUserProgress(userId);
    const allLessons = await this.getLessons();

    // Find the first incomplete lesson or the next lesson after the last completed one
    const completedLessonIds = userProgress
      .filter(p => p.completed)
      .map(p => p.lessonId);

    for (const lesson of allLessons) {
      if (!completedLessonIds.includes(lesson.id)) {
        // Check if prerequisites are met
        const prerequisitesMet = lesson.prerequisites.every(prereq =>
          completedLessonIds.includes(prereq)
        );

        if (prerequisitesMet) {
          return lesson;
        }
      }
    }

    return null; // All lessons completed or prerequisites not met
  }
}

export const lessonService = new LessonService();
