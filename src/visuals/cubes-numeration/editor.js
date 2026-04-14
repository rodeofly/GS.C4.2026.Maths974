// src/visuals/cubes-numeration/editor.js
// Éditeur dédié au visuel "Cubes Numération"
// Retourne du HTML — les listeners sont gérés par populateEditor dans rapidos-visuals-integration.js
export function renderEditor(panel, visualData, prefs = {}) {
  const config  = visualData.config || {};
  const cardId  = panel.currentCard?.id || 'default';

  // Plages par défaut si prefs partiel
  const p = {
    milliers:  prefs.milliers  ?? '0:1',
    centaines: prefs.centaines ?? '1:3',
    dizaines:  prefs.dizaines  ?? '0:9',
    unites:    prefs.unites    ?? '0:9',
  };

  // ── Helper : paire MIN/MAX ─────────────────────────────────────────────
  const rangePair = (name, label, val) => {
    const [v1, v2] = String(val).split(':');
    return `
      <div style="display:contents;">
        <span style="font-size:0.7rem;font-weight:700;color:#64748b;align-self:center;">${label}</span>
        <div style="display:flex;gap:4px;align-items:center;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">MIN</span>
          <input type="number" min="0" max="9" step="1"
                 class="rand-range" data-pref="${name}" data-part="min" value="${v1 ?? 0}"
                 style="width:36px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
          <span style="font-size:0.6rem;color:#94a3b8;font-weight:700;">MAX</span>
          <input type="number" min="0" max="9" step="1"
                 class="rand-range" data-pref="${name}" data-part="max" value="${v2 ?? 9}"
                 style="width:36px;padding:2px 4px;font-size:0.8rem;border:1px solid #cbd5e1;border-radius:4px;">
        </div>
      </div>`;
  };

  const html = `
    <!-- ── VALEURS ACTUELLES ── -->
    <div class="editor-field full-width" style="padding:0;border:none;background:transparent;">
      <label style="font-size:0.65rem;color:#64748b;font-weight:800;letter-spacing:0.05em;">VALEURS</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px;">
        <div><label style="font-size:0.65rem;">MILLIERS</label>
          <input type="number" min="0" max="9" name="milliers"
                 value="${config.milliers ?? 0}" style="width:100%;"></div>
        <div><label style="font-size:0.65rem;">CENTAINES</label>
          <input type="number" min="0" max="9" name="centaines"
                 value="${config.centaines ?? 0}" style="width:100%;"></div>
        <div><label style="font-size:0.65rem;">DIZAINES</label>
          <input type="number" min="0" max="9" name="dizaines"
                 value="${config.dizaines ?? 0}" style="width:100%;"></div>
        <div><label style="font-size:0.65rem;">UNITÉS</label>
          <input type="number" min="0" max="9" name="unites"
                 value="${config.unites ?? 0}" style="width:100%;"></div>
      </div>
    </div>

    <!-- ── ÉTIQUETTES ── -->
    <div class="editor-field full-width" style="padding:0;border:none;background:transparent;display:flex;align-items:center;gap:8px;">
      <input type="checkbox" id="cn-showlabels-${cardId}" name="showLabels"
             ${config.showLabels ? 'checked' : ''}>
      <label for="cn-showlabels-${cardId}" style="margin:0;font-size:0.75rem;font-weight:600;color:#374151;">
        Afficher les étiquettes
      </label>
    </div>

    <!-- ── PLAGES DE RANDOMISATION ── -->
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="font-size:0.65rem;color:#64748b;font-weight:800;letter-spacing:0.05em;">PLAGES ALÉATOIRES</label>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;margin-top:6px;">
        ${rangePair('milliers',  'MILLIERS',  p.milliers)}
        ${rangePair('centaines', 'CENTAINES', p.centaines)}
        ${rangePair('dizaines',  'DIZAINES',  p.dizaines)}
        ${rangePair('unites',    'UNITÉS',    p.unites)}
      </div>
    </div>
  `;

  return html;
}
