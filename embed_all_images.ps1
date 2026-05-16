# Download missing katana images and update the HTML files with all base64 data

Add-Type -AssemblyName System.Net.Http

$client = [System.Net.Http.HttpClient]::new()
$client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
$client.Timeout = [System.TimeSpan]::FromSeconds(60)

# Download directly from the estuary URLs
$directUrls = @{
    'Shadow Katana' = 'https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEwOGU2YmQxNzQ4ODE5MWI0NDkzNmIyMWIxNmI5YTY6ZmlsZV8wMDAwMDAwMGMwMzA3MWY0OGZjM2Y4NDExOTU3ZGFhMCIsInRzIjoiMjA1ODkiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImRjMDNiMWIxMDUzNjc1MGQxMzMyNTAxM2I5OTYwMjE3MWM0OTkzOGY5ZjQzZDdmMjE5OTJkNjI1NGM0OWQ4NTgiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0='
    'Ice Katana'    = 'https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEwOGU3MTAyMmNjODE5MWFjMzUwZDAzM2U4NzRkYTM6ZmlsZV8wMDAwMDAwMDU4MWM3MjBhOTk1MjhhMzNhNTRmNDcxNiIsInRzIjoiMjA1ODkiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6ImY5ZTY4OGRiMDFkMjRjZTFlZWI0YTY4ODE5YjFlMmJlMjRmNTMyZTJjYTNlNDhkNzNlZTE5NzgxMjJjYTBhNGMiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0='
    'Gold Katana'   = 'https://chatgpt.com/backend-api/estuary/public_content/enc/eyJpZCI6Im1fNmEwOGU3NmIyZTc0ODE5MWIyYmNhMzE3Mzg1Mjk4MzE6ZmlsZV8wMDAwMDAwMDY1ODg3MWY0YWJhNTNiMGY0YzQ0NDhiNiIsInRzIjoiMjA1ODkiLCJwIjoicHlpIiwiY2lkIjoiMSIsInNpZyI6IjIzMDU4NGYzNGYxNDdjZmY3NGM1NmJlZTczOGM3YjkzNzM3ZTgyNThjMzBhNmMzOTQxMGM2ZTEwOWRjODY2YWEiLCJ2IjoiMCIsImdpem1vX2lkIjpudWxsLCJjcyI6bnVsbCwiY2RuIjpudWxsLCJmbiI6bnVsbCwiY2QiOm51bGwsImNwIjpudWxsLCJtYSI6bnVsbH0='
}

$extraImages = @{}
foreach ($kv in $directUrls.GetEnumerator()) {
    Write-Host "Downloading: $($kv.Key)"
    try {
        $bytes = $client.GetByteArrayAsync($kv.Value).Result
        Write-Host "  Downloaded $($bytes.Length) bytes"
        $b64 = [Convert]::ToBase64String($bytes)
        $extraImages[$kv.Key] = "data:image/jpeg;base64,$b64"
        Write-Host "  Stored (length: $($b64.Length))"
    } catch {
        Write-Host "  FAILED: $_"
    }
}

# Load existing cache
$cache = Get-Content 'd:\Athelgard-main\image_cache.json' | ConvertFrom-Json
$allImages = @{}
$cache.PSObject.Properties | ForEach-Object { $allImages[$_.Name] = $_.Value }
foreach ($kv in $extraImages.GetEnumerator()) {
    $allImages[$kv.Key] = $kv.Value
}

Write-Host "`nTotal images available: $($allImages.Count)"
$allImages.Keys | ForEach-Object { Write-Host "  - $_" }

# Function to replace image src by alt text
function Set-ImgSrc {
    param([string]$content, [string]$altText, [string]$newSrc)
    $altPattern = 'alt="' + $altText + '"'
    $altIdx = $content.IndexOf($altPattern)
    if ($altIdx -lt 0) {
        Write-Host "  NOT FOUND: $altText"
        return $content
    }
    $srcPattern = 'src="'
    $searchStart = [Math]::Max(0, $altIdx - 20000000)
    $before = $content.Substring($searchStart, $altIdx - $searchStart)
    $srcIdx = $before.LastIndexOf($srcPattern)
    if ($srcIdx -lt 0) { Write-Host "  src NOT found for: $altText"; return $content }
    $absSrcStart = $searchStart + $srcIdx + $srcPattern.Length
    $absSrcEnd = $content.IndexOf('"', $absSrcStart)
    if ($absSrcEnd -lt 0) { Write-Host "  closing quote NOT found: $altText"; return $content }
    Write-Host "  Replacing src for: $altText ($($absSrcEnd - $absSrcStart) -> $($newSrc.Length) chars)"
    return $content.Substring(0, $absSrcStart) + $newSrc + $content.Substring($absSrcEnd)
}

# ---- Update COLLECTION.HTML ----
Write-Host "`n=== Updating collection.html ==="
$collFile = 'd:\Athelgard-main\Athelgard-main\collection.html'
$collContent = [System.IO.File]::ReadAllText($collFile)

$collMapping = @(
    @{ Alt='Obsidian Balisong'; Key='Obsidian Balisong' },
    @{ Alt='Cerulean Balisong'; Key='Cerulean Balisong' },
    @{ Alt='Ivory Balisong';    Key='Ivory Balisong' },
    @{ Alt='Mercury Balisong';  Key='Mercury Balisong' },
    @{ Alt='Eclipse Karambit';  Key='Eclipse Karambit' },
    @{ Alt='Crimson Karambit';  Key='Crimson Karambit' },
    @{ Alt='Jade Karambit';     Key='Jade Karambit' },
    @{ Alt='Phantom Karambit';  Key='Phantom Karambit' },
    @{ Alt='Obsidian Katana';   Key='Obsidian Katana' },
    @{ Alt='Shadow Katana';     Key='Shadow Katana' },
    @{ Alt='Ice Katana';        Key='Ice Katana' },
    @{ Alt='Gold Katana';       Key='Gold Katana' }
)

foreach ($m in $collMapping) {
    if ($allImages.ContainsKey($m.Key)) {
        $collContent = Set-ImgSrc -content $collContent -altText $m.Alt -newSrc $allImages[$m.Key]
    } else {
        Write-Host "  NO IMAGE for: $($m.Key)"
    }
}

[System.IO.File]::WriteAllText($collFile, $collContent)
Write-Host "collection.html saved: $($collContent.Length) bytes"

# ---- Update INDEX.HTML ----
Write-Host "`n=== Updating index.html ==="
$indexFile = 'd:\Athelgard-main\Athelgard-main\index.html'
$indexContent = [System.IO.File]::ReadAllText($indexFile)

$indexMapping = @(
    @{ Alt='Obsidian Balisong'; Key='Obsidian Balisong' },
    @{ Alt='Eclipse Karambit';  Key='Eclipse Karambit' },
    @{ Alt='Nightfall Katana';  Key='Obsidian Katana' }
)

foreach ($m in $indexMapping) {
    if ($allImages.ContainsKey($m.Key)) {
        $indexContent = Set-ImgSrc -content $indexContent -altText $m.Alt -newSrc $allImages[$m.Key]
    } else {
        Write-Host "  NO IMAGE for: $($m.Key)"
    }
}

[System.IO.File]::WriteAllText($indexFile, $indexContent)
Write-Host "index.html saved: $($indexContent.Length) bytes"
