$obsolete = Join-Path $PSScriptRoot 'src/pages/CustomBuildsPage - Copy.tsx'
if (Test-Path -LiteralPath $obsolete) {
    Remove-Item -LiteralPath $obsolete -Force
    Write-Host "Removed obsolete file: $obsolete"
} else {
    Write-Host "Obsolete file already absent: $obsolete"
}
