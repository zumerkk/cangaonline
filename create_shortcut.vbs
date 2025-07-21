Set objWS = WScript.CreateObject("WScript.Shell")
strDesktop = objWS.SpecialFolders("Desktop")

Set objLink = objWS.CreateShortcut(strDesktop & "\Canga Vardiya Sistemi.lnk")
objLink.TargetPath = WScript.ScriptFullName & "\..\start_canga.bat"
objLink.WorkingDirectory = WScript.ScriptFullName & "\.."
objLink.IconLocation = "client\public\canga-logo.png,0"
objLink.Description = "Canga Vardiya Sistemi Başlat"
objLink.Save 