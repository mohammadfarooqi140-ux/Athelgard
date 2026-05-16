function Replace-ImgSrcByAlt {
    param([string]$content, [string]$altText, [string]$newUrl)
    $altPattern = 'alt="' + $altText + '"'
    $altIdx = $content.IndexOf($altPattern)
    if ($altIdx -lt 0) {
        Write-Host "Alt text NOT found: $altText"
        return $content
    }
    # Search backward for src="
    $srcPattern = 'src="'
    $searchStart = [Math]::Max(0, $altIdx - 20000000)
    $contentBefore = $content.Substring($searchStart, $altIdx - $searchStart)
    $srcIdx = $contentBefore.LastIndexOf($srcPattern)
    if ($srcIdx -lt 0) {
        Write-Host "src not found before alt: $altText"
        return $content
    }
    $absoluteSrcIdx = $searchStart + $srcIdx
    $srcValueStart = $absoluteSrcIdx + $srcPattern.Length
    $srcValueEnd = $content.IndexOf('"', $srcValueStart)
    if ($srcValueEnd -lt 0) {
        Write-Host "src closing quote not found: $altText"
        return $content
    }
    $oldLen = $srcValueEnd - $srcValueStart
    Write-Host "Found: $altText -> replacing $oldLen chars"
    return $content.Substring(0, $srcValueStart) + $newUrl + $content.Substring($srcValueEnd)
}

# ---- COLLECTION.HTML ----
$file = 'd:\Athelgard-main\Athelgard-main\collection.html'
$content = [System.IO.File]::ReadAllText($file)
Write-Host "Loaded collection.html, size: $($content.Length)"

$replacements = @(
    @{ Alt='Obsidian Balisong';  Url='https://chatgpt.com/s/m_6a08e1de72388191ab558d9dac0fb508' },
    @{ Alt='Cerulean Balisong';  Url='https://chatgpt.com/s/m_6a08e53c13c48191b4545e13210d4166' },
    @{ Alt='Ivory Balisong';     Url='https://chatgpt.com/s/m_6a08e544f3b8819198ee6e7d550ba650' },
    @{ Alt='Mercury Balisong';   Url='https://chatgpt.com/s/m_6a08e551ed1c8191b56bea75dbb07d61' },
    @{ Alt='Eclipse Karambit';   Url='https://chatgpt.com/s/m_6a08e578f83881918bacc621e08dfab0' },
    @{ Alt='Crimson Karambit';   Url='https://chatgpt.com/s/m_6a08e58400308191a6fd3ad69821fe86' },
    @{ Alt='Jade Karambit';      Url='https://chatgpt.com/s/m_6a08e5a90b488191921769159104d80b' },
    @{ Alt='Phantom Karambit';   Url='https://chatgpt.com/s/m_6a08e5b1b7908191ac0c0d63be345048' },
    @{ Alt='Obsidian Katana';    Url='https://chatgpt.com/s/m_6a08e5f7eaac8191a8c77e9a9332db9e' },
    @{ Alt='Shadow Katana';      Url='https://chatgpt.com/s/m_6a08e60316788191ac5fa6dffca8bb89' },
    @{ Alt='Ice Katana';         Url='https://chatgpt.com/s/m_6a08e60b8fe48191b5e07e3b8a9c81d5' },
    @{ Alt='Gold Katana';        Url='https://chatgpt.com/s/m_6a08e615aba88191bf40e49e86efd5d9' }
)

foreach ($r in $replacements) {
    $content = Replace-ImgSrcByAlt -content $content -altText $r.Alt -newUrl $r.Url
}

[System.IO.File]::WriteAllText($file, $content)
Write-Host "collection.html DONE, new size: $($content.Length)"

# ---- INDEX.HTML ----
$file2 = 'd:\Athelgard-main\Athelgard-main\index.html'
$content2 = [System.IO.File]::ReadAllText($file2)
Write-Host "Loaded index.html, size: $($content2.Length)"

$replacements2 = @(
    @{ Alt='Obsidian Balisong'; Url='https://chatgpt.com/s/m_6a08e1de72388191ab558d9dac0fb508' },
    @{ Alt='Eclipse Karambit';  Url='https://chatgpt.com/s/m_6a08e578f83881918bacc621e08dfab0' },
    @{ Alt='Nightfall Katana';  Url='https://chatgpt.com/s/m_6a08e5f7eaac8191a8c77e9a9332db9e' }
)

foreach ($r in $replacements2) {
    $content2 = Replace-ImgSrcByAlt -content $content2 -altText $r.Alt -newUrl $r.Url
}

[System.IO.File]::WriteAllText($file2, $content2)
Write-Host "index.html DONE, new size: $($content2.Length)"
