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

const realClient = supabaseConfigError ? null : createClient(url, anonKey);

// ── Garde-fou compte démo partagé ───────────────────────────────────
// Le mode démo natif (voir AuthPage/App.jsx) connecte l'utilisateur au
// compte partagé demo@moveupapp.com pour explorer l'app réelle sans
// créer de compte. Ce compte étant partagé entre tous les visiteurs de
// la démo, il ne doit JAMAIS être mutable : une écriture d'un visiteur
// ne doit pas casser la démo des autres.
//
// Plutôt que de traquer chaque appel .insert/.update/.upsert/.delete
// dispersé dans les pages (Agenda, Historique, Devis, NewVisitModal…),
// on intercepte ces quatre verbes à la source, sur l'objet retourné par
// .from(table). Tout le reste (select, eq, order, single…) passe par
// l'implémentation réelle, inchangée — donc aucun effet sur les vrais
// comptes. Une écriture bloquée résout silencieusement en { data: null,
// error: null } : le code appelant (déjà écrit pour gérer un échec
// réseau) affiche son état "enregistré" normal sans jamais toucher la
// base.
const DEMO_EMAIL = 'demo@moveupapp.com';
let demoSessionActive = false;

const MUTATING_METHODS = new Set(['insert', 'update', 'upsert', 'delete']);

function noopQueryBuilder() {
  // data: {} plutôt que null — un appelant qui fait data.id ou
  // data.share_token sans vérifier error d'abord obtient `undefined`
  // (comme un vrai champ absent) plutôt qu'un crash "cannot read
  // property of null".
  const result = { data: {}, error: null, count: 0, status: 200, statusText: 'OK' };
  const proxy = new Proxy(() => {}, {
    apply: () => proxy,
    get(_target, prop) {
      if (prop === 'then') return (resolve) => resolve(result);
      if (prop === 'catch' || prop === 'finally') return () => proxy;
      return () => proxy; // .eq(), .select(), .single(), etc. restent chaînables
    },
  });
  return proxy;
}

function wrapTable(realTable) {
  return new Proxy(realTable, {
    get(target, prop) {
      const value = target[prop];
      if (typeof value !== 'function') return value;
      if (MUTATING_METHODS.has(prop)) {
        return (...args) => (demoSessionActive ? noopQueryBuilder() : value.apply(target, args));
      }
      return value.bind(target);
    },
  });
}

export const supabase = realClient
  ? new Proxy(realClient, {
      get(target, prop) {
        if (prop === 'from') return (table) => wrapTable(target.from(table));
        const value = target[prop];
        return typeof value === 'function' ? value.bind(target) : value;
      },
    })
  : null;

realClient?.auth.onAuthStateChange((_event, session) => {
  demoSessionActive = session?.user?.email === DEMO_EMAIL;
});
