// src/visuals/axe-gradue/editor.js

export function renderEditor(panel, visualData) {
  const editorBody = panel.querySelector('.editor-body');
  const config = visualData.config || {};
  const position = visualData.position || 'north';

  // 1. Charger les préférences aléatoires — Priorité : editor_prefs du MD > localStorage
  let randPrefs = { min: '0:50', count: '5:8', steps: '10, 20, 5', visible: '2:4', points: '1:1', snap: true };

  const markdownPrefs = visualData.editor_prefs;
  if (markdownPrefs) {
    // Format markdown : { minRange: [0,50], countRange: [5,8], steps: [10,20,5], ... }
    if (markdownPrefs.minRange)    randPrefs.min     = Array.isArray(markdownPrefs.minRange)    ? markdownPrefs.minRange.join(':')    : markdownPrefs.minRange;
    if (markdownPrefs.countRange)  randPrefs.count   = Array.isArray(markdownPrefs.countRange)  ? markdownPrefs.countRange.join(':')  : markdownPrefs.countRange;
    if (markdownPrefs.steps)       randPrefs.steps   = Array.isArray(markdownPrefs.steps)       ? markdownPrefs.steps.join(', ')      : markdownPrefs.steps;
    if (markdownPrefs.visibleRange) randPrefs.visible = Array.isArray(markdownPrefs.visibleRange) ? markdownPrefs.visibleRange.join(':') : markdownPrefs.visibleRange;
    if (markdownPrefs.pointsRange) randPrefs.points  = Array.isArray(markdownPrefs.pointsRange) ? markdownPrefs.pointsRange.join(':') : markdownPrefs.pointsRange;
    if (markdownPrefs.snap !== undefined) randPrefs.snap = markdownPrefs.snap;
  }

  // Helper pour les champs range (min/max inputs)
  const rangeField = (label, name, val) => {
    const [v1, v2] = val.split(':');
    return `
      <div class="editor-field full-width range-group">
        <label>${label}</label>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">MIN</span>
            <input type="number" step="any" value="${v1}" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
          </div>
          <div style="display: flex; align-items: center; gap: 0.3rem;">
            <span style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">MAX</span>
            <input type="number" step="any" value="${v2}" style="padding: 0.2rem 0.4rem; font-size: 0.8rem;">
          </div>
        </div>
        <input type="hidden" name="${name}" value="${val}">
      </div>
    `;
  };

  // 2. HTML Fusionné
  const html = `
    <!-- CHAMPS CACHÉS (Pour stocker les valeurs générées) -->
    <input type="hidden" name="min" value="${config.min}">
    <input type="hidden" name="max" value="${config.max}">
    <input type="hidden" name="step" value="${config.step}">
    <input type="hidden" name="mode" value="${config.mode || 'decimal'}">
    <input type="hidden" name="denominators" value="${config.denominators || '2,4,5,10'}">
    <input type="hidden" name="width" value="${config.width || 800}">
    <input type="hidden" name="height" value="${config.height || 100}">
    <input type="hidden" name="visibleLabels" value="${Array.isArray(config.visibleLabels) ? config.visibleLabels.join(', ') : ''}">
    <input type="hidden" name="points" value='${JSON.stringify(config.points || [])}'>

    <!-- LIGNE 1 : POSITION + SUR GRADUATION (SELECT) -->
    <div class="editor-field" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; align-items: end;">
       <div class="editor-field" style="padding: 0; border: none; background: transparent;">
          <label for="editor-field-position">POSITION</label>
          <select id="editor-field-position" name="position">
            ${['north', 'south', 'east', 'west'].map(opt => `<option value="${opt}" ${opt === position ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
       </div>
       
       <div class="editor-field" style="justify-content: flex-end; padding-bottom: 5px; padding: 0; border: none; background: transparent;">
          <label for="rand-snap-select">SUR GRADUATION</label>
          <select id="rand-snap-select" name="rand-snap">
            <option value="true" ${randPrefs.snap ? 'selected' : ''}>OUI</option>
            <option value="false" ${!randPrefs.snap ? 'selected' : ''}>NON</option>
          </select>
       </div>
    </div>

    <!-- LIGNE 2 : MODE + DÉNOMINATEURS -->
    <div class="editor-field" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
       <div class="editor-field" style="padding: 0; border: none; background: transparent;">
          <label>MODE</label>
          <select name="mode_select" onchange="this.parentElement.parentElement.parentElement.querySelector('[name=mode]').value = this.value; this.parentElement.parentElement.parentElement.querySelector('[name=mode]').dispatchEvent(new Event('input', {bubbles:true}));">
            ${['decimal', 'fraction', 'mixed'].map(m => `<option value="${m}" ${m === (config.mode || 'decimal') ? 'selected' : ''}>${m}</option>`).join('')}
          </select>
       </div>
       <div class="editor-field" style="padding: 0; border: none; background: transparent;">
          <label>DÉNOMINATEURS</label>
          <input type="text" value="${Array.isArray(config.denominators) ? config.denominators.join(',') : (config.denominators || '2,4,5,10')}" onchange="this.parentElement.parentElement.parentElement.querySelector('[name=denominators]').value = this.value; this.parentElement.parentElement.parentElement.querySelector('[name=denominators]').dispatchEvent(new Event('input', {bubbles:true}));">
       </div>
    </div>

    <!-- PARAMÈTRES -->
    <div class="editor-field full-width">
      <label for="editor-field-rand-steps">PAS POSSIBLES</label>
      <input type="text" id="editor-field-rand-steps" name="rand-steps" value="${randPrefs.steps}" />
    </div>
    ${rangeField('INTERVALLE MIN', 'rand-min-range', randPrefs.min)}
    ${rangeField('NB GRADUATIONS (LONGUEUR)', 'rand-count-range', randPrefs.count)}
    ${rangeField('ABSCISSES AFFICHÉES', 'rand-visible-range', randPrefs.visible)}
    ${rangeField('NB POINTS', 'rand-points-range', randPrefs.points)}
  `;

  editorBody.insertAdjacentHTML('beforeend', html);

  // Logique pour mettre à jour les inputs hidden quand on change les ranges
  panel.querySelectorAll('.range-group').forEach(group => {
    const hidden = group.querySelector('input[type="hidden"]');
    const inputs = group.querySelectorAll('input[type="number"]');
    
    const updateHidden = () => {
      hidden.value = `${inputs[0].value}:${inputs[1].value}`;
      hidden.dispatchEvent(new Event('input'));
    };
    
    inputs.forEach(inp => inp.addEventListener('input', updateHidden));
  });

}
