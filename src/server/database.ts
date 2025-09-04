import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs-extra';

const DB_PATH = path.join(process.cwd(), 'data', 'trainer.db');

// Ensure data directory exists
fs.ensureDirSync(path.dirname(DB_PATH));

const db = new sqlite3.Database(DB_PATH);

// Promisify database methods with proper parameter handling
const dbRun = (sql: string, params?: any[]) => {
  return new Promise<void>((resolve, reject) => {
    if (params && params.length > 0) {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve();
      });
    } else {
      db.run(sql, function(err) {
        if (err) reject(err);
        else resolve();
      });
    }
  });
};

const dbGet = (sql: string, params?: any[]) => {
  return new Promise<any>((resolve, reject) => {
    if (params && params.length > 0) {
      db.get(sql, params, function(err, row) {
        if (err) reject(err);
        else resolve(row);
      });
    } else {
      db.get(sql, function(err, row) {
        if (err) reject(err);
        else resolve(row);
      });
    }
  });
};

const dbAll = (sql: string, params?: any[]) => {
  return new Promise<any[]>((resolve, reject) => {
    if (params && params.length > 0) {
      db.all(sql, params, function(err, rows) {
        if (err) reject(err);
        else resolve(rows);
      });
    } else {
      db.all(sql, function(err, rows) {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
};

export async function initializeDatabase(): Promise<void> {
  try {
    // Users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        preferences TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Lessons table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS lessons (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        content TEXT NOT NULL,
        prerequisites TEXT NOT NULL,
        exercises TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        estimated_time INTEGER NOT NULL,
        tags TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User progress table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        score INTEGER DEFAULT 0,
        time_spent INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 0,
        last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_exercises TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (lesson_id) REFERENCES lessons (id),
        UNIQUE(user_id, lesson_id)
      )
    `);

    // Exercises table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        lesson_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        starter_code TEXT NOT NULL,
        test_cases TEXT NOT NULL,
        hints TEXT NOT NULL,
        solution TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        points INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lesson_id) REFERENCES lessons (id)
      )
    `);

    // Code submissions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        code TEXT NOT NULL,
        results TEXT NOT NULL,
        passed BOOLEAN NOT NULL,
        score INTEGER NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      )
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export { db, dbRun, dbGet, dbAll };
