[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectRef,

    [ValidateSet("public")]
    [string]$Schema = "public"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendTypes = Join-Path $repoRoot "frontend\src\types\database.types.ts"

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $frontendTypes) | Out-Null

Write-Host "Generating TypeScript types from Supabase schema '$Schema'..."
$generatedTypes = npx supabase gen types typescript --project-id $ProjectRef --schema $Schema
if ($LASTEXITCODE -ne 0) {
    throw "Supabase type generation failed with exit code $LASTEXITCODE."
}

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($frontendTypes, ($generatedTypes -join [Environment]::NewLine), $utf8NoBom)

Write-Host "Generating Go query code with sqlc..."
Push-Location (Join-Path $repoRoot "backend")
try {
    sqlc generate
}
finally {
    Pop-Location
}
