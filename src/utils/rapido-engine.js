/**
 * rapido-engine.js
 * Moteur de rendu unifié pour toutes les séances Rapido.
 *
 * Prend un tableau de questions et rend une grille de .q-card interactive :
 * construction DOM, visuels, bullets, réponse, pagination.
 *
 * Utilisé par :
 *   - RapidoLayout.astro  (rapidos préprogrammés)
 *   - pages/automaths/rapido.astro  (Mon Rapido — caddy personnalisé)
 */

import './visual-registry.js';
import {
  handleVariantChange,
  quickRandomizeCard,
  addVisualToggleButton,
  addReponseZone,
  addSolutionZone,
} from './rapidos-visuals-integration.js';

// ── Utilitaire texte ────────────────────────────────────────────────────────

function miniMd(text) {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// ── Construction d'une carte ────────────────────────────────────────────────

/**
 * Construit un élément .q-card complet à partir d'une question.
 *
 * @param {object}   question           - { gs?, variantes: [{texte?,type?,config?,rand?,reponse?,gs?}] }
 * @param {number}   index              - position dans la grille (0-based)
 * @param {string}   prefix             - préfixe d'ID (ex: "6e-1-card" → "6e-1-card-0")
 * @param {object}   [opts]
 * @param {boolean}  [opts.showEditor]  - afficher le bouton éditeur ⚙ (défaut : true)
 * @param {Function} [opts.onGsBadgeClick] - callback(gsKey) quand un badge GS est cliqué
 * @returns {HTMLElement}
 */
function buildCard(question, index, prefix, opts = {}) {
  const { showEditor = true, onGsBadgeClick = null } = opts;

  const card = document.createElement('article');
  card.className = 'q-card';
  card.id = `${prefix}-${index}`;

  // ── Numéro ─────────────────────────────────────────────────────────────
  const num = document.createElement('div');
  num.className = 'q-num';
  num.textContent = String(index + 1);
  card.appendChild(num);

  // ── Contrôles (badges GS + bullets) ───────────────────────────────────
  const controls = document.createElement('div');
  controls.className = 'card-header-controls';

  // Un badge GS par variante (togglé avec les bullets)
  // Si v.gs est vide, on prend question.gs en fallback
  question.variantes.forEach((v, vi) => {
    const gs = v.gs ?? question.gs ?? '';
    if (!gs) return;
    const badge = document.createElement('div');
    badge.className = `gs-ref-badge${vi === 0 ? ' active' : ''}`;
    badge.dataset.index = String(vi);
    badge.textContent = gs;
    if (onGsBadgeClick) {
      badge.style.cursor = 'pointer';
      badge.addEventListener('click', e => { e.stopPropagation(); onGsBadgeClick(gs); });
    }
    controls.appendChild(badge);
  });

  // Bullets (seulement si > 1 variante)
  if (question.variantes.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'bullets-nav';
    question.variantes.forEach((_, vi) => {
      const btn = document.createElement('button');
      btn.className = `bullet${vi === 0 ? ' active' : ''}`;
      btn.dataset.variant = String(vi);
      btn.setAttribute('aria-label', `Variante ${vi + 1}`);
      nav.appendChild(btn);
    });
    controls.appendChild(nav);
  }

  card.appendChild(controls);

  // ── Contenu (.q-card-content) ──────────────────────────────────────────
  const content = document.createElement('div');
  content.className = 'q-card-content';

  question.variantes.forEach((v, vi) => {
    const varDiv = document.createElement('div');
    varDiv.className = `variant-content${vi === 0 ? ' active' : ''}`;
    varDiv.dataset.index = String(vi);
    varDiv.dataset.reponse = v.reponse ?? '';

    // Attache visualData pour le système de visuels
    if (v.type) {
      const data = { type: v.type, config: v.config || {}, rand: v.rand || {} };
      varDiv.originalVisualData = JSON.parse(JSON.stringify(data));
      varDiv.visualData = JSON.parse(JSON.stringify(data));
    }

    const textDiv = document.createElement('div');
    textDiv.className = 'content';
    textDiv.innerHTML = miniMd(v.texte ?? '');
    varDiv.appendChild(textDiv);

    content.appendChild(varDiv);
  });

  card.appendChild(content);

  // ── Boutons barre (👁 ⚙ ⟳ ⚡) ajoutés dans .bullets-nav ───────────────
  addVisualToggleButton(card, { showEditor });

  // ── Zones réponse (input+validation) et solution (révélation 👁) ────────
  addReponseZone(card, question);
  addSolutionZone(card, question);

  return card;
}

// ── Train mode ──────────────────────────────────────────────────────────────

function normalizeAnswer(s) {
  return (s ?? '').replace(/\s/g, '');
}

export function injectVisualInput(card) {
  card.querySelectorAll('.visual-answer-wrap').forEach(el => el.remove());
  const visualEl = card.querySelector('[data-solution]:not(.rapido-input)');
  if (!visualEl) return;
  if (visualEl.dataset.placeMode) return; // axe-gradue place mode : interaction par clic, pas de champ texte
  const sol = visualEl.dataset.solution;
  const w   = Math.max(4, sol.length + 1);
  const wrap = document.createElement('span');
  wrap.className = 'rapido-input-wrap visual-answer-wrap';
  wrap.innerHTML = `<input class="rapido-input" type="text" data-solution="${sol}" size="${w}" placeholder="…" autocomplete="off" spellcheck="false"><span class="rapido-fb" aria-hidden="true"></span>`;
  card.querySelector('.variant-content.active .content')?.appendChild(wrap);
}

export function wireCardInputs(card) {
  card.querySelectorAll('.rapido-input').forEach(inp => {
    if (inp.dataset.wired) return;
    inp.dataset.wired = '1';
    const validate = () => {
      if (!inp.value.trim()) return;
      const ok = normalizeAnswer(inp.value.trim()) === normalizeAnswer(inp.dataset.solution);
      inp.classList.toggle('correct', ok);
      inp.classList.toggle('incorrect', !ok);
    };
    inp.addEventListener('blur', validate);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') validate(); });
  });
}

export function wireTrainMode(card) {
  injectVisualInput(card);
  wireCardInputs(card);

  // Câbler le bouton 👁 une seule fois (remplace le handler statique par le handler train)
  const eyeBtn = card.querySelector('.btn-eye-solution');
  if (!eyeBtn || eyeBtn.dataset.trainWired) return;
  const newBtn = eyeBtn.cloneNode(true); // clone sans listeners
  eyeBtn.parentNode?.replaceChild(newBtn, eyeBtn);
  newBtn.style.display = '';
  newBtn.dataset.trainWired = '1';

  newBtn.addEventListener('click', e => {
    e.stopPropagation();
    const inputs = card.querySelectorAll('.rapido-input');
    if (inputs.length > 0) {
      const filled = Array.from(inputs).some(i => i.classList.contains('correct'));
      inputs.forEach(inp => {
        if (filled) { inp.value = ''; inp.classList.remove('correct', 'incorrect'); }
        else        { inp.value = inp.dataset.solution ?? ''; inp.classList.add('correct'); inp.classList.remove('incorrect'); }
      });
      newBtn.classList.toggle('active', !filled);
    } else {
      const display = card.querySelector('.q-solution-display');
      if (display) {
        const visible = display.classList.toggle('visible');
        newBtn.classList.toggle('active', visible);
      }
    }
  });
}

// ── Câblage bullets ─────────────────────────────────────────────────────────

function wireBullets(card, trainMode = false) {
  card.querySelectorAll('.bullet').forEach(bullet => {
    bullet.addEventListener('click', async () => {
      const varIdx = parseInt(bullet.dataset.variant, 10);

      // Re-clic sur bullet active → re-randomiser la variante courante
      if (bullet.classList.contains('active')) {
        await quickRandomizeCard(card);
        if (trainMode) wireTrainMode(card);
        if (window.MathJax) window.MathJax.typesetPromise([card]);
        return;
      }

      // Nouveau clic → charger la variante (reset au config MD original)
      card.querySelectorAll('.bullet').forEach(b => b.classList.remove('active'));
      bullet.classList.add('active');

      card.querySelectorAll('.variant-content').forEach((v, i) =>
        v.classList.toggle('active', i === varIdx));
      card.querySelectorAll('.gs-ref-badge').forEach((b, i) =>
        b.classList.toggle('active', i === varIdx));

      await handleVariantChange(card, varIdx);
      if (trainMode) wireTrainMode(card);
      if (window.MathJax) window.MathJax.typesetPromise([card]);
    });
  });
}

// ── Pagination ──────────────────────────────────────────────────────────────

function wirePagination(allCards, paginationEl, pageSize) {
  const totalPages = Math.ceil(allCards.length / pageSize);

  if (!paginationEl || totalPages <= 1) {
    if (paginationEl) paginationEl.style.display = 'none';
    return;
  }

  const prevBtn = paginationEl.querySelector('#rapido-prev');
  const nextBtn = paginationEl.querySelector('#rapido-next');
  const info    = paginationEl.querySelector('#rapido-page-info');
  let page = 0;

  function showPage(p) {
    page = p;
    allCards.forEach((c, i) =>
      c.classList.toggle('page-hidden', i < p * pageSize || i >= (p + 1) * pageSize));
    if (info)    info.textContent = `${p + 1} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = p === 0;
    if (nextBtn) nextBtn.disabled = p === totalPages - 1;
  }

  paginationEl.style.display = 'flex';
  prevBtn?.addEventListener('click', () => showPage(page - 1));
  nextBtn?.addEventListener('click', () => showPage(page + 1));
  showPage(0);
}

// ── Point d'entrée public ───────────────────────────────────────────────────

/**
 * Initialise une séance Rapido dans un conteneur.
 *
 * @param {HTMLElement}  container              - div.questions-grid (vidé puis rempli)
 * @param {object[]}     questions              - tableau de questions
 * @param {object}       [options]
 * @param {string}       [options.prefix]       - préfixe ID cartes (défaut : 'rc')
 * @param {number}       [options.pageSize]     - cartes par page (défaut : 6)
 * @param {HTMLElement}  [options.paginationEl] - élément de pagination
 * @param {boolean}      [options.showEditor]   - afficher bouton éditeur ⚙ (défaut : true)
 * @param {Function}     [options.onGsBadgeClick] - callback(gsKey) pour overlay GS PDF
 */
export async function initEngine(container, questions, options = {}) {
  const {
    prefix         = 'rc',
    pageSize       = 6,
    paginationEl   = null,
    showEditor     = true,
    trainMode      = false,
    onGsBadgeClick = null,
  } = options;

  // 1. Construire et insérer les cartes
  const allCards = questions.map((question, i) => {
    const card = buildCard(question, i, prefix, { showEditor, onGsBadgeClick });
    if (i >= pageSize) card.classList.add('page-hidden');
    container.appendChild(card);
    return card;
  });

  // 2. Initialiser les visuels (séquentiel pour garantir l'ordre d'affichage)
  for (const card of allCards) {
    await handleVariantChange(card, 0);
    if (trainMode) wireTrainMode(card);
  }

  // 3. MathJax (auto-scan si déjà chargé)
  if (window.MathJax) await window.MathJax.typesetPromise([container]);

  // 4. Câbler les interactions
  allCards.forEach(card => wireBullets(card, trainMode));
  wirePagination(allCards, paginationEl, pageSize);
}
