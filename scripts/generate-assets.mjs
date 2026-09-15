// Teyvat profile assets — self-contained animated SVGs (GitHub-safe).
// Run: node scripts/generate-assets.mjs
import { writeFileSync } from 'node:fs';

const OUT = 'assets/';
const NAVY = '#0e1424', NAVY2 = '#131b2e', SKY_TOP = '#070b16', GOLD = '#e8c877', GOLD_DIM = '#8a7443', TEAL = '#7fd8cf', PARCH = '#efe6d0', INK = '#1a2238';

// deterministic LCG for star fields
let seed = 20260915;
const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
const ri = (a, b) => Math.floor(rnd() * (b - a + 1)) + a;

const star = (x, y, r, d, cls = 'tw') =>
  `<circle class="${cls}" cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".8" style="animation-delay:${d}s"/>`;

const twinkleCSS = `
@keyframes twinkle { 0%,100%{opacity:.15} 50%{opacity:1} }
.tw { animation: twinkle 3.4s ease-in-out infinite; }`;

// ---------- banner ----------
{
  let stars = '';
  for (let i = 0; i < 64; i++) stars += star(ri(8, 1004), ri(8, 150), rnd() < 0.85 ? 1 : 1.8, (rnd() * 4).toFixed(1));
  // constellation: 7 stars joined (the Big Dipper-ish "Traveler" mark)
  const cx = 838, cy = 58, pts = [[0, 0], [22, 8], [44, 4], [66, 16], [86, 34], [110, 40], [128, 26]];
  const poly = pts.map(p => `${cx + p[0]},${cy + p[1]}`).join(' ');
  const cst = pts.map((p, i) => star(cx + p[0], cy + p[1], i === 3 ? 2.4 : 1.6, (i * 0.4).toFixed(1), 'tw')).join('');
  writeFileSync(OUT + 'banner.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="230" viewBox="0 0 1012 230"><title>Raliq Hidayat BM3 - Traveler of Teyvat banner</title><desc>Animated night sky over Teyvat: twinkling stars, a constellation, drifting clouds, mountain silhouettes and a floating Anemo Vision.</desc><style><![CDATA[.serif{font-family:Georgia,'Times New Roman',serif}.mono{font-family:ui-monospace,Consolas,Menlo,monospace}
${twinkleCSS}
.cloud-a{animation:drift-a 70s linear infinite}.cloud-b{animation:drift-b 95s linear infinite}
@keyframes drift-a{from{transform:translateX(-190px)}to{transform:translateX(1150px)}}
@keyframes drift-b{from{transform:translateX(1100px)}to{transform:translateX(-260px)}}
.vision{animation:bob 4s ease-in-out infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.vglow{animation:glow 4s ease-in-out infinite}
@keyframes glow{0%,100%{opacity:.35}50%{opacity:.75}}
.shoot{animation:shoot 9s ease-in 3s infinite;opacity:0}
@keyframes shoot{0%{transform:translate(120px,20px);opacity:0}4%{opacity:1}12%{transform:translate(420px,120px);opacity:0}100%{opacity:0}}
.hud-arrow{animation:sway 6s ease-in-out infinite;transform-origin:38px 40px}
@keyframes sway{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(7deg)}}
.questmark{animation:bounce 2.2s ease-in-out infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.cursor{animation:blink 1.1s steps(1) infinite}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.fadein{animation:fin 1.6s ease-out both}
@keyframes fin{from{opacity:0}to{opacity:1}}
]]></style>
<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${SKY_TOP}"/><stop offset=".62" stop-color="${NAVY}"/><stop offset="1" stop-color="${NAVY2}"/></linearGradient>
<radialGradient id="vg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${TEAL}" stop-opacity=".9"/><stop offset="1" stop-color="${TEAL}" stop-opacity="0"/></radialGradient>
<radialGradient id="moon" cx=".38" cy=".35" r=".8"><stop offset="0" stop-color="#f6efdc"/><stop offset="1" stop-color="#d8cfae"/></radialGradient></defs>
<rect width="1012" height="230" fill="url(#sky)"/>
${stars}
<g class="shoot"><line x1="0" y1="0" x2="46" y2="16" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/></g>
<circle cx="952" cy="34" r="16" fill="url(#moon)" opacity=".9"/><circle cx="946" cy="30" r="4" fill="#cfc49f" opacity=".5"/><circle cx="958" cy="40" r="2.4" fill="#cfc49f" opacity=".5"/>
<g opacity=".8">${poly ? `<polyline points="${poly}" fill="none" stroke="${GOLD}" stroke-opacity=".45" stroke-width=".8"/>${cst}` : ''}</g>
<g class="cloud-a" opacity=".07"><ellipse cx="240" cy="96" rx="120" ry="10" fill="#fff"/></g>
<g class="cloud-b" opacity=".05"><ellipse cx="640" cy="66" rx="150" ry="12" fill="#fff"/></g>
<path d="M0 230 60 176 128 210 210 150 300 216 372 186 460 230Z" fill="#0a0f1d"/>
<path d="M420 230 520 168 606 214 700 148 800 210 892 172 1012 230Z" fill="#0c1222"/>
<path d="M0 230 90 196 230 226 360 198 520 228 660 196 830 228 950 200 1012 230Z" fill="${NAVY2}"/>
<g class="vision" transform="translate(792 168)"><circle class="vglow" r="26" fill="url(#vg)"/><circle r="12.5" fill="#10231f" stroke="${GOLD}" stroke-width="1.6"/><path d="M0 -6.2 1.2 -1.7 5.4 -3.4 2.5 0 5.4 3.4 1.2 1.7 0 6.2 -1.2 1.7 -5.4 3.4 -2.5 0 -5.4 -3.4 -1.2 -1.7Z" fill="${TEAL}"/></g>
<g class="questmark" transform="translate(258 148)"><circle r="9.5" fill="#2a2314" stroke="${GOLD}" stroke-width="1.6"/><text y="4.5" text-anchor="middle" font-family="Georgia,serif" font-size="13" fill="${GOLD}">!</text></g>
<g opacity=".92"><circle cx="38" cy="40" r="31" fill="#0a1226" stroke="${GOLD}" stroke-opacity=".75"/><circle cx="38" cy="40" r="27" fill="#0e1626"/>
<clipPath id="mm"><circle cx="38" cy="40" r="27"/></clipPath>
<g clip-path="url(#mm)"><path d="M11 58 22 40 33 52 44 34 56 50 65 42 65 67 11 67Z" fill="#1c2b45"/><path d="M11 67 65 67 65 60 Q38 66 11 61Z" fill="#16233a"/><circle cx="52" cy="26" r="1.6" fill="${TEAL}" opacity=".8"/></g>
<g class="hud-arrow"><path d="M38 28 42.4 44 38 40.8 33.6 44Z" fill="${GOLD}"/></g>
<circle cx="38" cy="40" r="31" fill="none" stroke="#000" stroke-opacity=".25"/></g>
<g class="fadein"><text x="126" y="104" class="serif" font-size="34" fill="${GOLD}" letter-spacing="2">RALIQ HIDAYAT</text>
<text x="128" y="132" class="mono" font-size="12.5" fill="${TEAL}" letter-spacing="3">TRAVELER · FULLSTACK DEVELOPER · WORLD LEVEL 9</text>
<text x="128" y="156" class="mono" font-size="12" fill="#6d7a99">&gt; exploring Teyvat, one commit at a time<tspan class="cursor">▮</tspan></text></g>
</svg>`);
}

// ---------- divider ----------
writeFileSync(OUT + 'divider.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="26" viewBox="0 0 1012 26"><title>divider</title><desc>Thin gold rule with an Anemo emblem at center.</desc><style><![CDATA[${twinkleCSS}]]></style>
<defs><linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${GOLD}" stop-opacity="0"/><stop offset=".5" stop-color="${GOLD}" stop-opacity=".8"/><stop offset="1" stop-color="${GOLD}" stop-opacity="0"/></linearGradient></defs>
<line x1="40" y1="13" x2="470" y2="13" stroke="url(#fade)" stroke-width="1"/><line x1="542" y1="13" x2="972" y2="13" stroke="url(#fade)" stroke-width="1"/>
<rect x="499" y="6" width="14" height="14" transform="rotate(45 506 13)" fill="none" stroke="${GOLD}" stroke-width="1.2"/>
<circle class="tw" cx="506" cy="13" r="2.6" fill="${TEAL}"/>
<circle cx="480" cy="13" r="1.6" fill="${GOLD_DIM}"/><circle cx="532" cy="13" r="1.6" fill="${GOLD_DIM}"/>
</svg>`);

// ---------- section plates ----------
const plate = (file, num, title, chip) => writeFileSync(OUT + file, `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="64" viewBox="0 0 1012 64"><title>${title}</title><desc>Gold-framed ${title} section plate with a ${chip.name} elemental chip.</desc><style><![CDATA[${twinkleCSS}]]></style>
<defs><linearGradient id="pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY2}"/><stop offset="1" stop-color="${NAVY}"/></linearGradient></defs>
<rect x="1" y="1" width="1010" height="62" rx="4" fill="url(#pl)" stroke="${GOLD}" stroke-opacity=".65"/>
<rect x="5" y="5" width="1002" height="54" rx="2" fill="none" stroke="${GOLD}" stroke-opacity=".22"/>
<circle cx="44" cy="32" r="17" fill="#101828" stroke="${GOLD}" stroke-width="1.6"/>
<text x="44" y="38" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="${chip.color}">${chip.glyph}</text>
<text x="74" y="27" font-family="ui-monospace,Consolas,monospace" font-size="10.5" fill="${GOLD_DIM}" letter-spacing="2">CHAPTER ${num}</text>
<text x="74" y="47" font-family="Georgia,'Times New Roman',serif" font-size="19" fill="${GOLD}" letter-spacing="4">${title}</text>
<text class="tw" x="944" y="36" font-family="Georgia,serif" font-size="13" fill="${TEAL}" opacity=".7">✦</text>
<text x="964" y="37" font-family="ui-monospace,Consolas,monospace" font-size="11" fill="${GOLD_DIM}">${chip.tag}</text>
</svg>`);

plate('plate-traveler.svg', 'I', 'THE TRAVELER CARD', { name: 'Anemo Vision', color: TEAL, glyph: '❖', tag: 'AR 60' });
plate('plate-party.svg', 'II', 'PARTY', { name: 'Electro chip', color: '#b58ee8', glyph: '⚡', tag: '4/4' });
plate('plate-commissions.svg', 'III', 'DAILY COMMISSIONS', { name: 'Dendro chip', color: '#98e6af', glyph: '❋', tag: '4/4' });
plate('plate-talents.svg', 'IV', 'TALENT TREE', { name: 'Pyro chip', color: '#ff9a3c', glyph: '✹', tag: 'LV.MAX' });
plate('plate-achievements.svg', 'V', 'ADVENTURE PROGRESS', { name: 'Hydro chip', color: '#4cc2f2', glyph: '❉', tag: '999+' });
plate('plate-coop.svg', 'VI', 'CO-OP WORLD', { name: 'Geo chip', color: '#f7c644', glyph: '◆', tag: 'LV.60' });

// ---------- portrait ----------
writeFileSync(OUT + 'portrait.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="280" viewBox="0 0 240 280"><title>Traveler portrait medallion</title><desc>Gold-framed night portrait: a starry-caped wanderer silhouette beneath a constellation, with an animated scanline.</desc><style><![CDATA[${twinkleCSS}
.scan{animation:scan 5s linear infinite}
@keyframes scan{from{transform:translateY(-40px)}to{transform:translateY(280px)}}
.braid{animation:sway 5s ease-in-out infinite;transform-origin:120px 150px}
@keyframes sway{0%,100%{transform:rotate(0)}50%{transform:rotate(1.6deg)}}
]]></style>
<defs><linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1226"/><stop offset=".7" stop-color="#131b2e"/><stop offset="1" stop-color="#1a2238"/></linearGradient>
<linearGradient id="cape" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24406e"/><stop offset="1" stop-color="#0a1226"/></linearGradient>
<clipPath id="clip"><rect x="14" y="14" width="212" height="232"/></clipPath></defs>
<rect width="240" height="280" fill="${NAVY}"/>
<rect x="8" y="8" width="224" height="264" rx="3" fill="none" stroke="${GOLD}" stroke-width="2"/>
<rect x="14" y="14" width="212" height="232" fill="url(#pbg)"/>
<g clip-path="url(#clip)">
${[...Array(22)].map(() => star(ri(20, 220), ri(20, 120), rnd() < .8 ? 1 : 1.6, (rnd() * 4).toFixed(1))).join('')}
<path d="M20 246 20 150 Q60 96 120 92 Q180 96 220 150 L220 246Z" fill="url(#cape)" opacity=".95"/>
<path d="M60 246 Q74 160 120 150 Q166 160 180 246Z" fill="#0d1730"/>
<circle cx="120" cy="112" r="30" fill="#0d1730"/>
<g class="braid"><path d="M94 122 Q88 160 96 196" stroke="#7fd8cf" stroke-width="2.5" fill="none" opacity=".75"/><path d="M146 122 Q152 160 144 196" stroke="#7fd8cf" stroke-width="2.5" fill="none" opacity=".75"/></g>
<path d="M96 96 Q120 78 144 96 L138 106 Q120 92 102 106Z" fill="#3a2f1c"/>
<text x="120" y="118" text-anchor="middle" font-family="Georgia,serif" font-size="21" fill="${GOLD}">✦</text>
<circle cx="70" cy="196" r="1.8" fill="${TEAL}" class="tw"/><circle cx="170" cy="210" r="1.8" fill="${TEAL}" class="tw" style="animation-delay:1.2s"/>
<rect class="scan" x="14" y="0" width="212" height="34" fill="#7fd8cf" opacity=".05"/>
</g>
<rect x="60" y="252" width="120" height="20" rx="3" fill="#101828" stroke="${GOLD}" stroke-opacity=".7"/><text x="120" y="266" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="11" fill="${GOLD}" letter-spacing="2">TRAVELER</text>
</svg>`);

// ---------- footer ----------
writeFileSync(OUT + 'footer.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="1012" height="96" viewBox="0 0 1012 96"><title>Footer - make a wish upon the stars</title><desc>Starry footer with the five-pointed wish motif.</desc><style><![CDATA[${twinkleCSS}]]></style>
<defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${NAVY}"/><stop offset="1" stop-color="${SKY_TOP}"/></linearGradient></defs>
<rect width="1012" height="96" fill="url(#fsky)"/>
${[...Array(26)].map(() => star(ri(10, 1002), ri(8, 88), 1, (rnd() * 4).toFixed(1))).join('')}
<line x1="60" y1="48" x2="300" y2="48" stroke="${GOLD}" stroke-opacity=".4"/><line x1="712" y1="48" x2="952" y2="48" stroke="${GOLD}" stroke-opacity=".4"/>
<text x="506" y="44" text-anchor="middle" font-family="Georgia,'Times New Roman',serif" font-size="16" fill="${GOLD}" letter-spacing="2">✦ MAY EVERY 50/50 LAND IN ONE PULL ✦</text>
<text x="506" y="64" text-anchor="middle" font-family="ui-monospace,Consolas,monospace" font-size="10" fill="#6d7a99" letter-spacing="2">— RALIQ HIDAYAT BM3 · CODED IN INDONESIA 🇮🇩 —</text>
</svg>`);

// ---------- elemental orbs ----------
const elements = {
  anemo: { c: '#23d3c3', g: '❖' }, electro: { c: '#b58ee8', g: '⚡' }, dendro: { c: '#98e6af', g: '❋' },
  hydro: { c: '#4cc2f2', g: '❉' }, pyro: { c: '#ff9a3c', g: '✹' }, cryo: { c: '#9ee7ff', g: '❆' },
  geo: { c: '#f7c644', g: '◆' }, void: { c: '#6d7a99', g: '?' },
};
for (const [name, el] of Object.entries(elements)) {
  const halo = name === 'void' ? '' : `<circle class="vglow" cx="44" cy="44" r="36" fill="${el.c}" opacity=".14"/>`;
  writeFileSync(OUT + `orb-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88" viewBox="0 0 88 88"><title>${name} orb</title><desc>A glowing ${name}-colored elemental orb emblem.</desc><style><![CDATA[${twinkleCSS}
.vglow{animation:glow 3.6s ease-in-out infinite}
@keyframes glow{0%,100%{opacity:.18}50%{opacity:.42}}
.rim{animation:spin 18s linear infinite;transform-origin:44px 44px}
@keyframes spin{to{transform:rotate(360deg)}}
]]></style>
${halo}<circle class="rim" cx="44" cy="44" r="33" fill="none" stroke="${el.c}" stroke-opacity=".5" stroke-width="1" stroke-dasharray="3 7"/>
<circle cx="44" cy="44" r="27" fill="#101828" stroke="${GOLD}" stroke-width="2"/>
<text x="44" y="53" text-anchor="middle" font-size="22" fill="${el.c}">${el.g}</text>
<circle class="tw" cx="44" cy="8" r="2" fill="${el.c}"/>
</svg>`);
}

// ---------- hidden relic (easter egg) ----------
writeFileSync(OUT + 'relic.svg', `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><title>Hidden Star Relic</title><desc>A rotating eight-point star relic that glows when hovered near the abyss.</desc><style><![CDATA[${twinkleCSS}
.spin{animation:spin 14s linear infinite;transform-origin:48px 48px}
@keyframes spin{to{transform:rotate(360deg)}}
.pulse{animation:glow 3s ease-in-out infinite}
@keyframes glow{0%,100%{opacity:.3}50%{opacity:.9}}
]]></style>
<circle class="pulse" cx="48" cy="48" r="40" fill="${TEAL}" opacity=".15"/>
<g class="spin"><path d="M48 8 53 35 48 30 43 35Z M48 88 53 61 48 66 43 61Z M8 48 35 43 30 48 35 53Z M88 48 61 43 66 48 61 53Z" fill="${GOLD}"/>
<circle cx="48" cy="48" r="11" fill="#101828" stroke="${GOLD}" stroke-width="2"/>
<circle class="tw" cx="48" cy="48" r="4" fill="${TEAL}"/></g>
</svg>`);

console.log('assets generated');

