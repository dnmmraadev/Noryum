import { readdir, writeFile } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..'),appDir=join(root,'release','Noryum-win32-x64');
async function inventory(dir){const files=[],dirs=[];for(const item of await readdir(dir,{withFileTypes:true})){const p=join(dir,item.name);if(item.isDirectory()){dirs.push(p);const sub=await inventory(p);files.push(...sub.files);dirs.push(...sub.dirs);}else files.push(p);}return{files,dirs};}
const {files,dirs}=await inventory(appDir);
const quote='$'+String.fromCharCode(92)+'"';
// The uninstaller removes an explicit build manifest, never a recursive user-selected directory.
const deletes=files.map(file=>`  Delete "$INSTDIR\\${relative(appDir,file)}"`).join('\n');
const removeDirs=dirs.sort((a,b)=>b.length-a.length).map(dir=>`  RMDir "$INSTDIR\\${relative(appDir,dir)}"`).join('\n');
const script=`Unicode true
!include "MUI2.nsh"
Name "Noryum"
OutFile "..\\release\\Noryum-0.1.2-Setup-x64.exe"
InstallDir "$LOCALAPPDATA\\Programs\\Noryum"
RequestExecutionLevel user
SetCompressor /SOLID lzma
BrandingText "Noryum · See the patterns. Shape the outcome."
!define MUI_ICON "..\\public\\icon.ico"
!define MUI_UNICON "..\\public\\icon.ico"
!define MUI_ABORTWARNING
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!define MUI_FINISHPAGE_RUN "$INSTDIR\\Noryum.exe"
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "Spanish"
VIProductVersion "0.1.2.0"
VIAddVersionKey /LANG=1034 "ProductName" "Noryum"
VIAddVersionKey /LANG=1034 "FileDescription" "Instalador de Noryum"
VIAddVersionKey /LANG=1034 "FileVersion" "0.1.2"
VIAddVersionKey /LANG=1034 "LegalCopyright" "Noryum"
Section "Noryum"
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "..\\release\\Noryum-win32-x64\\*"
  WriteUninstaller "$INSTDIR\\Uninstall.exe"
  CreateShortcut "$DESKTOP\\Noryum.lnk" "$INSTDIR\\Noryum.exe"
  CreateShortcut "$SMPROGRAMS\\Noryum.lnk" "$INSTDIR\\Noryum.exe"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Noryum" "DisplayName" "Noryum"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Noryum" "DisplayVersion" "0.1.2"
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Noryum" "UninstallString" '${quote}$INSTDIR\\Uninstall.exe${quote}'
  WriteRegStr HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Noryum" "InstallLocation" "$INSTDIR"
SectionEnd
Section "Uninstall"
  SetShellVarContext current
${deletes}
${removeDirs}
  Delete "$INSTDIR\\Uninstall.exe"
  RMDir "$INSTDIR"
  Delete "$DESKTOP\\Noryum.lnk"
  Delete "$SMPROGRAMS\\Noryum.lnk"
  DeleteRegKey HKCU "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Noryum"
SectionEnd
`;
await writeFile(join(root,'scripts','installer.nsi'),script);console.log('scripts/installer.nsi generado desde '+files.length+' archivos.');

