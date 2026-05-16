# Script to download images from ChatGPT sharing pages and embed as base64
# The ChatGPT sharing links serve HTML pages. We need to fetch the actual image
# by using the DALL-E image URL pattern found in the sharing page response.

Add-Type -AssemblyName System.Net.Http

$client = [System.Net.Http.HttpClient]::new()
$client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

function Get-ImageBase64FromChatGPTShare {
    param([string]$shareUrl)
    try {
        Write-Host "Fetching page: $shareUrl"
        $response = $client.GetStringAsync($shareUrl).Result
        
        # Look for image URLs in the page - DALL-E images are in estuary/public_content
        # Pattern: "url":"https://..." or src="https://..."
        $patterns = @(
            'https://chatgpt\.com/backend-api/estuary/public_content/[^"'']+',
            'https://oaidalleapiprodscus\.blob\.core\.windows\.net/[^"''&\s]+',
            'https://[^"'']+\.png[^"'']*',
            'https://[^"'']+\.jpg[^"'']*',
            'https://[^"'']+\.webp[^"'']*'
        )
        
        foreach ($pattern in $patterns) {
            $matches = [System.Text.RegularExpressions.Regex]::Matches($response, $pattern)
            foreach ($match in $matches) {
                $imgUrl = $match.Value
                # Clean up the URL
                $imgUrl = $imgUrl -replace '\\u0026', '&' -replace '\\/', '/'
                if ($imgUrl -notmatch 'favicon|logo|icon|avatar|profile|thumbnail.*small') {
                    Write-Host "  Trying image URL: $imgUrl"
                    try {
                        $imgBytes = $client.GetByteArrayAsync($imgUrl).Result
                        if ($imgBytes.Length -gt 10000) {
                            $ext = 'jpeg'
                            if ($imgUrl -match '\.png') { $ext = 'png' }
                            if ($imgUrl -match '\.webp') { $ext = 'webp' }
                            $base64 = [Convert]::ToBase64String($imgBytes)
                            Write-Host "  SUCCESS: Downloaded $($imgBytes.Length) bytes"
                            return "data:image/$ext;base64,$base64"
                        }
                    } catch {
                        Write-Host "  Failed to download: $_"
                    }
                }
            }
            if ($matches.Count -gt 0) { break }
        }
        
        Write-Host "  No image found in page"
        return $null
    } catch {
        Write-Host "  Error fetching page: $_"
        return $null
    }
}

# Product image mapping
$products = @(
    @{ Alt='Obsidian Balisong';  ShareUrl='https://chatgpt.com/s/m_6a08e1de72388191ab558d9dac0fb508' },
    @{ Alt='Cerulean Balisong';  ShareUrl='https://chatgpt.com/s/m_6a08e53c13c48191b4545e13210d4166' },
    @{ Alt='Ivory Balisong';     ShareUrl='https://chatgpt.com/s/m_6a08e544f3b8819198ee6e7d550ba650' },
    @{ Alt='Mercury Balisong';   ShareUrl='https://chatgpt.com/s/m_6a08e551ed1c8191b56bea75dbb07d61' },
    @{ Alt='Eclipse Karambit';   ShareUrl='https://chatgpt.com/s/m_6a08e578f83881918bacc621e08dfab0' },
    @{ Alt='Crimson Karambit';   ShareUrl='https://chatgpt.com/s/m_6a08e58400308191a6fd3ad69821fe86' },
    @{ Alt='Jade Karambit';      ShareUrl='https://chatgpt.com/s/m_6a08e5a90b488191921769159104d80b' },
    @{ Alt='Phantom Karambit';   ShareUrl='https://chatgpt.com/s/m_6a08e5b1b7908191ac0c0d63be345048' },
    @{ Alt='Obsidian Katana';    ShareUrl='https://chatgpt.com/s/m_6a08e5f7eaac8191a8c77e9a9332db9e' },
    @{ Alt='Shadow Katana';      ShareUrl='https://chatgpt.com/s/m_6a08e60316788191ac5fa6dffca8bb89' },
    @{ Alt='Ice Katana';         ShareUrl='https://chatgpt.com/s/m_6a08e60b8fe48191b5e07e3b8a9c81d5' },
    @{ Alt='Gold Katana';        ShareUrl='https://chatgpt.com/s/m_6a08e615aba88191bf40e49e86efd5d9' }
)

# Download all images and build a mapping
$imageData = @{}
foreach ($p in $products) {
    Write-Host "`n=== $($p.Alt) ==="
    $base64 = Get-ImageBase64FromChatGPTShare -shareUrl $p.ShareUrl
    if ($base64) {
        $imageData[$p.Alt] = $base64
        Write-Host "  Stored base64 for $($p.Alt) (length: $($base64.Length))"
    } else {
        Write-Host "  FAILED for $($p.Alt)"
    }
}

Write-Host "`n=== Results: $($imageData.Count) of $($products.Count) images downloaded ==="
$imageData | ConvertTo-Json -Depth 1 | Out-File 'd:\Athelgard-main\image_cache.json' -Encoding UTF8
Write-Host "Saved to image_cache.json"
