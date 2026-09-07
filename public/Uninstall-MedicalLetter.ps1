# Removes the Medical Letter Word add-in registration for this Windows user.

$ErrorActionPreference = "Stop"

$addinId = "6c211424-4faa-40bd-8d14-ced071894f61"
$installDir = Join-Path $env:LOCALAPPDATA "MedicalLetter"
$regPath = "HKCU:\SOFTWARE\Microsoft\Office\16.0\Wef\Developer"

if (Test-Path $regPath) {
  Remove-ItemProperty -Path $regPath -Name $addinId -ErrorAction SilentlyContinue
}

if (Test-Path $installDir) {
  Remove-Item -Recurse -Force $installDir
}

Write-Host "Removed. Close Word completely, then open it again."
