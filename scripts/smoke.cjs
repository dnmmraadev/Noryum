const { _electron: electron, chromium } = require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
(async()=>{
 const base=path.resolve(__dirname,'..');const testDir=process.env.NORYUM_TEST_DATA||path.join(base,'.test-data',`ui-${Date.now()}`);fs.mkdirSync(testDir,{recursive:true});
 let desktop,browser,page;
 if(process.env.NORYUM_CDP_URL){browser=await chromium.connectOverCDP(process.env.NORYUM_CDP_URL);page=browser.contexts()[0].pages()[0];}
 else{desktop=await electron.launch({executablePath:process.env.NORYUM_TEST_EXE||require('electron'),args:process.env.NORYUM_TEST_EXE?[]:[base],env:{...process.env,NORYUM_DATA_DIR:testDir}});page=await desktop.firstWindow();}
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.getByRole('heading',{name:'Tu día, con intención.'}).waitFor();
 const choose=async(name)=>page.getByRole('navigation').getByRole('button',{name,exact:true}).click();
 const modal=()=>page.getByRole('dialog');
 const save=async()=>{await modal().getByRole('button',{name:'Guardar',exact:true}).click();await modal().waitFor({state:'hidden'});};
 const fill=async(label,value)=>modal().getByLabel(label,{exact:true}).fill(value);
 await page.getByRole('button',{name:'Crear actividad',exact:true}).click();await fill('Nombre','Lectura de prueba');await fill('Hora prevista','08:30');await save();
 await page.getByRole('checkbox',{name:'Completar Lectura de prueba'}).check();assert.equal(await page.getByRole('checkbox',{name:'Completar Lectura de prueba'}).isChecked(),true);
 await page.getByRole('button',{name:'Editar Lectura de prueba',exact:true}).click();await fill('Nombre','Lectura consciente');await save();
 await choose('Bienestar');await page.getByRole('button',{name:'Registrar sueño',exact:true}).click();await save();
 await page.getByRole('button',{name:'Registrar actividad',exact:true}).click();await fill('Actividad (caminar, gimnasio…)','Caminata');await fill('Duración (minutos)','35');await save();
 await page.getByRole('button',{name:'Check-in rápido',exact:true}).click();await modal().getByRole('group',{name:'Energía',exact:true}).getByRole('radio',{name:'4',exact:true}).check();await save();
 await choose('Estudio');await page.getByRole('button',{name:'Crear programa',exact:true}).first().click();await fill('Nombre','Ciencia de la computación');await fill('Intención de aprendizaje','Comprender y construir sistemas');await save();
 await page.getByRole('button',{name:'Añadir materia',exact:true}).click();await fill('Nombre','Inteligencia artificial');await save();
 await page.getByRole('button',{name:'Añadir módulo',exact:true}).first().click();await fill('Nombre','Modelos y evaluación');await modal().getByLabel('Materia',{exact:true}).selectOption({label:'Inteligencia artificial'});await save();
 await page.getByRole('checkbox',{name:'Modelos y evaluación',exact:true}).check();
 await page.getByRole('button',{name:'Registrar sesión',exact:true}).click();await fill('Duración (minutos)','45');await fill('Resultado o ejercicio realizado','Ejercicio de clasificación');await save();
 await choose('Tiempo libre');await page.getByRole('button',{name:'Registrar tiempo libre',exact:true}).click();await fill('¿Qué disfrutaste?','Un capítulo de mi libro');await fill('Duración (minutos)','25');await save();
 await choose('Review semanal');await page.getByLabel('¿Qué funcionó?',{exact:true}).fill('Preparar el día con calma.');await page.getByLabel('¿Qué cambiarás la próxima semana?',{exact:true}).fill('Dejar un espacio para caminar.');await page.getByRole('button',{name:'Guardar reflexión',exact:true}).click();
 await page.getByRole('button',{name:'Ajustes',exact:true}).click();await page.getByRole('button',{name:'Editar preferencias',exact:true}).click();await fill('¿Cómo te llamas?','Javier');await save();
 await page.getByRole('button',{name:'Crear rutina',exact:true}).first().click();await fill('Nombre','Pausa consciente');await save();
 await choose('Hoy');await page.screenshot({path:path.join(base,'docs','screenshot-hoy.png')});
 const selected=await page.getByLabel('Día seleccionado',{exact:true}).inputValue();const before=await page.evaluate(date=>window.noryum.snapshot(date),selected);
 assert.equal(before.studySessions.length,1);assert.equal(before.leisureSessions.length,1);assert.equal(before.sleep.length,1);assert.equal(before.activities.length,1);assert.equal(before.checkIns.length,1);assert.equal(before.reviews.length,1);assert.equal(before.routines.find(r=>r.title==='Lectura consciente').completedAt!==null,true);
 await page.reload();await page.getByRole('heading',{name:/Javier/}).waitFor();const after=await page.evaluate(date=>window.noryum.snapshot(date),selected);assert.deepEqual(after,before);
 await choose('Bienestar');await page.getByRole('button',{name:'Registrar sueño',exact:true}).click();assert.notEqual(await modal().getByLabel('Te acostaste',{exact:true}).inputValue(),'');await modal().getByRole('button',{name:'Cancelar',exact:true}).click();
 await choose('Análisis');await page.getByRole('heading',{name:'Empieza a ver los patrones.'}).waitFor();await page.screenshot({path:path.join(base,'docs','screenshot-analisis.png')});
 await choose('Hoy');await page.getByRole('button',{name:'Eliminar Lectura consciente',exact:true}).click();await modal().getByRole('button',{name:'Conservar',exact:true}).click();assert.equal(await page.getByRole('checkbox',{name:'Completar Lectura consciente'}).count(),1);
 await page.keyboard.press('Control+k');await modal().getByRole('textbox').fill('Bienestar');await modal().getByRole('button',{name:'Bienestar',exact:true}).click();
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(testDir,'smoke-result.json'),JSON.stringify({passed:true,date:selected,checks:19,rendererErrors:errors},null,2));console.log('PASS: 19 comprobaciones de flujo y persistencia de UI; sin errores del renderer. Datos de prueba: '+testDir);
 if(desktop)await desktop.close();if(browser)await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
