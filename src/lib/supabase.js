import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// createClient() throw de façon synchrone si l'une des deux valeurs manque.
// Si ça arrive au chargement du module (ex: .env absent au moment du build),
// on ne throw PAS ici — un throw à ce stade se produit avant même que React
// ne monte, donc l'ErrorBoundary racine ne peut pas l'attraper (écran blanc
// silencieux). On expose plutôt l'erreur pour qu'un composant la déclenche
// pendant le rendu, où l'ErrorBoundary peut l'afficher.
export const supabaseConfigError = (!url || !anonKey)
  ? `Configuration Supabase manquante au build : ${[!url && 'VITE_SUPABASE_URL', !anonKey && 'VITE_SUPABASE_ANON_KEY'].filter(Boolean).join(' et ')} absente(s). Vérifiez le fichier .env utilisé pour "npm run build".`
  : null;

export const supabase = supabaseConfigError ? null : createClient(url, anonKey);
