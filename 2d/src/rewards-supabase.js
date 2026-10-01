// Adaptateur Supabase du fournisseur de récompenses. NON BRANCHÉ : ce fichier n'est importé par rien
// et ne part pas dans dist/respawn-2d.js. Pour l'activer plus tard, la page (script de la boutique)
// importe ce module et passe son résultat au jeu :
//
//   import { createSupabaseRewards } from '.../2d/src/rewards-supabase.js';
//   mount(null, { overlay: true, rewards: createSupabaseRewards({ url, anonKey }) });
//
// Seule la clé publique « anon » est côté navigateur. Les codes promo restent en base : ils ne
// sortent que par la fonction claim_reward, après vérification du run, jamais par une lecture directe
// des tables (RLS fermée sur reward_pool et claims).
//
// Schéma proposé (Postgres / Supabase) :
//
//   players     (id text pk, created_at timestamptz default now(), email text null,
//                email_consent boolean default false, consent_at timestamptz null, lang text)
//               -- e-mail facultatif, saisi seulement avec consentement explicite (RGPD)
//   runs        (id uuid pk default gen_random_uuid(), player_id text references players,
//                seed bigint not null, daily date null, referrer text null,
//                started_at timestamptz default now(), ended_at timestamptz null,
//                score int null, distance int null, proof jsonb null, verdict text null)
//               -- signature = HMAC(id || seed || started_at) côté serveur
//   reward_pool (id bigserial pk, tier text check (tier in ('bronze','silver','gold')),
//                code text not null, label text, url text, max_claims int null,
//                claimed int default 0, valid_until timestamptz)
//   claims      (id bigserial pk, run_id uuid references runs, player_id text, type text,
//                tier text null, product_id int null, code text null, ok boolean,
//                reason text null, created_at timestamptz default now(),
//                unique (player_id, type, tier, day)  -- une récompense par palier et par jour)
//   referrals   (id bigserial pk, referrer text references players, referee text references players,
//                first_run uuid references runs, rewarded boolean default false,
//                created_at timestamptz default now(), unique (referrer, referee))
//
// Fonctions RPC (security definer) :
//   start_run(player text, referrer text, lang text, challenge_seed bigint)
//       -> { run_id, seed, signature }   (graine du jour, ou celle du défi, ou aléatoire)
//   claim_reward(run_id uuid, type text, tier text, product_ids int[], proof jsonb)
//       -> { ok, code, label, url, message }
//   Vérifications de claim_reward : run existant, non réclamé, durée ≈ 60 s, distance cohérente
//   avec la graine et la durée, jetons attrapés présents dans le parcours de cette graine, rythme
//   des entrées humainement plausible ; quota par joueur, par jour et par palier.
export function createSupabaseRewards({ url, anonKey, fetchImpl = fetch } = {}) {
  if (!url || !anonKey) throw new Error('createSupabaseRewards : url et anonKey requis');
  const rpc = async (fn, body) => {
    const r = await fetchImpl(url.replace(/\/$/, '') + '/rest/v1/rpc/' + fn, {
      method: 'POST', headers: { apikey: anonKey, Authorization: 'Bearer ' + anonKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (!r.ok) throw new Error('rpc ' + fn + ' ' + r.status);
    return r.json();
  };
  return {
    async session({ player, referrer, lang, challengeSeed } = {}) {
      const d = await rpc('start_run', { player, referrer: referrer || null, lang: lang || null, challenge_seed: challengeSeed || null });
      return { runId: d.run_id, seed: Number(d.seed) >>> 0, signature: d.signature };
    },
    async claim({ type, tier, id, ids, runProof }) {
      const d = await rpc('claim_reward', { run_id: runProof && runProof.runId, type, tier: tier || null, product_ids: ids || (id ? [id] : null), proof: runProof || null });
      return { ok: !!d.ok, code: d.code || undefined, label: d.label || undefined, url: d.url || undefined, message: d.message || undefined };
    },
  };
}
