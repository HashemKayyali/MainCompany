param(
  [string]$RepoRoot = "C:\Users\PC\Desktop\Eventies-Next-Reconstruction",
  [string]$OutputDirectory = "$env:USERPROFILE\Desktop"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$LegacyRoot = $RepoRoot
$NextRoot = Join-Path $RepoRoot "eventies-next"
$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BundleName = "Eventies_UIUX_Handoff_$Timestamp"
$StageRoot = Join-Path $env:TEMP $BundleName
$ZipPath = Join-Path $OutputDirectory "$BundleName.zip"

function Assert-Exists {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Label
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    throw "$Label was not found: $Path"
  }
}

function Copy-DirectorySafe {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )

  if (-not (Test-Path -LiteralPath $Source)) {
    return
  }

  New-Item -ItemType Directory -Path $Destination -Force | Out-Null

  $excludedDirectories = @(
    ".git",
    ".next",
    ".vercel",
    "node_modules",
    "dist",
    "coverage",
    "playwright-report",
    "test-results",
    ".turbo",
    ".cache",
    "_archive",
    "storage-gc-reports",
    "topology-probe",
    ".secure-schema-capture",
    ".temp"
  )

  $excludedFiles = @(
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    ".env.preview",
    "*.log",
    "*.zip",
    "*.7z",
    "*.rar",
    "*.tgz",
    "*.pem",
    "*.key",
    "*.p12",
    "*.pfx",
    "*.cer",
    "*.crt",
    "*credentials*.json",
    "*credential*.json",
    "*service-role*.json"
  )

  $arguments = @(
    "`"$Source`"",
    "`"$Destination`"",
    "/E",
    "/COPY:DAT",
    "/DCOPY:DAT",
    "/R:1",
    "/W:1",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP",
    "/XD"
  )

  foreach ($directory in $excludedDirectories) {
    $arguments += "`"$directory`""
  }

  $arguments += "/XF"

  foreach ($file in $excludedFiles) {
    $arguments += "`"$file`""
  }

  $process = Start-Process `
    -FilePath "robocopy.exe" `
    -ArgumentList $arguments `
    -Wait `
    -PassThru `
    -NoNewWindow

  if ($process.ExitCode -ge 8) {
    throw "Robocopy failed for $Source with exit code $($process.ExitCode)."
  }
}

function Copy-AllowlistedFiles {
  param(
    [Parameter(Mandatory = $true)][string]$SourceRoot,
    [Parameter(Mandatory = $true)][string]$DestinationRoot,
    [Parameter(Mandatory = $true)][string[]]$Patterns
  )

  New-Item -ItemType Directory -Path $DestinationRoot -Force | Out-Null

  foreach ($pattern in $Patterns) {
    Get-ChildItem `
      -LiteralPath $SourceRoot `
      -File `
      -Filter $pattern `
      -ErrorAction SilentlyContinue |
      ForEach-Object {
        if ($_.Name -in @(".env", ".env.local")) {
          return
        }

        Copy-Item `
          -LiteralPath $_.FullName `
          -Destination (Join-Path $DestinationRoot $_.Name) `
          -Force
      }
  }
}

function Write-TextFile {
  param(
    [Parameter(Mandatory = $true)][string]$Path,
    [Parameter(Mandatory = $true)][string]$Content
  )

  $normalized = $Content -replace "`r`n", "`n" -replace "`r", "`n"
  $normalized = $normalized.TrimEnd() + "`n"

  [System.IO.File]::WriteAllText(
    $Path,
    $normalized,
    [System.Text.UTF8Encoding]::new($false)
  )
}

function Get-RelativeBundleFiles {
  param(
    [Parameter(Mandatory = $true)][string]$Root
  )

  Get-ChildItem -LiteralPath $Root -Recurse -File |
    ForEach-Object {
      $_.FullName.Substring($Root.Length).TrimStart("\")
    } |
    Sort-Object
}

Assert-Exists -Path $RepoRoot -Label "Repository root"
Assert-Exists -Path $NextRoot -Label "Next.js app"
Assert-Exists -Path (Join-Path $LegacyRoot "src") -Label "Legacy Vite src"
Assert-Exists -Path (Join-Path $NextRoot "src") -Label "Next.js src"

if (-not (Test-Path -LiteralPath $OutputDirectory)) {
  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
}

Remove-Item -LiteralPath $StageRoot -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $ZipPath -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Path $StageRoot -Force | Out-Null

$LegacyStage = Join-Path $StageRoot "legacy-vite"
$NextStage = Join-Path $StageRoot "nextjs-target"
$ReportsStage = Join-Path $StageRoot "project-reports"
$MetaStage = Join-Path $StageRoot "bundle-metadata"

New-Item -ItemType Directory -Path $LegacyStage -Force | Out-Null
New-Item -ItemType Directory -Path $NextStage -Force | Out-Null
New-Item -ItemType Directory -Path $ReportsStage -Force | Out-Null
New-Item -ItemType Directory -Path $MetaStage -Force | Out-Null

Write-Host ""
Write-Host "=== Copy legacy Vite source of truth ==="

foreach ($directory in @(
  "src",
  "public",
  "scripts",
  "e2e",
  "docs",
  "DIAGRAMS",
  "supabase"
)) {
  Copy-DirectorySafe `
    -Source (Join-Path $LegacyRoot $directory) `
    -Destination (Join-Path $LegacyStage $directory)
}

Copy-AllowlistedFiles `
  -SourceRoot $LegacyRoot `
  -DestinationRoot $LegacyStage `
  -Patterns @(
    "package.json",
    "package-lock.json",
    "vite.config.*",
    "tailwind.config.*",
    "postcss.config.*",
    "tsconfig*.json",
    "eslint.config.*",
    "playwright.config.*",
    "vitest.config.*",
    "vercel.json",
    "index.html",
    "README*",
    ".editorconfig",
    ".prettierrc*",
    ".gitignore",
    ".env.example"
  )

Write-Host "Legacy source copied."

Write-Host ""
Write-Host "=== Copy Next.js target ==="

foreach ($directory in @(
  "src",
  "public",
  "scripts",
  "e2e",
  "docs",
  "test",
  "supabase"
)) {
  Copy-DirectorySafe `
    -Source (Join-Path $NextRoot $directory) `
    -Destination (Join-Path $NextStage $directory)
}

Copy-AllowlistedFiles `
  -SourceRoot $NextRoot `
  -DestinationRoot $NextStage `
  -Patterns @(
    "package.json",
    "package-lock.json",
    "next.config.*",
    "tailwind.config.*",
    "postcss.config.*",
    "tsconfig*.json",
    "eslint.config.*",
    "playwright.config.*",
    "vitest.config.*",
    "README*",
    "AGENTS.md",
    "CLAUDE.md",
    ".editorconfig",
    ".prettierrc*",
    ".gitignore",
    ".env.example"
  )

Write-Host "Next.js target copied."

Write-Host ""
Write-Host "=== Copy reports and UI/UX evidence ==="

Copy-DirectorySafe `
  -Source (Join-Path $RepoRoot "reports") `
  -Destination $ReportsStage

Write-Host "Reports copied."

Write-Host ""
Write-Host "=== Generate Git and repository metadata ==="

Push-Location $RepoRoot

try {
  $branch = (git branch --show-current).Trim()
  $head = (git rev-parse HEAD).Trim()
  $shortHead = (git rev-parse --short HEAD).Trim()
  $remoteHead = (git rev-parse --short origin/eventies-next-reconstruction 2>$null).Trim()
  $status = (git status --short | Out-String).TrimEnd()
  $log = (git log -30 --oneline --decorate | Out-String).TrimEnd()
  $diffStat = (git diff --stat | Out-String).TrimEnd()
  $trackedFiles = (git ls-files | Out-String).TrimEnd()
}
finally {
  Pop-Location
}

$gitSummary = @"
Eventies UI/UX bundle Git summary
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")
Repository: $RepoRoot
Branch: $branch
HEAD: $head
Short HEAD: $shortHead
Remote eventies-next-reconstruction: $remoteHead

=== git status --short ===
$status

=== git diff --stat ===
$diffStat

=== git log -30 --oneline --decorate ===
$log
"@

Write-TextFile `
  -Path (Join-Path $MetaStage "GIT_SUMMARY.txt") `
  -Content $gitSummary

Write-TextFile `
  -Path (Join-Path $MetaStage "TRACKED_FILES.txt") `
  -Content $trackedFiles

$pathMap = @'
# Repository Map

## Legacy Vite visual source

```text
legacy-vite/src
legacy-vite/public
legacy-vite/scripts
legacy-vite/e2e
legacy-vite/supabase
```

## Next.js target

```text
nextjs-target/src
nextjs-target/public
nextjs-target/scripts
nextjs-target/e2e
nextjs-target/test
nextjs-target/supabase
```

## Reports

```text
project-reports
```

## Important rule

Do not treat generated folders as source. The bundle intentionally excludes:

```text
.git
.next
.vercel
node_modules
dist
coverage
playwright-report
test-results
.env
.env.local
credential files
private keys
archives
```
'@

Write-TextFile `
  -Path (Join-Path $MetaStage "REPOSITORY_MAP.md") `
  -Content $pathMap

$bundleReadme = @"
# Eventies UI/UX Handoff Bundle

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss zzz")

This bundle contains the legacy Vite visual source, the Next.js target, tests,
configs, reports, Supabase code without local secret files, and Git metadata.

Use `Eventies_UIUX_Arabic_First_Handoff.md` as the first document in the new chat.

Production visual reference:

```text
https://eventies.com
```

Before editing, create a fresh isolated Next.js Preview from the latest commit.

Never upload or request passwords, cookies, JWTs, TOTP secrets, service-role
keys, `.env`, `.env.local`, DPAPI credential files, or private font files.
"@

Write-TextFile `
  -Path (Join-Path $StageRoot "BUNDLE_README.md") `
  -Content $bundleReadme

$handoffSource = Join-Path $RepoRoot "Eventies_UIUX_Arabic_First_Handoff.md"

if (Test-Path -LiteralPath $handoffSource) {
  Copy-Item `
    -LiteralPath $handoffSource `
    -Destination (Join-Path $StageRoot "Eventies_UIUX_Arabic_First_Handoff.md") `
    -Force
}
else {
  Write-Host ""
  Write-Warning "Eventies_UIUX_Arabic_First_Handoff.md was not found in the repository root."
  Write-Warning "Place the downloaded handoff file beside this script or upload it separately."
}

Write-Host ""
Write-Host "=== Sensitive filename audit ==="

$sensitiveFiles = @(
  Get-ChildItem -LiteralPath $StageRoot -Recurse -File |
    Where-Object {
      $_.Name -in @(".env", ".env.local") -or
      $_.Name -match "(?i)credential.*\.json$" -or
      $_.Name -match "(?i)service-role.*\.json$" -or
      $_.Extension -match "^\.(pem|key|p12|pfx)$"
    }
)

if ($sensitiveFiles.Count -gt 0) {
  $sensitiveFiles | ForEach-Object {
    Write-Host "Removing sensitive file: $($_.FullName)"
    Remove-Item -LiteralPath $_.FullName -Force
  }
}

$fileList = Get-RelativeBundleFiles -Root $StageRoot

Write-TextFile `
  -Path (Join-Path $MetaStage "BUNDLE_FILE_MANIFEST.txt") `
  -Content ($fileList -join "`n")

Write-Host "Bundle file count: $($fileList.Count)"

Write-Host ""
Write-Host "=== Create ZIP ==="

Compress-Archive `
  -Path (Join-Path $StageRoot "*") `
  -DestinationPath $ZipPath `
  -CompressionLevel Optimal `
  -Force

Assert-Exists -Path $ZipPath -Label "Generated ZIP"

$zipInfo = Get-Item -LiteralPath $ZipPath
$zipSizeMb = [Math]::Round($zipInfo.Length / 1MB, 2)

Remove-Item -LiteralPath $StageRoot -Recurse -Force

Write-Host ""
Write-Host "=== COMPLETE ==="
Write-Host "ZIP_PATH=$ZipPath"
Write-Host "ZIP_SIZE_MB=$zipSizeMb"
Write-Host "BRANCH=$branch"
Write-Host "HEAD=$shortHead"
Write-Host ""
Write-Host "Upload this ZIP together with the Markdown handoff file."
