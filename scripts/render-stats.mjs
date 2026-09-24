// Renders dist/adventure.svg + dist/constellation.svg from stats.json.
// stats.json is written by .github/workflows/profile-update.yml (GitHub GraphQL, own token — never "failed to retrieve").
// Local dev: drop a stats.json next to the repo root and run `node scripts/render-stats.mjs`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const NAVY = '#0e1424', NAVY2 = '#131b2e', GOLD = '#e8c877', GOLD_DIM = '#8a7443', TEAL = '#7fd8cf', PARCH = '#efe6d0', DIM = '#6d7a99', FIRE = '#ff9a3c';
const elColors = ['#23d3c3', '#ff9a3c', '#4cc2f2', '#b58ee8', '#f7c644', '#9ee7ff', '#98e6af'];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// GitHub's API returns proper UTF-8, but PowerShell's pipeline decodes it as
// Latin-1 (and sometimes twice), handing us multi-char garbage where a single
// em-dash belongs. Repair the byte sequences, not just one spelling of them.
const fixEnc = s => String(s)
  // em-dash — mangled as latin1 / cp1252 / double-decoded
  .replace(/\u00E2\u20AC\u201D|\u00E2\u0080\u0094|\u0393\u00C7\u00F6/g, '\u2014')
  // right single quote ’
  .replace(/\u00E2\u20AC\u2122|\u00E2\u0080\u0099|\u0393\u00C7\u00F4/g, '\u2019')
  // left/right double quotes “ ”
  .replace(/\u00E2\u20AC\u0153|\u00E2\u0080\u009C/g, '\u201C')
  .replace(/\u00E2\u20AC\u009D|\u00E2\u0080\u009D/g, '\u201D')
  // en-dash –
  .replace(/\u00E2\u20AC\u201C|\u00E2\u0080\u0093/g, '\u2013')
  // replacement char + stray cp1252 artifacts from a lossy round-trip
  .replace(/[\uFFFD\u0081\u008D\u008F\u0090\u009D]/g, '');
const clean = s => fixEnc(esc(s));

const stats = JSON.parse(readFileSync('stats.json', 'utf8').replace(/^[\uFEFF\u200B\s]+/, ''));
mkdirSync('dist', { recursive: true });
const now = new Date();
const updated = now.toISOString().slice(0, 10);
const stamp = now.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

// ---------- streaks ----------
const days = stats.days.map(d => d.count ?? d.contributionCount ?? 0);
let i = days.length - 1, current = 0;
if (days[i] === 0) i--;                       // today may still be empty
while (i >= 0 && days[i] > 0) { current++; i--; }
let longest = 0, run = 0;
for (const c of days) { if (c > 0) { run++; if (run > longest) longest = run; } else run = 0; }

// ---------- adventure.svg ----------
const heat = ['#0f1526', '#173a38', '#1f6a5e', '#2ba18b', '#7fd8cf'];
const lvl = c => (c === 0 ? 0 : c <= 2 ? 1 : c <= 4 ? 2 : c <= 6 ? 3 : 4);
const cells = [];
for (let x = 0; x * 7 < days.length; x++)
  for (let y = 0; y < 7; y++) {
    const c = days[x * 7 + y]; if (c === undefined) continue;
    cells.push(`<rect x="${510 + x * 9}" y="${56 + y * 9}" width="7" height="7" rx="1.5" fill="${heat[lvl(c)]}"/>`);
  }

const langCount = {};
for (const r of stats.repos) langCount[r.lang] = (langCount[r.lang] || 0) + 1;
const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
const langsSvg = topLangs.map((t, n) => {
  const y = 128 + n * 15;
  const w = Math.max(Math.round(t[1] / stats.repos.length * 170), 8);
  return `<text x="40" y="${y}" font-family="ui-monospace,Consolas,monospace" font-size="9.5" fill="${DIM}">${clean(t[0])}</text>
<rect x="132" y="${y - 8}" width="${w}" height="8" rx="2" fill="${elColors[n % elColors.length]}" opacity=".85"/>
<text x="${138 + w}" y="${y}" font-family="ui-monospace,Consolas,monospace" font-size="9.5" fill="${GOLD_DIM}">${t[1]}</text>`;
}).join('\n');

writeFileSync('dist/adventure.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="220" viewBox="0 0 1012 220"><title>Adventure progress</title><desc>Stardust total, streaks, commits, pull requests, reviews, issues, stars, top languages and a 52-week Teyvat contribution heatmap. Regenerated daily from the GitHub API.</desc>
<style><![CDATA[.g{font-family:Georgia,'Times New Roman',serif}.m{font-family:ui-monospace,Consolas,monospace}
@keyframes twinkle{0%,100%{opacity:.15}50%{opacity:1}}.tw{animation:twinkle 3.4s ease-in-out infinite}]]></style>
<defs><linearGradient id="ab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY2}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<rect x="1" y="1" width="1010" height="218" rx="4" fill="url(#ab)" stroke="${GOLD}" stroke-opacity=".45"/>
<rect x="7" y="7" width="998" height="206" rx="2" fill="none" stroke="${GOLD}" stroke-opacity=".18"/>
<text class="m" x="40" y="36" font-size="10.5" fill="${GOLD_DIM}" letter-spacing="2">STARDUST — LAST 365 DAYS</text>
<text class="g" x="40" y="86" font-size="44" fill="${GOLD}">${stats.total}</text>
<text class="m" x="40" y="108" font-size="11" fill="${DIM}">contributions across Teyvat</text>
<text class="g" x="322" y="86" font-size="26" fill="${FIRE}">${current}d<tspan font-size="13" fill="${GOLD}"> · best ${longest}d</tspan></text>
<text class="m" x="322" y="108" font-size="11" fill="${DIM}">current streak · longest</text>
<text class="m" x="510" y="36" font-size="10.5" fill="${GOLD_DIM}" letter-spacing="2">52-WEEK SKY</text>
${cells.join('\n')}
<text class="m" x="510" y="132" font-size="9.5" fill="${DIM}">less</text>
${heat.map((c, n) => `<rect x="${548 + n * 16}" y="124" width="9" height="9" rx="2" fill="${c}"/>`).join('')}
<text class="m" x="638" y="132" font-size="9.5" fill="${DIM}">more</text>
<text class="m" x="510" y="158" font-size="10.5" fill="${PARCH}" opacity=".85">✎ ${stats.commits} commits · ⇄ ${stats.prs} pull requests · ✓ ${stats.reviews} reviews</text>
<text class="m" x="510" y="176" font-size="10.5" fill="${PARCH}" opacity=".85">◈ ${stats.issues} issues · ★ ${stats.starsEarned} stars earned · ⌂ ${stats.repoContribs} repos</text>
<line x1="40" y1="118" x2="470" y2="118" stroke="${GOLD}" stroke-opacity=".22"/>
${langsSvg}
<text class="m tw" x="972" y="204" text-anchor="end" font-size="9" fill="${TEAL}" opacity=".7">auto-charted ${updated} — no third-party API at view time</text>
</svg>`);

// ---------- constellation.svg ----------
// Show the newest HEAD repos as plaques and fold the rest into a markdown list
// rendered in the README's <details>. GitHub's own "load more" pattern: the
// visible grid never gets crushed, and 60 repos cost the same as 12.
const all = stats.repos;
const HEAD = 12;
const head = all.slice(0, HEAD);
const tail = all.slice(HEAD);
const per = 3;
const cw = Math.floor((1012 - 64 - (per - 1) * 14) / per);
const ch = 64, gx = 14, gy = 12, x0 = 32, y0 = 50;

const chip = (r, idx) => {
  const x = x0 + (idx % per) * (cw + gx);
  const y = y0 + Math.floor(idx / per) * (ch + gy);
  const dot = elColors[idx % elColors.length];
  // Measure the meta label instead of guessing, so a long repo name can never
  // run into it. Georgia bold 13.5px ≈ 8.6px/char; 9.5px mono ≈ 5.8px/char.
  const meta = `${r.lang} · ★${r.stars}`;
  const metaPx = (meta.length + 1) * 5.8 + 16;
  const nameMax = Math.max(Math.floor((cw - 28 - metaPx) / 8.6), 5);
  const name = r.name.length > nameMax ? r.name.slice(0, nameMax - 1) + '…' : r.name;
  const descMax = Math.max(Math.floor((cw - 34) / 5.7), 8);
  const desc = r.desc.length > descMax ? r.desc.slice(0, descMax - 1) + '…' : r.desc;
  return `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="6" fill="#0a1226" stroke="${GOLD}" stroke-opacity=".26"/>
<circle cx="${x + 16}" cy="${y + 20}" r="4" fill="${dot}"/>
<text class="g" x="${x + 28}" y="${y + 25}" font-size="13.5" font-weight="bold" fill="${GOLD}">${clean(name)}</text>
<text class="m" x="${x + cw - 12}" y="${y + 25}" text-anchor="end" font-size="9.5" fill="${DIM}">${clean(meta)}</text>
<text class="m" x="${x + 16}" y="${y + 45}" font-size="9.5" fill="${PARCH}" opacity=".8">${clean(desc)}</text>`;
};

const headRows = Math.max(1, Math.ceil(head.length / per));
const H = y0 + headRows * (ch + gy) + (tail.length ? 34 : 22);
writeFileSync('dist/constellation.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="${H}" viewBox="0 0 1012 ${H}"><title>Repository constellation</title><desc>Public repositories as charted plaques: name, language, stars and description. The ${HEAD} most recently pushed are shown; the remainder stay folded until opened.</desc>
<style><![CDATA[.g{font-family:Georgia,'Times New Roman',serif}.m{font-family:ui-monospace,Consolas,monospace}
@keyframes twinkle{0%,100%{opacity:.15}50%{opacity:1}}.tw{animation:twinkle 3.4s ease-in-out infinite}]]></style>
<rect x="1" y="1" width="1010" height="${H - 2}" rx="4" fill="url(#ab2)" stroke="${GOLD}" stroke-opacity=".45"/>
<defs><linearGradient id="ab2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY2}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<text class="m" x="32" y="32" font-size="10.5" fill="${GOLD_DIM}" letter-spacing="2">REPOSITORY CONSTELLATION — ${all.length} WORLDS · ${head.length} MOST RECENT</text>
${head.map(chip).join('\n')}
<text class="m" x="32" y="${H - 14}" font-size="10.5" fill="${GOLD}" opacity=".85">${tail.length ? `▾ ${tail.length} more worlds charted — open the folded list below` : '▾ every world charted'}</text>
<text class="m tw" x="980" y="${H - 14}" text-anchor="end" font-size="9" fill="${TEAL}" opacity=".7">↻ refreshed ${stamp}</text>
</svg>`);

// ---------- constellation-more.md ----------
// Folded tail as markdown: wraps naturally, reads like GitHub, zero maintenance.
if (tail.length) {
  const lines = tail.map((r, n) =>
    `${n + 1}. **${r.name}**${r.stars ? ` · ★${r.stars}` : ''} — \`${r.lang}\`<br><sub>${r.desc}</sub>`);
  // Run the whole document through the encoder repair, not just descriptions:
  // PowerShell mangles every literal that passes through its pipeline.
  writeFileSync('dist/constellation-more.md', fixEnc(lines.join('\n\n')) + '\n');
}

// ---------- trophy-case.svg ----------
// Self-rendered trophies instead of github-profile-trophy.vercel.app, which
// returns HTTP 402 when its shared quota runs out and leaves an empty box on
// the profile. Tiers are derived from real stats, so a trophy appears only when
// the data actually earns it — no fake hardware.
{
  const defs = [
    { key: 'commits', label: 'COMMITS', value: stats.commits, unit: '', tiers: [50, 150, 500, 2000], color: '#ff9a3c' },
    { key: 'stardust', label: 'STARDUST', value: stats.total, unit: '', tiers: [200, 500, 1000, 2500], color: '#e8c877' },
    { key: 'repos', label: 'WORLDS', value: stats.repos.length, tiers: [5, 15, 30, 60], color: '#4cc2f2' },
    { key: 'streak', label: 'STREAK', value: longest, unit: 'd', tiers: [7, 30, 100, 365], color: '#ff6b4a' },
    { key: 'active', label: 'ACTIVE DAYS', value: days.filter(c => c > 0).length, tiers: [30, 100, 200, 300], color: '#23d3c3' },
    { key: 'reviews', label: 'REVIEWS', value: stats.reviews, tiers: [1, 10, 50, 200], color: '#b58ee8' },
    { key: 'prs', label: 'PULL REQUESTS', value: stats.prs, tiers: [1, 10, 50, 200], color: '#9ee7ff' },
    { key: 'issues', label: 'ISSUES', value: stats.issues, tiers: [1, 10, 50, 200], color: '#98e6af' },
  ];
  const roman = ['', 'I', 'II', 'III', 'IV'];
  const tierOf = (v, tiers) => { let t = 0; for (let k = 0; k < tiers.length; k++) if (v >= tiers[k]) t = k + 1; return t; };

  const cols = 4, tw = 238, th = 96, tgx = 14, tgy = 14, tx0 = 26, ty0 = 54;
  const rowsN = Math.ceil(defs.length / cols);
  const TH_ = ty0 + rowsN * (th + tgy) + 26;

  const trophy = (d, idx) => {
    const t = tierOf(d.value, d.tiers);
    const x = tx0 + (idx % cols) * (tw + tgx);
    const y = ty0 + Math.floor(idx / cols) * (th + tgy);
    const lit = t > 0;
    // Next threshold gives the viewer something to chase.
    const next = d.tiers.find(v => d.value < v);
    const progress = lit ? (next ? `next at ${next}` : 'maxed') : `needs ${d.tiers[0]}`;
    const dim = lit ? 1 : 0.32;
    const glow = lit ? `<circle class="tglow" cx="${x + 44}" cy="${y + 46}" r="34" fill="${d.color}" opacity=".1"/>` : '';
    // simple trophy glyph, scales with tier
    const cup = `<path d="M32 26h24v7a12 12 0 0 1-24 0z" fill="${d.color}" opacity="${dim * 0.85}"/>
<path d="M30 28h-6a8 8 0 0 0 8 8M58 28h6a8 8 0 0 1-8 8" stroke="${d.color}" stroke-opacity="${dim * 0.7}" stroke-width="2" fill="none"/>
<rect x="41" y="44" width="6" height="9" fill="${d.color}" opacity="${dim * 0.7}"/>
<rect x="33" y="53" width="22" height="4" rx="2" fill="${d.color}" opacity="${dim * 0.8}"/>`;
    return `<rect x="${x}" y="${y}" width="${tw}" height="${th}" rx="6" fill="#0a1226" stroke="${lit ? d.color : GOLD_DIM}" stroke-opacity="${lit ? 0.5 : 0.25}"/>
${glow}
<g transform="translate(${x + 4} ${y + 12})">${cup}</g>
<text class="g" x="${x + 84}" y="${y + 40}" font-size="21" font-weight="bold" fill="${lit ? d.color : DIM}" opacity="${lit ? 1 : 0.6}">${d.value}${d.unit ?? ''}</text>
<text class="m" x="${x + 84}" y="${y + 58}" font-size="9.5" fill="${lit ? GOLD : DIM}" opacity="${lit ? 1 : 0.6}" letter-spacing="1">${d.label}</text>
<text class="m" x="${x + 84}" y="${y + 74}" font-size="9" fill="${GOLD_DIM}">${lit ? `${roman[t]} - ${progress}` : progress}</text>`;
  };

  const earned = defs.filter(d => tierOf(d.value, d.tiers) > 0).length;
  writeFileSync('dist/trophy-case.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="${TH_}" viewBox="0 0 1012 ${TH_}"><title>Trophy case</title><desc>Eight trophies tiered from real account data: commits, total contributions, repositories, longest streak, active days, reviews, pull requests and issues. Locked trophies show what is still needed. Rendered by this repository, so it cannot fail to load.</desc>
<style><![CDATA[.g{font-family:Georgia,'Times New Roman',serif}.m{font-family:ui-monospace,Consolas,monospace}
@keyframes twinkle{0%,100%{opacity:.15}50%{opacity:1}}.tw{animation:twinkle 3.4s ease-in-out infinite}
@keyframes tglow{0%,100%{opacity:.08}50%{opacity:.24}}.tglow{animation:tglow 4s ease-in-out infinite}]]></style>
<defs><linearGradient id="tc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY2}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<rect x="1" y="1" width="1010" height="${TH_ - 2}" rx="4" fill="url(#tc)" stroke="${GOLD}" stroke-opacity=".45"/>
<rect x="7" y="7" width="998" height="${TH_ - 14}" rx="2" fill="none" stroke="${GOLD}" stroke-opacity=".18"/>
<text class="m" x="26" y="36" font-size="10.5" fill="${GOLD_DIM}" letter-spacing="2">TROPHY CASE — ${earned}/${defs.length} EARNED · TIERS I–IV</text>
${defs.map(trophy).join('\n')}
<text class="m tw" x="986" y="${TH_ - 12}" text-anchor="end" font-size="9" fill="${TEAL}" opacity=".7">↻ refreshed ${stamp}</text>
</svg>`);
}

console.log(`rendered adventure.svg + constellation.svg (${head.length} shown, ${tail.length} folded) + trophy-case.svg`);
