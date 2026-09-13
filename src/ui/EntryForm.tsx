import { useState } from 'react';
import type { Snapshot, ActionPayloads } from '../domain/types';
import { addDays } from '../domain/analytics';
import { Field, Modal } from './primitives';
export type EntryKind='routine'|'template'|'checkin'|'sleep'|'activity'|'program'|'subject'|'module'|'study'|'leisure'|'preferences';
export type EditRecord=Record<string,unknown>;
const titles:Record<EntryKind,string>={routine:'Actividad de tu rutina',template:'Rutina recurrente',checkin:'¿Cómo te sientes ahora?',sleep:'Registrar descanso',activity:'Registrar movimiento',program:'Tu programa de estudio',subject:'Nueva materia',module:'Módulo de aprendizaje',study:'Registrar sesión de estudio',leisure:'Un espacio para disfrutar',preferences:'Tu espacio, a tu manera'};
function asLocal(value:unknown){if(!value)return '';const d=new Date(String(value));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}T${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;}
export function EntryForm({kind,data,date,initial,onClose,onSave}:{kind:EntryKind;data:Snapshot;date:string;initial?:EditRecord;onClose:()=>void;onSave:<K extends keyof ActionPayloads>(action:K,payload:ActionPayloads[K])=>Promise<void>}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 const defaults:EditRecord={date,title:'',expectedTime:'09:00',durationMinutes:30,intensity:3,energy:3,mood:3,stress:3,concentration:3,quality:3,category:'Lectura',intentional:true,programId:data.programs[0]?.id??'',subjectId:'',moduleId:'',weekdays:[1,2,3,4,5],startDate:date,active:true,bedtime:addDays(date,-1)+'T23:00',wakeTime:date+'T07:00',...initial};
 if(kind==='preferences')Object.assign(defaults,data.preferences);
 for(const key of ['bedtime','wakeTime','intendedBedtime','sleepStart','completedAt'])if(initial?.[key])defaults[key]=asLocal(initial[key]);
 const [v,setV]=useState<EditRecord>(defaults);
 const str=(key:string)=>String(v[key]??'');
 const set=(key:string,value:unknown)=>setV(p=>({...p,[key]:value}));
 const input=(key:string,label:string,type='text',required=true,min?:number,max?:number)=><Field label={label}><input name={key} type={type} required={required} min={min} max={max} maxLength={type==='text'?200:undefined} value={str(key)} onChange={e=>set(key,e.target.value)}/></Field>;
 const select=(key:string,label:string,choices:{id:string;title:string}[],optional=false)=><Field label={label}><select aria-label={label} name={key} required={!optional} value={str(key)} onChange={e=>{set(key,e.target.value);if(key==='programId'){set('subjectId','');set('moduleId','');}if(key==='subjectId')set('moduleId','');}}><option value="">{optional?'Sin especificar':'Selecciona una opción'}</option>{choices.map(o=><option key={o.id} value={o.id}>{o.title}</option>)}</select></Field>;
 const scale=(key:string,label:string,low:string,high:string)=><fieldset className="scale"><legend>{label}</legend><div>{[1,2,3,4,5].map(n=><label key={n} className={Number(v[key])===n?'selected':''}><input type="radio" name={key} value={n} checked={Number(v[key])===n} onChange={()=>set(key,n)}/>{n}</label>)}</div><small><span>{low}</span><span>{high}</span></small></fieldset>;
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{
   const id=initial?.id as string|undefined,note=str('note'),day=str('date'),num=(key:string)=>Number(v[key]),iso=(key:string)=>str(key)?new Date(str(key)).toISOString():null;
   if(kind==='routine'){await onSave('routine.save',{id,date:day,title:str('title'),expectedTime:str('expectedTime'),note});if(id&&v.completedAt)await onSave('routine.toggle',{id,completed:true,completedAt:iso('completedAt')!});}
   if(kind==='template')await onSave('template.save',{id,title:str('title'),expectedTime:str('expectedTime'),startDate:str('startDate'),weekdays:v.weekdays as number[],active:Boolean(v.active),note});
   if(kind==='checkin')await onSave('checkin.save',{id,date:day,energy:num('energy'),mood:num('mood'),stress:num('stress'),concentration:num('concentration'),note,...(initial?.recordedAt?{recordedAt:String(initial.recordedAt)}:{})});
   if(kind==='sleep')await onSave('sleep.save',{id,date:day,bedtime:iso('bedtime')!,wakeTime:iso('wakeTime')!,sleepStart:iso('sleepStart'),intendedBedtime:iso('intendedBedtime'),quality:num('quality'),note});
   if(kind==='activity')await onSave('activity.save',{id,date:day,type:str('type'),durationMinutes:num('durationMinutes'),intensity:num('intensity'),note});
   if(kind==='program')await onSave('program.save',{id,title:str('title'),description:str('description')});
   if(kind==='subject')await onSave('subject.save',{id,programId:str('programId'),title:str('title')});
   if(kind==='module')await onSave('module.save',{id,subjectId:str('subjectId'),title:str('title'),completed:Boolean(v.completed)});
   if(kind==='study')await onSave('study.save',{id,date:day,programId:str('programId'),subjectId:str('subjectId')||null,moduleId:str('moduleId')||null,durationMinutes:num('durationMinutes'),output:str('output'),note});
   if(kind==='leisure')await onSave('leisure.save',{id,date:day,category:str('category'),title:str('title'),durationMinutes:num('durationMinutes'),intentional:Boolean(v.intentional),note});
   if(kind==='preferences')await onSave('preferences.save',{name:str('name'),wakeTarget:str('wakeTarget'),sleepTargetHours:num('sleepTargetHours'),theme:str('theme') as 'light'|'dark'});
   onClose();
 }catch(err){setError(String(err).replace(/^Error: /,''));}finally{setBusy(false);}}
 const subjects=data.subjects.filter(s=>s.programId===str('programId'));
 return <Modal title={titles[kind]} onClose={()=>{if(!busy)onClose();}}><form onSubmit={submit}>
 <div className="form-fields">
 {['routine','checkin','sleep','activity','study','leisure'].includes(kind)&&input('date',kind==='sleep'?'Fecha al despertar':'Fecha','date')}
 {['routine','template','program','subject','module','leisure'].includes(kind)&&input('title',kind==='leisure'?'¿Qué disfrutaste?':'Nombre')}
 {['routine','template'].includes(kind)&&input('expectedTime','Hora prevista','time')}
 {kind==='routine'&&Boolean(initial?.completedAt)&&input('completedAt','Realizada el','datetime-local')}
 {kind==='template'&&<>{input('startDate','Desde','date')}<fieldset className="weekdays"><legend>Repetir cada semana</legend>{['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map((label,n)=><label key={n}><input type="checkbox" checked={(v.weekdays as number[]).includes(n)} onChange={e=>set('weekdays',e.target.checked?[...(v.weekdays as number[]),n]:(v.weekdays as number[]).filter(d=>d!==n))}/>{label}</label>)}</fieldset><label className="check-label"><input type="checkbox" checked={Boolean(v.active)} onChange={e=>set('active',e.target.checked)}/>Rutina activa</label></>}
 {kind==='checkin'&&<><p className="muted">No hay una respuesta correcta. Elige lo que más se parece a este momento.</p>{scale('energy','Energía','Muy baja','Muy alta')}{scale('mood','Ánimo','Muy desagradable','Muy agradable')}{scale('stress','Estrés','Muy bajo','Muy alto')}{scale('concentration','Concentración','Muy baja','Muy alta')}</>}
 {kind==='sleep'&&<><div className="form-grid">{input('intendedBedtime','Planeabas acostarte','datetime-local',false)}{input('bedtime','Te acostaste','datetime-local')}{input('sleepStart','Te dormiste (aproximado)','datetime-local',false)}{input('wakeTime','Despertaste','datetime-local')}</div>{scale('quality','Calidad percibida','Muy mala','Muy buena')}<p className="hint">Sin hora de inicio del sueño, la duración usa el tiempo en cama como aproximación.</p></>}
 {kind==='activity'&&<>{input('type','Actividad (caminar, gimnasio…)')}{scale('intensity','Esfuerzo percibido','Muy ligero','Muy intenso')}</>}
 {['study','subject','module'].includes(kind)&&select('programId','Programa',data.programs)}
 {['study','module'].includes(kind)&&select('subjectId','Materia',subjects,kind==='study')}
 {kind==='study'&&select('moduleId','Módulo',data.modules.filter(m=>m.subjectId===str('subjectId')),true)}
 {['activity','study','leisure'].includes(kind)&&input('durationMinutes','Duración (minutos)','number',true,1,1440)}
 {kind==='study'&&input('output','Resultado o ejercicio realizado','text',false)}
 {kind==='program'&&input('description','Intención de aprendizaje','text',false)}
 {kind==='leisure'&&<>{select('category','Categoría',['Lectura','Videojuegos','Música','Social','Creatividad','Descanso','Series y cine','Hobbies','Otro'].map(x=>({id:x,title:x})))}<label className="check-label"><input type="checkbox" checked={Boolean(v.intentional)} onChange={e=>set('intentional',e.target.checked)}/>Fue una elección intencional</label><p className="hint">También puedes registrar ocio espontáneo. Ambas formas tienen lugar aquí.</p></>}
 {kind==='preferences'&&<>{input('name','¿Cómo te llamas?','text',false)}{input('wakeTarget','Hora objetivo al despertar','time')}{input('sleepTargetHours','Objetivo personal de sueño (horas)','number',true,1,16)}{select('theme','Apariencia',[{id:'light',title:'Clara'},{id:'dark',title:'Oscura'}])}<p className="hint">Tus objetivos son preferencias personales, no recomendaciones médicas.</p></>}
 {!['preferences','program','subject','module'].includes(kind)&&<Field label="Nota (opcional)"><textarea name="note" maxLength={2000} rows={2} value={str('note')} onChange={e=>set('note',e.target.value)} placeholder="Algo que quieras recordar…"/></Field>}
 </div>{error&&<p className="error" role="alert">{error}</p>}<div className="form-footer"><button type="button" className="secondary" disabled={busy} onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>{busy?'Guardando…':'Guardar'}</button></div></form></Modal>
}

