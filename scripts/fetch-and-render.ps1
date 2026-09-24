# Fetches profile stats into stats.json, then renders the panels.
#
# WHY THIS FILE EXISTS: calling `gh` directly from PowerShell without forcing
# the console to UTF-8 makes the console codepage (CP437/CP1252) transcode every
# non-ASCII character on the way out. An em-dash "—" comes back as the 4-char
# sequence I"AΓÇö and every downstream regex misses it. Setting
# [Console]::OutputEncoding to UTF-8 fixes it AT THE SOURCE, which is far more
# reliable than trying to repair the mangling afterwards.
#
# Usage:  powershell -File scripts\fetch-and-render.ps1
# Requires: gh (authenticated), node.

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)

# ---- the one line that matters ----
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:GH_PAGER = ''

$query = @'
query($login: String!, $from: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from) {
      totalCommitContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalIssueContributions
      totalRepositoryContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount } }
      }
    }
    repositories(first: 100, privacy: PUBLIC, ownerAffiliations: OWNER, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes { name description isFork pushedAt primaryLanguage { name } stargazerCount }
    }
  }
}
'@

$login = 'RaliqID'
$from = (Get-Date).ToUniversalTime().AddDays(-365).ToString('yyyy-MM-ddTHH:mm:ssZ')

Write-Host 'fetching stats from GitHub GraphQL...'
# Write gh's stdout STRAIGHT to a file. Capturing it into a PowerShell variable
# routes it through the console codepage, which is what corrupts "—" into
# "I"AΓÇö". cmd.exe redirection bypasses PowerShell's string handling entirely.
$tmp = Join-Path $env:TEMP 'gh-stats-raw.json'
& cmd.exe /c "gh api graphql -f ""query=$($query -replace "`r?`n", ' ')"" -f login=$login -f from=$from > ""$tmp"" 2>&1"
if ($LASTEXITCODE -ne 0) { throw "gh api failed (exit $LASTEXITCODE): $(Get-Content $tmp -Raw)" }
$raw = [IO.File]::ReadAllText($tmp, [Text.Encoding]::UTF8)
$json = $raw | ConvertFrom-Json

$cc = $json.data.user.contributionsCollection
$days = foreach ($w in $cc.contributionCalendar.weeks) {
  foreach ($d in $w.contributionDays) { @{ date = $d.date; contributionCount = $d.contributionCount } }
}

$repos = @()
foreach ($r in $json.data.user.repositories.nodes) {
  if ($r.name -eq $login) { continue }   # the profile repo itself is not a "world"
  $desc = 'undocumented world'
  if ($r.description) { $desc = $r.description }
  elseif ($r.isFork) { $desc = 'fork — kept in orbit' }
  $lang = 'Other'
  if ($r.primaryLanguage) { $lang = $r.primaryLanguage.name }
  $repos += [ordered]@{
    name     = $r.name
    desc     = $desc
    lang     = $lang
    stars    = $r.stargazerCount
    pushedAt = $r.pushedAt
  }
}

$starsTotal = 0
foreach ($r in $repos) { $starsTotal += $r.stars }

$stats = @{
  total        = $cc.contributionCalendar.totalContributions
  commits      = $cc.totalCommitContributions
  prs          = $cc.totalPullRequestContributions
  reviews      = $cc.totalPullRequestReviewContributions
  issues       = $cc.totalIssueContributions
  repoContribs = $cc.totalRepositoryContributions
  starsEarned  = $starsTotal
  days         = @($days)
  repos        = @($repos)
}

# UTF8Encoding($false) = no BOM. The renderer tolerates a BOM, but not writing
# one removes a whole category of "unexpected token" failures.
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText((Join-Path $PWD 'stats.json'), ($stats | ConvertTo-Json -Depth 8 -Compress), $utf8NoBom)

Write-Host ("stats.json: {0} days, {1} repos, {2} contributions" -f $stats.days.Count, $stats.repos.Count, $stats.total)

node scripts/render-stats.mjs
