export type CivilDate = string;
export interface Preferences { name: string; wakeTarget: string; sleepTargetHours: number; theme: 'light' | 'dark'; }
export interface Routine { id: string; date: CivilDate; title: string; expectedTime: string; completedAt: string | null; note: string; templateId: string | null; }
export interface RoutineTemplate { id: string; title: string; expectedTime: string; weekdays: number[]; startDate: CivilDate; active: boolean; note: string; }
export interface CheckIn { id: string; date: CivilDate; recordedAt: string; energy: number; mood: number; stress: number; concentration: number; note: string; scaleVersion: number; }
export interface SleepRecord { id: string; date: CivilDate; intendedBedtime: string | null; bedtime: string; sleepStart: string | null; wakeTime: string; quality: number | null; note: string; }
export interface ActivitySession { id: string; date: CivilDate; type: string; durationMinutes: number; intensity: number; note: string; }
export interface Program { id: string; title: string; description: string; }
export interface Subject { id: string; programId: string; title: string; }
export interface StudyModule { id: string; subjectId: string; title: string; completed: boolean; }
export interface StudySession { id: string; date: CivilDate; programId: string; subjectId: string | null; moduleId: string | null; durationMinutes: number; output: string; note: string; }
export interface LeisureSession { id: string; date: CivilDate; category: string; title: string; durationMinutes: number; intentional: boolean; note: string; }
export interface WeeklyReview { id: string; weekStart: CivilDate; worked: string; difficult: string; change: string; }
export interface Snapshot { date: CivilDate; preferences: Preferences; routines: Routine[]; routineHistory: Routine[]; templates: RoutineTemplate[]; checkIns: CheckIn[]; sleep: SleepRecord[]; activities: ActivitySession[]; programs: Program[]; subjects: Subject[]; modules: StudyModule[]; studySessions: StudySession[]; leisureSessions: LeisureSession[]; reviews: WeeklyReview[]; }
export type RoutineInput = Pick<Routine, 'date' | 'title' | 'expectedTime'> & Partial<Pick<Routine, 'id' | 'note'>>;
export type TemplateInput = Pick<RoutineTemplate, 'title' | 'expectedTime' | 'weekdays' | 'startDate'> & Partial<Pick<RoutineTemplate, 'id' | 'active' | 'note'>>;
export interface ActionPayloads {
 'routine.save': RoutineInput;
 'routine.toggle': { id: string; completed: boolean; completedAt?: string };
 'template.save': TemplateInput;
 'checkin.save': Pick<CheckIn, 'date' | 'energy' | 'mood' | 'stress' | 'concentration'> & Partial<Pick<CheckIn, 'id' | 'note' | 'recordedAt'>>;
 'sleep.save': Pick<SleepRecord, 'date' | 'bedtime' | 'wakeTime'> & Partial<Pick<SleepRecord, 'id' | 'intendedBedtime' | 'sleepStart' | 'quality' | 'note'>>;
 'activity.save': Pick<ActivitySession, 'date' | 'type' | 'durationMinutes' | 'intensity'> & Partial<Pick<ActivitySession, 'id' | 'note'>>;
 'program.save': Pick<Program, 'title'> & Partial<Pick<Program, 'id' | 'description'>>;
 'subject.save': Pick<Subject, 'programId' | 'title'> & Partial<Pick<Subject, 'id'>>;
 'module.save': Pick<StudyModule, 'subjectId' | 'title'> & Partial<Pick<StudyModule, 'id' | 'completed'>>;
 'study.save': Pick<StudySession, 'date' | 'programId' | 'durationMinutes'> & Partial<Pick<StudySession, 'id' | 'subjectId' | 'moduleId' | 'output' | 'note'>>;
 'leisure.save': Pick<LeisureSession, 'date' | 'category' | 'title' | 'durationMinutes' | 'intentional'> & Partial<Pick<LeisureSession, 'id' | 'note'>>;
 'review.save': Pick<WeeklyReview, 'weekStart' | 'worked' | 'difficult' | 'change'>;
 'preferences.save': Preferences;
 'record.delete': { entity: 'routine' | 'template' | 'checkin' | 'sleep' | 'activity' | 'study' | 'leisure' | 'review'; id: string };
}
export interface NoryumAPI { snapshot(date: string): Promise<Snapshot>; invoke<K extends keyof ActionPayloads>(action: K, payload: ActionPayloads[K]): Promise<unknown>; backup(): Promise<string | null>; }
