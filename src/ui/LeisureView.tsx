import type { ReactNode } from 'react';
import type { Snapshot, ActionPayloads, SleepRecord, CheckIn } from '../domain/types';
import type { WeeklyMetrics } from '../domain/analytics';
import type { EntryKind } from './EntryForm';
import { Card, Empty, Ring, formatMinutes, shortDate, timeOf } from './primitives';
import { Sun, Moon, Zap, Focus, Plus, BookOpen, Leaf, Smile, Heart, GraduationCap, Pencil, Coffee, Gamepad2, Music } from 'lucide-react';
type OpenEntry=(kind:EntryKind,initial?:object)=>void;
type EditButtons=(kind:EntryKind,row:{id:string},entity?:ActionPayloads['record.delete']['entity'])=>ReactNode;

interface Props{data:Snapshot;week:WeeklyMetrics;open:OpenEntry;editButtons:EditButtons;}
export function LeisureView({data,week,open,editButtons}:Props){return <><div className="leisure-banner"><Leaf size={36}/><div><h2>Disfrutar también es parte del proceso.</h2><p>Elige, descansa, explora. Sin juicios ni tiempo “perdido”.</p></div><strong>{formatMinutes(week.leisureMinutes)}<small>registradas esta semana</small></strong></div><Card title="Tus momentos" action="Registrar" onAction={()=>open('leisure')}>{data.leisureSessions.length?<div className="record-list">{[...data.leisureSessions].reverse().map(s=><div className="record-row" key={s.id}><Leaf size={22}/><div><strong>{s.title}</strong><small>{shortDate(s.date)} · {s.category} · {s.intentional?'Intencional':'Espontáneo'}{s.note&&` · ${s.note}`}</small></div><b>{formatMinutes(s.durationMinutes)}</b>{editButtons('leisure',s,'leisure')}</div>)}</div>:<Empty title="Haz espacio para lo que disfrutas" description="Un libro, música, una conversación. Registra un momento para ti." action="Registrar tiempo libre" onAction={()=>open('leisure')}/>}</Card></>;}
