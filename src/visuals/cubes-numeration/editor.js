// src/visuals/cubes-numeration/editor.js
// Éditeur dédié au visuel "Cubes Numération"
// Affiche les valeurs actuelles + les plages de randomisation.

export function renderEditor(panel, visualData) {
  const config  = visualData.config || {};
  const cardId  = panel.currentCard?.id || 'default';
  const editorBody = panel.querySelector('.editor-body');

  // Charger les préférences de randomisation depuis localStorage
  let prefs = { milliers: '0:1', centaines: '1:3', dizaines: '0:9', unites: '0:9' };
  try {
    const saved = JSON.parse(localStorage.getItem(`cn-rand-prefs-${cardId}`));
    if (saved) prefs = { ...prefs, ...saved };
  } catch (e) {}

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

  editorBody.innerHTML += `
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
             ${config.showLabels !== false ? 'checked' : ''}>
      <label for="cn-showlabels-${cardId}" style="margin:0;font-size:0.75rem;font-weight:600;color:#374151;">
        Afficher les étiquettes
      </label>
    </div>

    <!-- ── PLAGES DE RANDOMISATION ── -->
    <div class="editor-field full-width" style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:6px;padding-left:0;border-left:none;background:transparent;">
      <label style="font-size:0.65rem;color:#64748b;font-weight:800;letter-spacing:0.05em;">PLAGES ALÉATOIRES</label>
      <div style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;margin-top:6px;">
        ${rangePair('milliers',  'MILLIERS',  prefs.milliers)}
        ${rangePair('centaines', 'CENTAINES', prefs.centaines)}
        ${rangePair('dizaines',  'DIZAINES',  prefs.dizaines)}
        ${rangePair('unites',    'UNITÉS',    prefs.unites)}
      </div>
    </div>
  `;

  // Sauvegarder les plages dès qu'elles changent
  editorBody.querySelectorAll('.rand-range').forEach(input => {
    input.addEventListener('input', () => {
      const newPrefs = {};
      ['milliers', 'centaines', 'dizaines', 'unites'].forEach(name => {
        const minEl = editorBody.querySelector(`.rand-range[data-pref="${name}"][data-part="min"]`);
        const maxEl = editorBody.querySelector(`.rand-range[data-pref="${name}"][data-part="max"]`);
        if (minEl && maxEl) newPrefs[name] = `${minEl.value}:${maxEl.value}`;
      });
      localStorage.setItem(`cn-rand-prefs-${cardId}`, JSON.stringify(newPrefs));
    });
  });
}
