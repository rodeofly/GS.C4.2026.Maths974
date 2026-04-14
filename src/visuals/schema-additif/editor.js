// src/visuals/schema-additif/editor.js

const INPUT = 'width:100%;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;';
const LABEL = 'font-size:0.65rem;';

export function renderEditor(_panel, visualData, prefs = {}) {
  const config   = visualData.config   || {};
  const position = visualData.position || 'north';

  // Mode dynamique si content est défini
  const isDynamic = !!config.content;

  const content   = config.content   ?? '';
  const part1expr = config.part1expr ?? '';
  const totalexpr = config.totalexpr ?? '';

  const total   = config.total   ?? 60;
  const part1   = config.part1   ?? 20;
  const part2   = total - part1;
  const unknown = config.unknown ?? 'part1';
  const level   = config.level   ?? 1;
  const unit    = config.unit    ?? '';
  const labelt  = config.labelt  ?? '';
  const label1  = config.label1  ?? '';
  const label2  = config.label2  ?? '';

  const p = {
    totalMin:  prefs.totalMin  ?? 20,
    totalMax:  prefs.totalMax  ?? 99,
    totalStep: prefs.totalStep ?? 10,
  };

  const unknownOptions = [
    { value: 'total', label: 'Total (haut)' },
    { value: 'part1', label: 'Partie gauche' },
    { value: 'part2', label: 'Partie droite' },
  ];

  const modeInfo = isDynamic
    ? `<div style="font-size:0.65rem;color:#7c3aed;background:#f5f3ff;border:1px solid #ddd6fe;
                   border-radius:4px;padding:4px 8px;margin-bottom:6px;">
         Mode dynamique — valeurs calculées depuis le texte
       </div>`
    : `<div style="font-size:0.65rem;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0;
                   border-radius:4px;padding:4px 8px;margin-bottom:6px;">
         Mode statique — valeurs fixées manuellement
       </div>`;

  return `
    ${modeInfo}

    <!-- ── PARAMÈTRES ── -->
    <div class="editor-field full-width" style="padding:0;border:none;background:transparent;">
      <label style="${LABEL}color:#64748b;font-weight:800;letter-spacing:0.05em;">PARAMÈTRES</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;">

        <div>
          <label style="${LABEL}">POSITION</label>
          <select name="position" style="${INPUT}">
            ${['north','south','east','west'].map(opt =>
              `<option value="${opt}" ${opt === position ? 'selected' : ''}>${opt}</option>`
            ).join('')}
          </select>
        </div>

        <div>
          <label style="${LABEL}">VALEUR INCONNUE</label>
          <select name="unknown" style="${INPUT}">
            ${unknownOptions.map(o =>
              `<option value="${o.value}" ${o.value === unknown ? 'selected' : ''}>${o.label}</option>`
            ).join('')}
          </select>
        </div>

        <div>
          <label style="${LABEL}">NIVEAU (1–2)</label>
          <input type="number" min="1" max="2" step="1" name="level"
                 value="${level}" style="${INPUT}">
        </div>

        <div>
          <label style="${LABEL}">UNITÉ (optionnelle)</label>
          <input type="text" name="unit" value="${unit}"
                 placeholder="ex : billes, goyaviers…" style="${INPUT}">
        </div>

      </div>
    </div>

    <!-- ── MODE DYNAMIQUE ── -->
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="${LABEL}color:#64748b;font-weight:800;letter-spacing:0.05em;">TEXTE + EXPRESSIONS</label>
      <div style="margin-top:4px;display:flex;flex-direction:column;gap:5px;">

        <div>
          <label style="${LABEL}">ÉNONCÉ (DSL : [var:min..max], [?expr])</label>
          <textarea name="content" rows="3"
                    placeholder="Jean a [a:20..55] goyaviers. Il en a [b:5..20] de moins que Marie."
                    style="${INPUT}font-family:monospace;resize:vertical;">${content}</textarea>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
          <div>
            <label style="${LABEL}">PARTIE 1 = (expression)</label>
            <input type="text" name="part1expr" value="${part1expr}"
                   placeholder="ex : a" style="${INPUT}font-family:monospace;">
          </div>
          <div>
            <label style="${LABEL}">TOTAL = (expression)</label>
            <input type="text" name="totalexpr" value="${totalexpr}"
                   placeholder="ex : a+b" style="${INPUT}font-family:monospace;">
          </div>
        </div>

      </div>
    </div>

    <!-- ── ÉTIQUETTES DES BARRES ── -->
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="${LABEL}color:#64748b;font-weight:800;letter-spacing:0.05em;">ÉTIQUETTES DES BARRES</label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:4px;">
        <div>
          <label style="${LABEL}">BARRE TOTALE</label>
          <input type="text" name="labelt" value="${labelt}"
                 placeholder="ex : Marie" style="${INPUT}">
        </div>
        <div>
          <label style="${LABEL}">BARRE GAUCHE (part 1)</label>
          <input type="text" name="label1" value="${label1}"
                 placeholder="ex : Jean" style="${INPUT}">
        </div>
        <div>
          <label style="${LABEL}">BARRE DROITE (part 2)</label>
          <input type="text" name="label2" value="${label2}"
                 placeholder="ex : de moins" style="${INPUT}">
        </div>
      </div>
    </div>

    <!-- ── MODE STATIQUE ── -->
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="${LABEL}color:#64748b;font-weight:800;letter-spacing:0.05em;">VALEURS FIXES (mode statique)</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;">

        <div>
          <label style="${LABEL}">TOTAL</label>
          <input type="number" min="1" max="9999" step="1" name="total"
                 value="${total}"
                 ${isDynamic ? 'disabled style="'+INPUT+'background:#f8fafc;color:#94a3b8;"' : `style="${INPUT}"`}>
        </div>

        <div>
          <label style="${LABEL}">PARTIE 1 (gauche)</label>
          <input type="number" min="1" max="9998" step="1" name="part1"
                 value="${part1}"
                 ${isDynamic ? 'disabled style="'+INPUT+'background:#f8fafc;color:#94a3b8;"' : `style="${INPUT}"`}>
        </div>

        <div>
          <label style="${LABEL}">PARTIE 2 (droite — auto)</label>
          <input type="number" name="part2-display" value="${part2}" disabled
                 style="${INPUT}background:#f8fafc;color:#94a3b8;">
        </div>

      </div>
    </div>

    <!-- ── PLAGES DE RÉGÉNÉRATION (mode statique) ── -->
    ${!isDynamic ? `
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:8px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="${LABEL}color:#64748b;font-weight:800;letter-spacing:0.05em;">PLAGES (RÉGÉNÉRATION)</label>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;margin-top:6px;">
        <span style="font-size:0.7rem;font-weight:700;color:#64748b;">TOTAL</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">MIN</span>
          <input type="number" min="1" max="999" step="1"
                 class="sa-range" data-part="totalMin" value="${p.totalMin}"
                 style="width:44px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">MAX</span>
          <input type="number" min="1" max="999" step="1"
                 class="sa-range" data-part="totalMax" value="${p.totalMax}"
                 style="width:44px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">PAS</span>
          <input type="number" min="1" max="100" step="1"
                 class="sa-range" data-part="totalStep" value="${p.totalStep}"
                 style="width:36px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
        </div>
      </div>
    </div>` : ''}
  `;
}

/**
 * Génère une nouvelle config pour le mode statique
 */
export function randomize(currentConfig, prefs) {
  const totalMin  = prefs.totalMin  ?? 20;
  const totalMax  = prefs.totalMax  ?? 99;
  const totalStep = prefs.totalStep ?? 10;

  const count = Math.max(0, Math.floor((totalMax - totalMin) / totalStep));
  const total = totalMin + Math.floor(Math.random() * (count + 1)) * totalStep;

  const minPart = Math.max(1, totalStep);
  const maxPart1 = total - minPart;

  let part1;
  if (maxPart1 <= minPart) {
    part1 = Math.round(total / 2);
  } else {
    const range = Math.max(0, Math.floor((maxPart1 - minPart) / totalStep));
    part1 = minPart + Math.floor(Math.random() * (range + 1)) * totalStep;
  }

  const unknowns = ['total', 'part1', 'part2'];
  const unknown = unknowns[Math.floor(Math.random() * unknowns.length)];

  return { ...currentConfig, total, part1, unknown };
}
