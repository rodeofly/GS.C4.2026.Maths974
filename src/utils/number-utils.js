/**
 * Utilitaires mathématiques pour Maths974.
 * Gestion des conversions décimal -> fraction pour l'affichage pédagogique.
 */

/**
 * Calcule le Plus Grand Commun Diviseur (PGCD).
 */
export function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}

/**
 * Convertit une valeur décimale en objet fraction.
 * @param {number} value - La valeur à convertir (ex: 0.75).
 * @param {object} options - Options de conversion.
 * @param {number[]} [options.allowedDenominators] - Dénominateurs autorisés.
 * @param {number} [options.tolerance=0.001] - Tolérance d'erreur acceptée.
 * @returns {object|null} - { n, d, integer, remainder, isExact } ou null si échec.
 */
export function toFraction(value, {
  allowedDenominators = [2, 3, 4, 5, 6, 8, 10, 12, 100],
  tolerance = 0.001
} = {}) {
  const sign = Math.sign(value);
  const absValue = Math.abs(value);
  
  // Cas entier
  if (Math.abs(absValue - Math.round(absValue)) <= tolerance) {
    return {
      n: Math.round(absValue) * sign,
      d: 1,
      integer: Math.round(absValue) * sign,
      remainder: 0,
      isExact: true
    };
  }

  let bestMatch = null;
  let minError = Infinity;

  for (const d of allowedDenominators) {
    const n = Math.round(absValue * d);
    const error = Math.abs(absValue - n / d);

    if (error <= tolerance && error < minError) {
      minError = error;
      bestMatch = { n: n * sign, d };
    }
  }

  if (bestMatch) {
    const divisor = gcd(bestMatch.n, bestMatch.d);
    const n = bestMatch.n / divisor;
    const d = bestMatch.d / divisor;
    
    return {
      n,
      d,
      integer: Math.trunc(n / d),
      remainder: Math.abs(n % d),
      isExact: minError < Number.EPSILON
    };
  }

  return null; // Pas de fraction trouvée dans la tolérance
}