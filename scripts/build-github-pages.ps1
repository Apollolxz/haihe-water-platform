param(
    [string]$Source = "haihe-water-platform/frontend",
    [string]$Output = "docs"
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $repoRoot $Source
$outputPath = Join-Path $repoRoot $Output

if (-not (Test-Path $sourcePath)) {
    throw "Frontend source path not found: $sourcePath"
}

if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath | Out-Null
}

$itemsToCopy = @(
    "assets",
    "components",
    "config",
    "pages",
    "services",
    "state",
    "utils"
)

foreach ($item in $itemsToCopy) {
    $sourceItem = Join-Path $sourcePath $item
    if (Test-Path $sourceItem) {
        Copy-Item -Path $sourceItem -Destination $outputPath -Recurse -Force
    }
}

$redirectHtml = @'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>跳转中...</title>
    <script>
        (function () {
            var target = new URL('./pages/index.html', window.location.href);
            target.search = window.location.search;
            target.hash = window.location.hash;
            window.location.replace(target.toString());
        })();
    </script>
</head>
<body>
    <p>正在跳转到 <a href="./pages/index.html">pages/index.html</a> ...</p>
</body>
</html>
'@

Set-Content -Path (Join-Path $outputPath 'index.html') -Value $redirectHtml -Encoding UTF8
Set-Content -Path (Join-Path $outputPath '404.html') -Value $redirectHtml -Encoding UTF8
Set-Content -Path (Join-Path $outputPath '.nojekyll') -Value '' -Encoding ASCII

$htmlInjection = @"
    <script src="../config/site.config.js"></script>
    <script src="../config/runtime-config.js"></script>
"@

$pagesPath = Join-Path $outputPath 'pages'
Get-ChildItem -Path $pagesPath -Filter '*.html' -File | ForEach-Object {
    $content = Get-Content -Path $_.FullName -Raw
    if ($content -match 'runtime-config\.js') {
        return
    }

    $updated = $content -replace '</head>', "$htmlInjection`r`n</head>"
    Set-Content -Path $_.FullName -Value $updated -Encoding UTF8
}

Write-Host "GitHub Pages files are ready in: $outputPath"
