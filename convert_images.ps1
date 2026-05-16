$ErrorActionPreference = 'Stop'

$folder = "D:\Athelgard-main\Athelgard-main"
$htmlFiles = Get-ChildItem -Path $folder -Filter *.html

$cache = @{}

foreach ($file in $htmlFiles) {
    Write-Host "Processing $($file.Name)..."
    $content = Get-Content -Path $file.FullName -Raw

    $pattern = 'src="(https?://[^"]+)"'
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $url = $match.Groups[1].Value
        
        # Only process images from unsplash or picsum
        if ($url -match "unsplash\.com" -or $url -match "picsum\.photos") {
            if (-not $cache.ContainsKey($url)) {
                Write-Host "Downloading $url"
                try {
                    $req = Invoke-WebRequest -Uri $url -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0 (Windows NT 10.0; Win64; x64)"} -TimeoutSec 10
                    $b64 = [Convert]::ToBase64String($req.Content)
                    # Determine mime type based on URL (hacky but works for these)
                    $mime = "image/jpeg"
                    if ($url -match "\.png") { $mime = "image/png" }
                    
                    $cache[$url] = "data:$mime;base64,$b64"
                } catch {
                    Write-Host "Failed to download $url : $_"
                    continue
                }
            }
            
            if ($cache.ContainsKey($url)) {
                $content = $content.Replace($match.Value, "src=`"$($cache[$url])`"")
            }
        }
    }
    
    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Saved $($file.Name)"
}
Write-Host "Done"
