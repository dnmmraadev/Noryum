import { DatabaseSync, backup as sqliteBackup } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { migrate } from './migrations';
import { addDays, isCivilDate, localDate, weekStart } from '../domain/analytics';
import type { Snapshot, RoutineTemplate } from '../domain/types';

type Payload = Record<string, unknown>;
type Row = Record<string, string | number | null>;
function object(value: unknown): Payload { if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Datos de registro inválidos.'); return value as Payload; }
function text(value: unknown, label: string, max = 200, optional = false): string { if (value === undefined && optional) return ''; if (typeof value !== 'string' || value.trim().length > max || (!optional && !value.trim())) throw new Error(`${label}: escribe entre ${optional ? 0 : 1} y ${max} caracteres.`); return value.trim(); }
function date(value: unknown): string { if (!isCivilDate(value) || value < '1900-01-01' || value > '2200-12-31') throw new Error('Fecha inválida (1900–2200).'); return value; }
function time(value: unknown): string { if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Hora inválida; usa HH:mm.'); return value; }
function instant(value: unknown, optional = false): string | null { if (optional && (value === null || value === undefined || value === '')) return null; if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:0\d|1[0-4]):[0-5]\d)$/.test(value) || !isCivilDate(value.slice(0,10)) || Number.isNaN(Date.parse(value))) throw new Error('El instante debe incluir fecha, hora y zona horaria.'); return value; }
function number(value: unknown, label: string, min: number, max: number, integer = true): number { if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) throw new Error(`${label}: usa un número ${integer ? 'entero ' : ''}entre ${min} y ${max}.`); return value; }
function boolean(value: unknown, fallback?: boolean): number { if (value === undefined && fallback !== undefined) return Number(fallback); if (typeof value !== 'boolean') throw new Error('Valor booleano inválido.'); return Number(value); }
function optionalId(value: unknown): string | null { return value === undefined || value === null || value === '' ? null : text(value, 'Identificador', 100); }

export class NoryumStore {
 private readonly db: DatabaseSync;
 private readonly path: string;
 constructor(path: string) { this.path = path; if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true }); this.db = new DatabaseSync(path); this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;'); migrate(this.db); }
 close(): void { this.db.close(); }
 async backup(destination: string): Promise<void> { if (this.path !== ':memory:' && resolve(destination).toLowerCase() === resolve(this.path).toLowerCase()) throw new Error('Elige una ubicación diferente para el respaldo.'); await sqliteBackup(this.db, destination); }
 private rows(table: string): Row[] { return this.db.prepare(`SELECT * FROM ${table}`).all() as Row[]; }
 private exists(table: string, id: string): Row { const row = this.db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id) as Row | undefined; if (!row) throw new Error('No se encontró el registro. Actualiza la vista.'); return row; }
 private save(table: string, payload: Payload, fields: Row): string { const provided = optionalId(payload.id), id = provided || randomUUID(); if (provided) this.exists(table, provided); const keys = Object.keys(fields); if (provided) this.db.prepare(`UPDATE ${table} SET ${keys.map(k => `${k}=?`).join(',')} WHERE id=?`).run(...Object.values(fields), id); else this.db.prepare(`INSERT INTO ${table}(id,${keys.join(',')}) VALUES(?,${keys.map(() => '?').join(',')})`).run(id, ...Object.values(fields)); return id; }
 private templates(): RoutineTemplate[] { return this.rows('templates').map(r => ({ ...r, weekdays: JSON.parse(String(r.weekdays)), active: Boolean(r.active) })) as unknown as RoutineTemplate[]; }
 private generateRoutines(selected: string): void {
  // Materialize the selected week and its predecessor. Opening a later day fills missed days,
  // but never creates templates before their explicit start date or regenerates a removed occurrence.
  const start = addDays(weekStart(selected), -7), end = addDays(weekStart(selected), 6);
  const insert = this.db.prepare('INSERT OR IGNORE INTO routines(id,date,title,expectedTime,completedAt,note,templateId) SELECT ?,?,?,?,NULL,?,? WHERE NOT EXISTS(SELECT 1 FROM routine_exclusions WHERE templateId=? AND date=?)');
  this.db.exec('BEGIN IMMEDIATE');
  try { for (const t of this.templates().filter(t => t.active)) { for (let d = start; d <= end; d = addDays(d, 1)) { if (d >= t.startDate && t.weekdays.includes(new Date(d + 'T12:00:00Z').getUTCDay())) insert.run(randomUUID(), d, t.title, t.expectedTime, t.note, t.id, t.id, d); } } this.db.exec('COMMIT'); } catch (error) { this.db.exec('ROLLBACK'); throw error; }
 }
 snapshot(selected: string): Snapshot {
  const day = date(selected); this.generateRoutines(day);
  const { id: _id, ...preferences } = this.rows('preferences')[0]!;
  const routineHistory = this.rows('routines').sort((a,b) => `${a.date} ${a.expectedTime}`.localeCompare(`${b.date} ${b.expectedTime}`));
  return { date: day, preferences, routines: routineHistory.filter(r => r.date === day), routineHistory, templates: this.templates(), checkIns: this.rows('checkins').sort((a,b) => Date.parse(String(a.recordedAt)) - Date.parse(String(b.recordedAt))), sleep: this.rows('sleep').sort((a,b) => String(a.date).localeCompare(String(b.date))), activities: this.rows('activities'), programs: this.rows('programs'), subjects: this.rows('subjects'), modules: this.rows('modules').map(r => ({ ...r, completed: Boolean(r.completed) })), studySessions: this.rows('study'), leisureSessions: this.rows('leisure').map(r => ({ ...r, intentional: Boolean(r.intentional) })), reviews: this.rows('reviews') } as unknown as Snapshot;
 }
 invoke(action: string, value: unknown): unknown {
  const p = object(value), note = () => text(p.note, 'Nota', 2000, true), duration = () => number(p.durationMinutes, 'Duración en minutos', 1, 1440), title = () => text(p.title, 'Título');
  switch (action) {
   case 'routine.save': { const day = date(p.date), id = optionalId(p.id); if (id) { const existing = this.exists('routines', id); if (existing.templateId && existing.date !== day) throw new Error('Una ocurrencia recurrente conserva su fecha; crea otra actividad para cambiar de día.'); } return this.save('routines', p, { date: day, title: title(), expectedTime: time(p.expectedTime), note: note(), ...(p.id ? {} : { completedAt: null, templateId: null }) }); }
   case 'routine.toggle': { const id = text(p.id, 'Identificador', 100); this.exists('routines', id); const done = boolean(p.completed); this.db.prepare('UPDATE routines SET completedAt=? WHERE id=?').run(done ? instant(p.completedAt || new Date().toISOString()) : null, id); return id; }
   case 'template.save': {
    if (!Array.isArray(p.weekdays) || !p.weekdays.length || p.weekdays.length > 7 || new Set(p.weekdays).size !== p.weekdays.length) throw new Error('Selecciona al menos un día sin repetir.');
    const weekdays = p.weekdays.map(d => number(d, 'Día de semana', 0, 6));
    const fields = { title: title(), expectedTime: time(p.expectedTime), weekdays: JSON.stringify(weekdays), startDate: date(p.startDate), active: boolean(p.active, true), note: note() };
    this.db.exec('BEGIN IMMEDIATE');
    try {
     const id = this.save('templates', p, fields);
     // A template edit changes today's pending plan and future pending plans, never history.
     const pending = this.db.prepare('SELECT id,date FROM routines WHERE templateId=? AND date>=? AND completedAt IS NULL').all(id, localDate()) as Row[];
     for (const occurrence of pending) {
      const occurrenceDate = String(occurrence.date), weekday = new Date(occurrenceDate + 'T12:00:00Z').getUTCDay();
      if (!fields.active || occurrenceDate < fields.startDate || !weekdays.includes(weekday)) this.db.prepare('DELETE FROM routines WHERE id=?').run(occurrence.id!);
      else this.db.prepare('UPDATE routines SET title=?,expectedTime=?,note=? WHERE id=?').run(fields.title, fields.expectedTime, fields.note, occurrence.id!);
     }
     this.db.exec('COMMIT'); return id;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
   }
   case 'checkin.save': return this.save('checkins', p, { date: date(p.date), recordedAt: instant(p.recordedAt || new Date().toISOString()), energy: number(p.energy, 'Energía', 1, 5), mood: number(p.mood, 'Ánimo', 1, 5), stress: number(p.stress, 'Estrés', 1, 5), concentration: number(p.concentration, 'Concentración', 1, 5), note: note(), scaleVersion: 1 });
   case 'sleep.save': {
    const day = date(p.date), bedtime = instant(p.bedtime)!, sleepStart = instant(p.sleepStart, true), wakeTime = instant(p.wakeTime)!;
    if (localDate(new Date(wakeTime)) !== day) throw new Error('La fecha del registro debe coincidir con la fecha local de despertar.');
    const durationMinutes = (Date.parse(wakeTime) - Date.parse(sleepStart || bedtime)) / 60000;
    if (Date.parse(wakeTime) <= Date.parse(bedtime) || durationMinutes < 1 || durationMinutes > 1440 || (sleepStart && (Date.parse(sleepStart) < Date.parse(bedtime) || Date.parse(sleepStart) >= Date.parse(wakeTime)))) throw new Error('Revisa el orden de las horas; el sueño debe durar entre 1 minuto y 24 horas.');
    const existing = this.db.prepare('SELECT id FROM sleep WHERE date=?').get(day) as Row | undefined;
    if (existing && optionalId(p.id) !== existing.id) throw new Error('Ya existe un registro de sueño para esa fecha. Edita el registro existente.');
    return this.save('sleep', p, { date: day, intendedBedtime: instant(p.intendedBedtime, true), bedtime, sleepStart, wakeTime, quality: p.quality === undefined || p.quality === null ? null : number(p.quality, 'Calidad', 1, 5), note: note() });
   }
   case 'activity.save': return this.save('activities', p, { date: date(p.date), type: text(p.type, 'Actividad'), durationMinutes: duration(), intensity: number(p.intensity, 'Intensidad', 1, 5), note: note() });
   case 'program.save': return this.save('programs', p, { title: title(), description: text(p.description, 'Descripción', 2000, true) });
   case 'subject.save': { const programId = text(p.programId, 'Programa', 100); this.exists('programs', programId); const id = optionalId(p.id); if (id && this.exists('subjects', id).programId !== programId && this.db.prepare('SELECT id FROM study WHERE subjectId=? LIMIT 1').get(id)) throw new Error('La asignatura tiene sesiones registradas y debe conservar su programa.'); return this.save('subjects', p, { programId, title: title() }); }
   case 'module.save': { const subjectId = text(p.subjectId, 'Asignatura', 100); this.exists('subjects', subjectId); const id = optionalId(p.id); if (id && this.exists('modules', id).subjectId !== subjectId && this.db.prepare('SELECT id FROM study WHERE moduleId=? LIMIT 1').get(id)) throw new Error('El módulo tiene sesiones registradas y debe conservar su asignatura.'); return this.save('modules', p, { subjectId, title: title(), completed: boolean(p.completed, false) }); }
   case 'study.save': { const programId = text(p.programId, 'Programa', 100), subjectId = optionalId(p.subjectId), moduleId = optionalId(p.moduleId); this.exists('programs', programId); if (subjectId && this.exists('subjects', subjectId).programId !== programId) throw new Error('La asignatura debe pertenecer al programa seleccionado.'); if (moduleId && (!subjectId || this.exists('modules', moduleId).subjectId !== subjectId)) throw new Error('El módulo debe pertenecer a la asignatura seleccionada.'); return this.save('study', p, { date: date(p.date), programId, subjectId, moduleId, durationMinutes: duration(), output: text(p.output, 'Resultado', 2000, true), note: note() }); }
   case 'leisure.save': return this.save('leisure', p, { date: date(p.date), category: text(p.category, 'Categoría', 100), title: title(), durationMinutes: duration(), intentional: boolean(p.intentional), note: note() });
   case 'review.save': { const start = date(p.weekStart); if (weekStart(start) !== start) throw new Error('La semana debe empezar en lunes.'); const existing = this.db.prepare('SELECT id FROM reviews WHERE weekStart=?').get(start) as Row | undefined; return this.save('reviews', { id: existing?.id }, { weekStart: start, worked: text(p.worked, 'Qué funcionó', 4000, true), difficult: text(p.difficult, 'Qué fue difícil', 4000, true), change: text(p.change, 'Próximo ajuste', 4000, true) }); }
   case 'preferences.save': { const name = text(p.name, 'Nombre', 80, true), target = time(p.wakeTarget), hours = number(p.sleepTargetHours, 'Objetivo de sueño', 1, 16, false); if (p.theme !== 'light' && p.theme !== 'dark') throw new Error('Tema inválido.'); this.db.prepare('UPDATE preferences SET name=?,wakeTarget=?,sleepTargetHours=?,theme=? WHERE id=1').run(name, target, hours, p.theme); return true; }
   case 'record.delete': {
    const tables: Record<string, string> = { routine: 'routines', template: 'templates', checkin: 'checkins', sleep: 'sleep', activity: 'activities', study: 'study', leisure: 'leisure', review: 'reviews' };
    const entity = text(p.entity, 'Tipo de registro', 20); if (!Object.hasOwn(tables, entity)) throw new Error('No se permite eliminar este tipo de registro.'); const table = tables[entity]!, id = text(p.id, 'Identificador', 100), existing = this.exists(table, id);
    this.db.exec('BEGIN IMMEDIATE'); try { if (entity === 'routine' && existing.templateId) this.db.prepare('INSERT OR IGNORE INTO routine_exclusions VALUES(?,?)').run(existing.templateId, existing.date!); this.db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id); this.db.exec('COMMIT'); } catch(error) { this.db.exec('ROLLBACK'); throw error; } return true;
   }
   default: throw new Error('Acción no permitida.');
  }
 }
}
