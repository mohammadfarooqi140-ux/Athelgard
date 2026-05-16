$url = "https://html.duckduckgo.com/html/?q=katana+dark+product+photography"
$req = Invoke-WebRequest -Uri $url
$req.Content | Select-String -Pattern 'src="(//external-content\.duckduckgo\.com/iu/\?u=[^"]+)"' -AllMatches | ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } | Select-Object -First 3
