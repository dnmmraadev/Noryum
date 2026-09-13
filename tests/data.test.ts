import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { NoryumStore } from '../src/data/store';
import { migrate, migrations } from '../src/data/migrations';
import { addDays, compareWeeks, dailyTrend, isCivilDate, localDate, sleepMinutes, weekStart, weeklyMetrics } from '../src/domain/analytics';

test('all five workflows survive restart and a consistent SQLite backup', async () => {
 const directory = mkdtempSync(join(tmpdir(), 'noryum-data-')), path = join(directory, 'data.sqlite');
 let store = new NoryumStore(path);
 try {
  const routine = store.invoke('routine.save', { date: '2026-09-12', title: 'Leer', expectedTime: '21:00' });
  store.invoke('routine.toggle', { id: routine, completed: true, completedAt: '2026-09-12T21:14:00-06:00' });
  store.invoke('checkin.save', { date: '2026-09-12', energy: 4, mood: 3, stress: 2, concentration: 4 });
  store.invoke('sleep.save', { date: '2026-09-12', intendedBedtime: '2026-09-11T22:00:00-06:00', bedtime: '2026-09-11T22:40:00-06:00', sleepStart: '2026-09-11T23:00:00-06:00', wakeTime: '2026-09-12T07:00:00-06:00', quality: 4 });
  store.invoke('activity.save', { date: '2026-09-12', type: 'Caminar', durationMinutes: 30, intensity: 2 });
  const programId = store.invoke('program.save', { title: 'Computación' });
  const subjectId = store.invoke('subject.save', { title: 'Fundamentos', programId });
  const moduleId = store.invoke('module.save', { title: 'Algoritmos', subjectId, completed: true });
  store.invoke('study.save', { date: '2026-09-12', programId, subjectId, moduleId, durationMinutes: 45, output: 'Un ejercicio' });
  store.invoke('leisure.save', { date: '2026-09-12', title: 'Piano', category: 'Música', durationMinutes: 30, intentional: true });
  store.invoke('review.save', { weekStart: '2026-09-07', worked: 'Salir', difficult: '', change: 'Más lectura' });
  store.invoke('preferences.save', { name: 'Javier', wakeTarget: '07:00', sleepTargetHours: 8, theme: 'light' });
  const before = store.snapshot('2026-09-12');
  await assert.rejects(store.backup(path), /ubicación diferente/);
  const backupPath = join(directory, 'backup.sqlite'); await store.backup(backupPath);
  store.close(); store = new NoryumStore(path);
  assert.deepEqual(store.snapshot('2026-09-12'), before);
  const copy = new NoryumStore(backupPath); try { assert.deepEqual(copy.snapshot('2026-09-12'), before); } finally { copy.close(); }
  assert.equal(sleepMinutes(before.sleep[0]!), 480);
  assert.equal(before.modules[0]!.completed, true);
  assert.equal(before.routines[0]!.completedAt, '2026-09-12T21:14:00-06:00');
 } finally { store.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('migration failure rolls back schema and version and rerun is idempotent', () => {
 const db = new DatabaseSync(':memory:');
 try {
  migrate(db); migrate(db);
  assert.equal((db.prepare('SELECT count(*) AS n FROM schema_migrations').get() as {n:number}).n, 1);
  assert.throws(() => migrate(db, [...migrations, { version: 2, sql: 'CREATE TABLE partial(id INTEGER); INSERT INTO missing VALUES(1);' }]));
  assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='partial'").get(), undefined);
  assert.equal((db.prepare('SELECT MAX(version) AS n FROM schema_migrations').get() as {n:number}).n, 1);
  migrate(db, [...migrations, { version: 2, sql: 'CREATE TABLE success(id INTEGER)' }]);
  assert.throws(() => migrate(db), /más reciente/);
 } finally { db.close(); }
});

test('recurrence respects weekdays/start date, is idempotent, preserves actual times and deletion', () => {
 const store = new NoryumStore(':memory:');
 try {
  const templateId = store.invoke('template.save', { title: 'Pasear', expectedTime: '07:00', weekdays: [1,3,5], startDate: '2026-09-09' });
  assert.equal(store.snapshot('2026-09-08').routines.length, 0);
  const before = store.snapshot('2026-09-09'), row = before.routines[0]!;
  assert.equal(row.templateId, templateId);
  assert.equal(store.snapshot('2026-09-09').routineHistory.length, before.routineHistory.length);
  store.invoke('routine.toggle', { id: row.id, completed: true, completedAt: '2026-09-09T08:00:00-06:00' });
  store.invoke('routine.save', { id: row.id, date: row.date, title: 'Paseo corto', expectedTime: '08:00' });
  assert.equal(store.snapshot('2026-09-09').routines[0]!.completedAt, '2026-09-09T08:00:00-06:00');
  store.invoke('record.delete', { entity: 'routine', id: row.id });
  assert.equal(store.snapshot('2026-09-09').routines.length, 0);
  assert.equal(store.snapshot('2026-09-10').routines.length, 0);
  assert.equal(store.snapshot('2026-09-11').routines.length, 1);
 } finally { store.close(); }
});

test('trusted boundary rejects malformed records and inconsistent study hierarchy without writes', () => {
 const store = new NoryumStore(':memory:');
 try {
  for (const payload of [null, [], 'bad']) assert.throws(() => store.invoke('routine.save', payload));
  for (const date of ['2026-02-30', '2026-09-12T12:00:00Z', 'foo']) assert.throws(() => store.invoke('routine.save', { date, title: 'A', expectedTime: '12:00' }));
  assert.throws(() => store.invoke('routine.save', { date: '2026-09-12', title: '', expectedTime: '25:00' }));
  assert.throws(() => store.invoke('checkin.save', { date: '2026-09-12', energy: 6, mood: 3, stress: 2, concentration: 4 }));
  assert.throws(() => store.invoke('sleep.save', { date: '2026-09-12', bedtime: '2026-09-12T23:00', wakeTime: '2026-09-13T07:00' }));
  assert.throws(() => store.invoke('sleep.save', { date: '2026-09-12', bedtime: '2026-09-12T23:00:00Z', sleepStart: '2026-09-12T22:00:00Z', wakeTime: '2026-09-13T07:00:00Z' }));
  assert.throws(() => store.invoke('record.delete', { entity: 'preferences', id: '1' }));
  assert.throws(() => store.invoke('anything', {}));
  assert.throws(() => store.invoke('routine.save', { id: 'unknown', date: '2026-09-12', title: 'A', expectedTime: '12:00' }), /No se encontró/);
  const p1 = store.invoke('program.save', { title: 'Uno' }), p2 = store.invoke('program.save', { title: 'Dos' });
  const subjectId = store.invoke('subject.save', { programId: p1, title: 'Asignatura' });
  assert.throws(() => store.invoke('study.save', { date: '2026-09-12', programId: p2, subjectId, durationMinutes: 30 }), /pertenecer/);
  const snap = store.snapshot('2026-09-12');
  assert.equal(snap.routines.length + snap.sleep.length + snap.checkIns.length + snap.studySessions.length, 0);
 } finally { store.close(); }
});

test('civil days, ISO weeks, leap days and DST overnight durations are correct', () => {
 assert.equal(isCivilDate('2024-02-29'), true); assert.equal(isCivilDate('2025-02-29'), false);
 assert.equal(addDays('2024-02-28', 1), '2024-02-29');
 assert.equal(weekStart('2026-01-01'), '2025-12-29');
 assert.equal(addDays('2026-03-08', 1), '2026-03-09');
 const store = new NoryumStore(':memory:');
 try {
  store.invoke('sleep.save', { date: '2026-03-08', bedtime: '2026-03-07T23:00:00-05:00', wakeTime: '2026-03-08T07:00:00-04:00' });
  store.invoke('sleep.save', { date: '2026-11-01', bedtime: '2026-10-31T23:00:00-04:00', wakeTime: '2026-11-01T07:00:00-05:00' });
  const snap = store.snapshot('2026-11-01');
  assert.equal(sleepMinutes(snap.sleep[0]!), 420); assert.equal(sleepMinutes(snap.sleep[1]!), 540);
 } finally { store.close(); }
});

test('weekly calculations exclude missing observations and compare equivalent weekday windows', () => {
 const store = new NoryumStore(':memory:');
 try {
  const empty = store.snapshot('2026-09-09');
  assert.equal(weeklyMetrics(empty, '2026-09-09').sleepAverageMinutes, null);
  assert.equal(weeklyMetrics(empty, '2026-09-09').routineCompletion, null);
  const programId = store.invoke('program.save', { title: 'Aprender' });
  for (const [date, durationMinutes] of [['2026-08-31', 20], ['2026-09-02', 30], ['2026-09-06', 500], ['2026-09-07', 60], ['2026-09-09', 90], ['2026-09-10', 700]] as const) store.invoke('study.save', { date, programId, durationMinutes });
  for (const [date, energy] of [['2026-09-07', 1], ['2026-09-07', 5], ['2026-09-09', 5]] as const) store.invoke('checkin.save', { date, energy, mood: 3, stress: 2, concentration: 4 });
  store.invoke('sleep.save', { date: '2026-09-08', bedtime: '2026-09-07T23:00:00Z', wakeTime: '2026-09-08T07:00:00Z' });
  const snapshot = store.snapshot('2026-09-09'), comparison = compareWeeks(snapshot, '2026-09-09');
  assert.equal(comparison.current.studyMinutes, 150); assert.equal(comparison.previous.studyMinutes, 50);
  assert.equal(comparison.current.energyAverage, 4); assert.equal(comparison.current.energyDays, 2);
  assert.equal(comparison.current.sleepAverageMinutes, 480); assert.equal(comparison.current.sleepDays, 1);
  assert.equal(comparison.current.sleepVariabilityMinutes, null); assert.equal(comparison.partial, true);
  assert.equal(comparison.current.days, 3); assert.equal(comparison.previous.days, 3);
  const trend = dailyTrend(snapshot, '2026-09-09'); assert.equal(trend.length, 7); assert.equal(trend[0]!.sleepMinutes, null);
 } finally { store.close(); }
});

test('sleep duplicates preserve existing data and editing requires its explicit ID', () => {
 const store = new NoryumStore(':memory:');
 try {
  const values = { date: '2026-09-12', bedtime: new Date(2026,8,11,23).toISOString(), wakeTime: new Date(2026,8,12,7).toISOString() };
  const original = store.invoke('sleep.save', values), before = store.snapshot(values.date).sleep;
  const update = { ...values, wakeTime: new Date(2026,8,12,8).toISOString() };
  assert.throws(() => store.invoke('sleep.save', update), /Ya existe/);
  assert.deepEqual(store.snapshot(values.date).sleep, before);
  assert.throws(() => store.invoke('sleep.save', { ...update, id: 'another-id' }), /Ya existe/);
  const edited = store.invoke('sleep.save', { ...update, id: original }); assert.equal(original, edited);
  assert.equal(store.snapshot(values.date).sleep[0]!.wakeTime, update.wakeTime);
  store.invoke('review.save', { weekStart: '2026-09-07', worked: '', difficult: '', change: 'Uno' });
  store.invoke('review.save', { weekStart: '2026-09-07', worked: '', difficult: '', change: 'Dos' });
  const snap = store.snapshot('2026-09-12'); assert.equal(snap.sleep.length, 1); assert.equal(snap.reviews.length, 1); assert.equal(snap.reviews[0]!.change, 'Dos');
 } finally { store.close(); }
});

test('sleep date follows the local wake day, including UTC timestamps near midnight', () => {
 const store = new NoryumStore(':memory:');
 try {
  const bedtime = new Date(2026,8,11,18).toISOString(), wakeTime = new Date(2026,8,12,0,30).toISOString();
  assert.throws(() => store.invoke('sleep.save', { date: '2026-09-11', bedtime, wakeTime }), /fecha local de despertar/);
  assert.equal(store.snapshot('2026-09-12').sleep.length, 0);
  store.invoke('sleep.save', { date: '2026-09-12', bedtime, wakeTime });
  assert.equal(store.snapshot('2026-09-12').sleep[0]!.date, '2026-09-12');
 } finally { store.close(); }
});

test('check-ins sort by actual instant across different offsets', () => {
 const store = new NoryumStore(':memory:');
 try {
  const values = { date: '2026-09-12', energy: 3, mood: 3, stress: 2, concentration: 4 };
  const later = store.invoke('checkin.save', { ...values, recordedAt: '2026-09-12T08:00:00-06:00' });
  const earlier = store.invoke('checkin.save', { ...values, recordedAt: '2026-09-12T12:00:00Z' });
  assert.deepEqual(store.snapshot(values.date).checkIns.map(c => c.id), [earlier, later]);
 } finally { store.close(); }
});

test('template edits reconcile pending current/future plans and pauses preserve history and exclusions', () => {
 const store = new NoryumStore(':memory:');
 try {
  const today = localDate(), yesterday = addDays(today,-1), tomorrow = addDays(today,1), excludedDate = addDays(today,2);
  const values = { title: 'Original', expectedTime: '07:00', weekdays: [0,1,2,3,4,5,6], startDate: yesterday };
  const id = store.invoke('template.save', values);
  const todayRow = store.snapshot(today).routines[0]!;
  store.invoke('routine.toggle', { id: todayRow.id, completed: true });
  const completedAt = store.snapshot(today).routines[0]!.completedAt;
  assert.ok(completedAt);
  const excluded = store.snapshot(excludedDate).routines[0]!;
  store.invoke('record.delete', { entity: 'routine', id: excluded.id });
  const edited = { ...values, id, title: 'Actualizada', expectedTime: '08:30', note: 'Nuevo plan' };
  store.invoke('template.save', edited);
  assert.equal(store.snapshot(yesterday).routines[0]!.title, 'Original');
  assert.equal(store.snapshot(today).routines[0]!.title, 'Original');
  assert.equal(store.snapshot(tomorrow).routines[0]!.title, 'Actualizada');
  assert.equal(store.snapshot(tomorrow).routines[0]!.expectedTime, '08:30');
  assert.equal(store.snapshot(excludedDate).routines.length, 0);
  store.invoke('template.save', { ...edited, active: false });
  assert.equal(store.snapshot(tomorrow).routines.length, 0);
  assert.equal(store.snapshot(today).routines[0]!.completedAt, completedAt);
  assert.equal(store.snapshot(yesterday).routines[0]!.title, 'Original');
  store.invoke('template.save', { ...edited, active: true });
  assert.equal(store.snapshot(excludedDate).routines.length, 0);
  assert.equal(store.snapshot(tomorrow).routines.length, 1);
  const afterTomorrow = addDays(today,3);
  store.invoke('template.save', { ...edited, active: true, startDate: afterTomorrow });
  assert.equal(store.snapshot(tomorrow).routines.length, 0);
  assert.equal(store.snapshot(afterTomorrow).routines.length, 1);
 } finally { store.close(); }
});
