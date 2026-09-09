# Installs Medical Letter for this Windows user. Does not need Trust Center catalogs.
# Run: right-click -> Run with PowerShell, or use Install-MedicalLetter.cmd

$ErrorActionPreference = "Stop"

$manifestUrl = "https://advcode118.github.io/medical-letter-word-add-in/manifest.xml"
$addinId = "6c211424-4faa-40bd-8d14-ced071894f61"
$installDir = Join-Path $env:LOCALAPPDATA "MedicalLetter"
$manifestPath = Join-Path $installDir "manifest.xml"
$regPath = "HKCU:\SOFTWARE\Microsoft\Office\16.0\Wef\Developer"

Write-Host "Downloading install file..."
New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Invoke-WebRequest -Uri $manifestUrl -OutFile $manifestPath -UseBasicParsing

if (-not (Test-Path $regPath)) {
  New-Item -Path $regPath -Force | Out-Null
}

New-ItemProperty -Path $regPath -Name $addinId -Value $manifestPath -PropertyType String -Force | Out-Null
New-ItemProperty -Path $regPath -Name "RefreshAddins" -Value 1 -PropertyType DWord -Force | Out-Null

Write-Host ""
Write-Host "Installed for this Windows account."
Write-Host "1. Close Word completely (all windows)."
Write-Host "2. Open Word."
Write-Host "3. On the Home tab, choose Medical Letter."
Write-Host ""
Write-Host "Manifest saved to: $manifestPath"
