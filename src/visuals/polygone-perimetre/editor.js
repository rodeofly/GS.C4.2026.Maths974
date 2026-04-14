// src/visuals/polygone-perimetre/editor.js
// Éditeur dédié au visuel "Polygone Périmètre"

const SHAPES = [
  { value: 'rect',     label: 'Rectangle' },
  { value: 'carre',    label: 'Carré' },
  { value: 'losange',  label: 'Losange' },
  { value: 'kite',     label: 'Cerf-volant' },
  { value: 'quad',     label: 'Quadrilatère quelconque' },
  { value: 'L',        label: 'Forme en L' },
  { value: 'escalier', label: 'Escalier' },
  { value: 'tri_rect', label: 'Triangle rectangle' },
  { value: 'tri_iso',  label: 'Triangle isocèle' },
];

export function renderEditor(panel, visualData, prefs = {}) {
  const config = visualData.config  || {};
  const cardId = panel.currentCard?.id || 'default';

  // Valeurs par défaut pour les plages de randomisation
  const p = {
    valueMin:  prefs.valueMin  ?? 2,
    valueMax:  prefs.valueMax  ?? 9,
    shapes:    prefs.shapes    ?? SHAPES.map(s => s.value),
    level:     prefs.level     ?? config.level ?? 1,
  };

  const shapeOptions = SHAPES.map(s => `
    <option value="${s.value}" ${config.shape === s.value ? 'selected' : ''}>${s.label}</option>
  `).join('');

  const html = `
    <!-- ── PARAMÈTRES ACTUELS ── -->
    <div class="editor-field full-width" style="padding:0;border:none;background:transparent;">
      <label style="font-size:0.65rem;color:#64748b;font-weight:800;letter-spacing:0.05em;">PARAMÈTRES</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;">

        <div>
          <label style="font-size:0.65rem;">FORME</label>
          <select name="shape" style="width:100%;font-size:0.8rem;padding:2px 4px;border:1px solid #cbd5e1;border-radius:4px;">
            ${shapeOptions}
          </select>
        </div>

        <div>
          <label style="font-size:0.65rem;">UNITÉ</label>
          <select name="unit" style="width:100%;font-size:0.8rem;padding:2px 4px;border:1px solid #cbd5e1;border-radius:4px;">
            <option value="cm" ${(config.unit||'cm')==='cm'?'selected':''}>cm</option>
            <option value="m"  ${(config.unit||'cm')==='m' ?'selected':''}>m</option>
            <option value="dm" ${(config.unit||'cm')==='dm'?'selected':''}>dm</option>
            <option value="mm" ${(config.unit||'cm')==='mm'?'selected':''}>mm</option>
          </select>
        </div>

        <div>
          <label style="font-size:0.65rem;">NIVEAU (1–3)</label>
          <input type="number" min="1" max="3" step="1" name="level"
                 value="${config.level ?? 1}"
                 style="width:100%;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
        </div>

        <div>
          <label style="font-size:0.65rem;">GRAINE</label>
          <input type="text" name="seed" value="${config.seed || 'poly'}"
                 style="width:100%;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
        </div>

      </div>
    </div>

    <!-- ── PLAGES DE VALEURS ── -->
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="font-size:0.65rem;color:#64748b;font-weight:800;letter-spacing:0.05em;">PLAGES DE VALEURS</label>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;margin-top:6px;">

        <span style="font-size:0.7rem;font-weight:700;color:#64748b;align-self:center;">VALEURS</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">MIN</span>
          <input type="number" min="1" max="20" step="1"
                 class="pp-range" data-part="min" value="${p.valueMin}"
                 style="width:36px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">MAX</span>
          <input type="number" min="1" max="20" step="1"
                 class="pp-range" data-part="max" value="${p.valueMax}"
                 style="width:36px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
        </div>

      </div>
    </div>
  `;

  return html;
}

/**
 * Génère une nouvelle seed aléatoire pour le randomiseur
 */
export function randomizeSeed() {
  const id = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `rnd${id}`;
}

/**
 * Construit la config depuis les prefs de randomisation
 */
export function buildRandomConfig(currentConfig, prefs) {
  const vmin = prefs.valueMin ?? 2;
  const vmax = prefs.valueMax ?? 9;

  // Choisir une forme parmi la liste autorisée
  const allowedShapes = Array.isArray(prefs.shapes) && prefs.shapes.length
    ? prefs.shapes
    : ['rect', 'carre', 'losange', 'kite', 'quad', 'L', 'escalier', 'tri_rect', 'tri_iso'];
  const shape = allowedShapes[Math.floor(Math.random() * allowedShapes.length)];

  return {
    ...currentConfig,
    seed: randomizeSeed(),
    shape,
    valuerange: [vmin, vmax],
    level: prefs.level ?? currentConfig.level ?? 1,
  };
}
