import { Capacitor } from '@capacitor/core';

/**
 * Détection de la plateforme d'exécution.
 *
 * isNativeApp() → true quand le code tourne DANS l'app iOS/Android (Capacitor),
 *                 false quand il tourne dans un navigateur web classique.
 *
 * Sert à afficher un écran d'accueil visiteur différent :
 *   - Web  : page de vente (LandingPage) qui présente le produit + les offres
 *   - App  : inscription/connexion directe (l'utilisateur a déjà téléchargé l'app)
 *
 * On enveloppe l'appel dans un try/catch : si Capacitor n'est pas dispo pour une
 * raison quelconque, on considère par défaut qu'on est sur le web (comportement
 * le plus sûr : on ne cache jamais la page de vente par erreur).
 */
export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Plateforme précise : 'ios', 'android' ou 'web'.
 * Utile si un jour on veut un comportement spécifique par OS.
 */
export function getPlatform() {
  try {
    return Capacitor.getPlatform();
  } catch {
    return 'web';
  }
}
