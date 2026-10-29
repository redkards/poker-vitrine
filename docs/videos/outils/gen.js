const fs = require('fs');
const [,, jsonPath, htmlPath] = process.argv;
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cards = s => esc(s).replace(/(10|[2-9AKQJ])([♥♦])/g, '<span class="rc">$1$2</span>').replace(/(10|[2-9AKQJ])([♠♣])/g, '<span class="bc">$1$2</span>');
const sec = t => { const [m, s] = t.split(':').map(Number); return m * 60 + s; };
const len = tc => { const [a, b] = tc.split('–').map(x => x.trim()); return sec(b) - sec(a); };

const css = fs.readFileSync(process.argv[4], 'utf8');

let toc = data.map((v, i) => `<tr><td><b>${i + 1}</b></td><td><b>${esc(v.title)}</b><br><span class="muted">${esc(v.objective)}</span></td><td>${esc(v.level)}</td><td class="nw">${esc(v.duration)}</td><td>${v.shots.length}</td></tr>`).join('\n');

let sections = data.map((v, i) => {
  const shots = v.shots.map(s => `<tr><td class="c-n">${s.n}</td><td class="c-t"><b>${len(s.timecode)} s</b><br><span class="tc">${esc(s.timecode).replace(" – ","<br>– ")}</span></td><td class="c-v">${cards(s.visual)}</td><td class="c-vo">« ${cards(s.voiceover)} »</td><td class="c-e">${cards(s.editing)}</td></tr>`).join('\n');
  return `
<section class="video">
  <div class="eyebrow">Vidéo ${i + 1} / ${data.length} · ${esc(v.level)}</div>
  <h2>${esc(v.title)}</h2>
  <table class="head">
    <tr><th>Niveau</th><td>${esc(v.level)}</td><th>Durée cible</th><td>${esc(v.duration)} · ${v.shots.length} plans</td></tr>
    <tr><th>Objectif</th><td colspan="3">${esc(v.objective)}</td></tr>
    <tr><th>Public</th><td colspan="3">${esc(v.audience)}</td></tr>
    <tr><th>Matériel</th><td colspan="3">${v.materials.map(esc).join(' · ')}</td></tr>
  </table>
  <div class="box neutral yt">
    <b>YouTube — titre</b> (${[...v.youtube.title].length} caractères) : ${esc(v.youtube.title)}<br>
    <b>Description :</b><br>${esc(v.youtube.description).replace(/\n/g, '<br>')}<br>
    <b>Tags :</b> ${v.youtube.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(' ')}
  </div>
  <h3>Storyboard plan par plan</h3>
  <table class="sb">
    <colgroup><col style="width:4%"><col style="width:10%"><col style="width:25%"><col style="width:42%"><col style="width:19%"></colgroup>
    <thead><tr><th>N°</th><th>Durée</th><th>À l'écran</th><th>Texte dit (voix off)</th><th>Montage</th></tr></thead>
    <tbody>
${shots}
    </tbody>
  </table>
  <div class="box"><b>Récapitulatif final en 3 points</b><ol>${v.recap.map(r => `<li>${esc(r)}</li>`).join('')}</ol>
  <b>Appel à l'action :</b> « Retrouvez la leçon interactive sur PokerVitrine. »</div>
</section>`;
}).join('\n');

const total = data.reduce((a, v) => a + sec(v.shots[v.shots.length - 1].timecode.split('–')[1].trim()), 0);

const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>PokerVitrine — Scripts des vidéos pédagogiques</title>
<style>
${css}
  .muted { color: var(--muted); font-size: 9pt; }
  .nw { white-space: nowrap; }
  .video { break-before: page; }
  .video h2 { margin-top: 4pt; }
  table.head th { width: 15%; text-transform: none; letter-spacing: 0; font-size: 9pt; color: var(--ink); }
  table.head td { font-size: 9.5pt; }
  .yt { font-size: 9pt; }
  .tag { display: inline-block; background: #fff; border: 1px solid var(--line); border-radius: 10px; padding: 0 6pt; margin: 1pt 0; font-size: 8.5pt; }
  table.sb { font-size: 8.6pt; table-layout: fixed; }
  table.sb thead { display: table-header-group; }
  table.sb td { padding: 4pt 5pt; line-height: 1.38; }
  table.sb tr:nth-child(even) td { background: #fafbfc; }
  .c-n { width: 4%; font-weight: 700; color: var(--red); }
  .c-t { width: 10%; }
  .c-v { width: 27%; }
  .c-vo { width: 39%; font-family: Georgia, serif; font-size: 9.2pt; }
  .c-e { width: 20%; color: var(--muted); }
  .tc { color: var(--muted); font-size: 7.8pt; white-space: nowrap; }
  .rc { color: var(--red); font-weight: 700; white-space: nowrap; }
  .bc { color: var(--ink); font-weight: 700; white-space: nowrap; }
  ol { margin: 3pt 0 5pt; padding-left: 16pt; }
  .rule { break-before: page; }
</style>
</head>
<body>

<div class="cover">
  <div>
    <div class="eyebrow">Scripts &amp; storyboards vidéo</div>
    <h1>Poker<span>Vitrine</span></h1>
    <p style="color:var(--muted);margin-top:4pt">Cinq vidéos pédagogiques à enregistrer soi-même — voix off, écran ou face caméra</p>
  </div>
  <div class="meta">
    Version du 29 octobre 2026<br>
    ${data.length} vidéos · ${data.reduce((a, v) => a + v.shots.length, 0)} plans<br>
    <span class="nw">Durée cumulée ≈ ${Math.floor(total / 60)} min ${String(total % 60).padStart(2, '0')} s</span>
  </div>
</div>

<div class="summary">
  <div class="tile"><b>${data.length}</b><span>vidéos, même programme que les leçons interactives</span></div>
  <div class="tile"><b>${data.reduce((a, v) => a + v.shots.length, 0)}</b><span>plans détaillés mot pour mot</span></div>
  <div class="tile"><b>≈ ${Math.round(total / 60)} min</b><span>de contenu au total</span></div>
  <div class="tile"><b>100 %</b><span>contenu original, exemples de mains inédits</span></div>
</div>

<h2>Sommaire</h2>
<table>
  <tr><th style="width:5%">N°</th><th>Vidéo et objectif pédagogique</th><th style="width:13%">Niveau</th><th style="width:12%">Durée</th><th style="width:7%">Plans</th></tr>
${toc}
  <tr><td></td><td><b>Conseils d'enregistrement</b> (dernière page)</td><td></td><td></td><td></td></tr>
</table>

<h3>Conventions du document</h3>
<ul>
  <li><b>Vouvoiement</b> constant dans toutes les voix off ; le texte entre guillemets est à lire mot pour mot (débit naturel, environ 150 mots par minute).</li>
  <li><b>Durée</b> : longueur du plan en secondes, puis timecode cumulé depuis le début de la vidéo.</li>
  <li><b>Cartes</b> : A = as, K = roi, Q = dame, J = valet ; <span class="rc">♥ ♦</span> en rouge, <span class="bc">♠ ♣</span> en noir. BB = grosse blinde.</li>
  <li>Chaque vidéo se termine par un récapitulatif en 3 points et l'appel à l'action vers la leçon interactive du site.</li>
</ul>
<div class="box">
  <b>Originalité et droits :</b> scripts, formulations et exemples de mains rédigés spécifiquement pour PokerVitrine, sans reprise d'aucune vidéo,
  chaîne ou cours existant. Visuels à produire soi-même (cartes physiques, schémas maison, captures du site).
  Les pourcentages cités sont des ordres de grandeur arrondis, à revérifier avec un calculateur d'équité avant tournage.
</div>
<div class="box neutral">
  <b>Mention obligatoire</b> (description YouTube et écran de fin) : Réservé aux majeurs. Jouer comporte des risques : endettement, dépendance.
  Joueurs Info Service : 09 74 75 13 13 (appel non surtaxé).
</div>

${sections}

<section class="rule">
  <div class="eyebrow">Pour toutes les vidéos</div>
  <h2>Conseils d'enregistrement</h2>
  <ul>
    <li><b>Son avant tout :</b> pièce calme et meublée (rideaux, canapé), micro à 15-20 cm de la bouche ; faites un essai de 10 secondes et réécoutez au casque avant chaque session.</li>
    <li><b>Voix off d'abord, montage ensuite :</b> enregistrez chaque plan séparément, en laissant 2 secondes de silence avant et après ; recommencez une phrase entière plutôt que de couper au milieu d'un mot.</li>
    <li><b>Cartes physiques :</b> caméra ou téléphone fixé en plongée, tapis uni et mat, lumière douce sur le côté pour éviter les reflets sur les cartes.</li>
    <li><b>Lisibilité :</b> textes à l'écran en gros caractères, affichés au moins 3 secondes ; ajoutez les sous-titres (le script sert de base) pour un visionnage sans le son.</li>
    <li><b>Conformité :</b> la mention « Réservé aux majeurs » et le numéro de Joueurs Info Service figurent dans la description et sur l'écran de fin ; aucune promesse de gain, aucun lien vers un opérateur de jeu.</li>
  </ul>
  <footer>
    PokerVitrine — scripts vidéo générés le 29/10/2026. Données structurées identiques : <code>docs/videos/scripts-videos.json</code> (diapos Canva).
  </footer>
</section>

</body>
</html>
`;
fs.writeFileSync(htmlPath, html);
console.log('html ok', total);
