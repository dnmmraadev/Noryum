import type { DatabaseSync } from 'node:sqlite';
export interface Migration { version: number; sql: string; }
export const migrations: Migration[] = [{ version: 1, sql: `
 CREATE TABLE preferences (id INTEGER PRIMARY KEY CHECK(id=1), name TEXT NOT NULL DEFAULT '', wakeTarget TEXT NOT NULL DEFAULT '06:30', sleepTargetHours REAL NOT NULL DEFAULT 8 CHECK(sleepTargetHours BETWEEN 1 AND 16), theme TEXT NOT NULL DEFAULT 'light' CHECK(theme IN ('light','dark')));
 INSERT INTO preferences(id) VALUES(1);
 CREATE TABLE templates (id TEXT PRIMARY KEY, title TEXT NOT NULL, expectedTime TEXT NOT NULL, weekdays TEXT NOT NULL, startDate TEXT NOT NULL, active INTEGER NOT NULL CHECK(active IN (0,1)), note TEXT NOT NULL);
 CREATE TABLE routines (id TEXT PRIMARY KEY, date TEXT NOT NULL, title TEXT NOT NULL, expectedTime TEXT NOT NULL, completedAt TEXT, note TEXT NOT NULL, templateId TEXT REFERENCES templates(id) ON DELETE SET NULL, UNIQUE(templateId,date));
 CREATE TABLE routine_exclusions(templateId TEXT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,date TEXT NOT NULL,PRIMARY KEY(templateId,date));
 CREATE TABLE checkins (id TEXT PRIMARY KEY,date TEXT NOT NULL,recordedAt TEXT NOT NULL,energy INTEGER NOT NULL CHECK(energy BETWEEN 1 AND 5),mood INTEGER NOT NULL CHECK(mood BETWEEN 1 AND 5),stress INTEGER NOT NULL CHECK(stress BETWEEN 1 AND 5),concentration INTEGER NOT NULL CHECK(concentration BETWEEN 1 AND 5),note TEXT NOT NULL,scaleVersion INTEGER NOT NULL DEFAULT 1);
 CREATE TABLE sleep (id TEXT PRIMARY KEY,date TEXT NOT NULL UNIQUE,intendedBedtime TEXT,bedtime TEXT NOT NULL,sleepStart TEXT,wakeTime TEXT NOT NULL,quality INTEGER CHECK(quality BETWEEN 1 AND 5),note TEXT NOT NULL);
 CREATE TABLE activities (id TEXT PRIMARY KEY,date TEXT NOT NULL,type TEXT NOT NULL,durationMinutes INTEGER NOT NULL CHECK(durationMinutes BETWEEN 1 AND 1440),intensity INTEGER NOT NULL CHECK(intensity BETWEEN 1 AND 5),note TEXT NOT NULL);
 CREATE TABLE programs (id TEXT PRIMARY KEY,title TEXT NOT NULL,description TEXT NOT NULL);
 CREATE TABLE subjects (id TEXT PRIMARY KEY,programId TEXT NOT NULL REFERENCES programs(id) ON DELETE RESTRICT,title TEXT NOT NULL);
 CREATE TABLE modules (id TEXT PRIMARY KEY,subjectId TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,title TEXT NOT NULL,completed INTEGER NOT NULL CHECK(completed IN (0,1)));
 CREATE TABLE study (id TEXT PRIMARY KEY,date TEXT NOT NULL,programId TEXT NOT NULL REFERENCES programs(id),subjectId TEXT REFERENCES subjects(id),moduleId TEXT REFERENCES modules(id),durationMinutes INTEGER NOT NULL CHECK(durationMinutes BETWEEN 1 AND 1440),output TEXT NOT NULL,note TEXT NOT NULL);
 CREATE TABLE leisure (id TEXT PRIMARY KEY,date TEXT NOT NULL,category TEXT NOT NULL,title TEXT NOT NULL,durationMinutes INTEGER NOT NULL CHECK(durationMinutes BETWEEN 1 AND 1440),intentional INTEGER NOT NULL CHECK(intentional IN (0,1)),note TEXT NOT NULL);
 CREATE TABLE reviews (id TEXT PRIMARY KEY,weekStart TEXT NOT NULL UNIQUE,worked TEXT NOT NULL,difficult TEXT NOT NULL,change TEXT NOT NULL);
 CREATE INDEX routines_date ON routines(date);
 CREATE INDEX checkins_date ON checkins(date);
 CREATE INDEX activity_date ON activities(date);
 CREATE INDEX study_date ON study(date);
 CREATE INDEX leisure_date ON leisure(date);
 ` }];
export function migrate(db: DatabaseSync, steps: Migration[] = migrations): void {
 db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, appliedAt TEXT NOT NULL)');
 const current = Number((db.prepare('SELECT COALESCE(MAX(version),0) AS version FROM schema_migrations').get() as {version: number}).version);
 if (current > Math.max(0, ...steps.map(s => s.version))) throw new Error('La base de datos pertenece a una versión más reciente de Noryum.');
 for (const step of steps) { if (step.version <= current) continue; db.exec('BEGIN IMMEDIATE'); try { db.exec(step.sql); db.prepare('INSERT INTO schema_migrations VALUES(?,?)').run(step.version, new Date().toISOString()); db.exec('COMMIT'); } catch (error) { db.exec('ROLLBACK'); throw error; } }
}
