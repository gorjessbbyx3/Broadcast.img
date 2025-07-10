[Setup]
AppName=Broadcast Sonification
AppVersion=1.0
DefaultDirName={pf}\BroadcastSonification
DefaultGroupName=Broadcast Sonification
OutputDir=dist
OutputBaseFilename=BroadcastInstaller
Compression=lzma
SolidCompression=yes
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=admin
SetupIconFile=icon.ico

[Files]
Source: "dist\broadcast_gui.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "dist\broadcast_cli.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "README.md"; DestDir: "{app}"; Flags: isreadme
Source: "LICENSE"; DestDir: "{app}"
Source: "Broadcast Help.pdf"; DestDir: "{app}"

[Icons]
Name: "{group}\Broadcast GUI"; Filename: "{app}\broadcast_gui.exe"
Name: "{group}\Broadcast CLI"; Filename: "{app}\broadcast_cli.exe"
Name: "{commondesktop}\Broadcast GUI"; Filename: "{app}\broadcast_gui.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"
