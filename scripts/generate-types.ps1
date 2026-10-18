[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectRef,

    [ValidateSet("public")]
    [string]$Schema = "public"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendTypes = Join-Path $repoRoot "frontend\src\types\database.types.ts"

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $frontendTypes) | Out-Null

Write-Host "Generating TypeScript types from Supabase schema '$Schema'..."
try {
    if ($ProjectRef) {
        $generatedTypes = npx supabase gen types typescript --project-id $ProjectRef --schema $Schema 2>$null
    } else {
        $generatedTypes = npx supabase gen types typescript --local --schema $Schema 2>$null
        if ($LASTEXITCODE -ne 0) {
            $generatedTypes = npx supabase gen types typescript --linked --schema $Schema 2>$null
        }
    }

    if ($LASTEXITCODE -eq 0 -and $generatedTypes) {
        $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
        [System.IO.File]::WriteAllText($frontendTypes, ($generatedTypes -join [Environment]::NewLine), $utf8NoBom)
        Write-Host "Wrote generated types to $frontendTypes"
    } else {
        Write-Warning "Supabase CLI is not connected to a live or linked database instance. Preserving existing database.types.ts."
    }
} catch {
    Write-Warning "Could not connect to Supabase instance for live type generation: $_. Preserving existing types."
}

Write-Host "Generating Go query code with sqlc..."
Push-Location (Join-Path $repoRoot "backend")
try {
    $sqlcCmd = Get-Command "sqlc" -ErrorAction SilentlyContinue
    if ($sqlcCmd) {
        & sqlc generate
    } elseif (Test-Path "$env:USERPROFILE\go\bin\sqlc.exe") {
        & "$env:USERPROFILE\go\bin\sqlc.exe" generate
    } else {
        go run github.com/sqlc-dev/sqlc/cmd/sqlc@v1.27.0 generate
    }
}
finally {
    Pop-Location
}
Write-Host "Type generation and sqlc generation complete."
