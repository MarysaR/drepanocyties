# Drepa — MVP

> Nom de travail, centralisé dans `src/shared/config/productIdentity.ts`.

Compagnon conversationnel d'écoute pour les personnes concernées par la drépanocytose :
conversations persistantes avec un jumeau, mémoire **strictement consentie**, journal émotionnel
privé, tableau de bord et gestion de la confidentialité.

⚠️ **Prototype privé, non déployé publiquement.** Aucune conformité RGPD ou HDS n'est revendiquée : un audit
des obligations applicables reste à mener avant tout usage réel.

## Documents de référence

Les documents officiels (`Vision-Produit-…pdf`, `Plateforme de Marque … v1.0`) **n'étaient pas
présents** dans le dépôt ni dans les fichiers fournis : ils n'ont pas été lus. Voir
`docs/reference/README.md`. Le premier jet applique uniquement les principes donnés dans la mission :

- être présent avant d'être utile ;
- croire sans exiger de preuve ;
- ne jamais réduire une personne à sa maladie ;
- respecter le silence, le consentement et l'autonomie ;
- ne jamais inventer de souvenirs ;
- ne pas se substituer aux professionnels de santé ni aux relations humaines.

Ils sont traduits dans les instructions du jumeau
(`src/domains/conversation/domain/services/TwinInstructionsComposer.ts`) et dans les règles métier.

## Application vierge

Au premier lancement, la base métier est **vide** : aucun compte, profil, conversation, souvenir,
entrée de journal ni consentement. Il n'existe ni seed Prisma, ni données de démonstration, ni mode démo,
ni stockage navigateur (localStorage, IndexedDB, service worker). Ces garanties sont vérifiées par des tests :

- `tests/integration/FreshInstallation.test.ts` : base neuve + migrations ⇒ toutes les tables métier vides ;
- `tests/unit/architecture/NoDemonstrationData.test.ts` : pas de seed, pas d'`INSERT` dans les migrations,
  aucun persona dans le code applicatif, aucun stockage navigateur ;
- `tests/e2e/first-use-blank-application.spec.ts` : un nouvel utilisateur trouve un profil à compléter,
  zéro conversation / souvenir / entrée et aucun consentement ; ses premières données viennent de ses actions.

Mary et Aïcha n'existent **que dans les tests** : chaque test E2E crée ses comptes dans la base dédiée
`twin_e2e`, puis les efface via la fonction réelle « Supprimer toutes mes données » ; le teardown échoue
s'il reste le moindre compte.

## Stack

| Domaine | Technologie |
| --- | --- |
| Framework | Nuxt 4.6 (application monopage, `ssr: false`) + Vue 3.5 |
| Composants | PrimeVue 4.5 en mode **unstyled** + pass-through (`src/shared/presentation/primevue`) |
| Styles | SCSS + variables CSS (`app/assets/styles`) — pas de Tailwind |
| Langage | TypeScript 5.9 strict |
| Authentification | Auth0 (OAuth Authorization Code) via `nuxt-auth-utils`, session chiffrée en cookie |
| Base de données | PostgreSQL 16 + Prisma 7 (adaptateur `pg`, migrations versionnées) |
| IA | Port `ConversationModel`, adaptateur Anthropic (`@anthropic-ai/sdk`), modèle `claude-sonnet-5-5` |
| Validation | Zod 4 |
| Tests | Vitest 4 (unitaires, intégration PostgreSQL réelle), Playwright (E2E) |
| Paquets | pnpm 10 (npm 10.9 échoue sur un bug interne d'arborist avec cet arbre de dépendances) |

## Architecture

Monolithe modulaire en Clean Architecture, organisé par domaine :

```
src/
├── domains/
│   ├── identity/      connexion Auth0 ↔ compte interne (aucun e-mail stocké)
│   ├── profile/       prénom choisi, présentation libre, longueur des réponses
│   ├── conversation/  conversations, messages, instructions du jumeau, adaptateurs IA
│   ├── memory/        propositions, souvenirs, corrections, suppressions, empreintes bloquantes
│   ├── journal/       journal émotionnel privé (jamais transmis à l'IA)
│   ├── consent/       décisions horodatées et versionnées (journal append-only)
│   ├── dashboard/     vue d'ensemble agrégée
│   └── privacy/       export JSON et effacement complet
│       └── <domaine>/{domain, application/{use-cases,ports,dto}, infrastructure, presentation/{api,components,composables}}
├── shared/            erreurs (catchError), validation, chiffrement, Prisma, présentation commune
└── composition/       racine de composition serveur + adaptateurs inter-domaines
app/                   conventions Nuxt : pages, layouts, middleware, plugin PrimeVue, styles
server/                routes HTTP fines (→ cas d'utilisation), middleware d'origine, route Auth0
prisma/                schéma et migrations
tests/                 unit/, integration/, e2e/, support/
```

Règles (vérifiées par `tests/unit/architecture/LayerBoundaries.test.ts`) :

- `domain` ne dépend d'aucun framework ;
- `application` ne dépend que du domaine et de ports ;
- `presentation` ne connaît ni Prisma, ni Anthropic, ni l'infrastructure ;
- un domaine ne parle à un autre que par des contrats (ports), câblés dans `src/composition`.

Gestion des erreurs : `src/shared/errors/catchError.ts` renvoie un résultat explicite
(`{ ok, value } | { ok, error }`) avec `onError` / `onFinally`. Les cas d'utilisation lèvent des
`AppError` typées (métier, validation, introuvable, consentement requis, limite, technique) ; une seule
enveloppe HTTP (`server/http/defineApiRoute.ts`) les traduit en statut et message sûrs. Les composables
utilisent `useAsyncAction` (chargement + erreur) sans `try/catch`.

Convention Vue : `<template>` puis `<script setup lang="ts">` puis `<style scoped lang="scss">`
(imposée par ESLint, règle `vue/block-order`).

## Règles métier clés

- **Consentement** : jamais présumé ; accord valable uniquement sur la version en vigueur du texte ;
  retrait possible à tout moment. Discuter exige l'accord « traitement par une IA ».
- **Mémoire** : le jumeau peut seulement *proposer* (outil `propose_memory`) ; rien n'est retenu sans
  acceptation explicite, éventuellement reformulée. La personne peut aussi retenir l'un de ses messages
  ou écrire un souvenir. Seuls les souvenirs retenus, dans leur version courante, sont transmis au modèle.
- **Correction / suppression** : l'ancienne version est remplacée ou effacée ; une empreinte HMAC
  non réversible (aucun texte conservé) empêche le jumeau de la reproposer.
- **Retrait de la mémoire** : les souvenirs ne sont plus utilisés et les propositions en attente sont abandonnées.
- **Isolation** : toute lecture/écriture filtre par personne ; un élément d'un autre compte répond « introuvable ».

## Sécurité

- contrôle d'accès serveur sur chaque route (session + existence du compte) ;
- session chiffrée `httpOnly`, `SameSite=Lax`, 8 h, renouvelée à la connexion ;
- contrôle d'origine sur les requêtes modifiantes (CSRF) ;
- validation Zod de toutes les entrées et des identifiants ;
- chiffrement AES-256-GCM des contenus personnels au repos (clé dérivée par HKDF) ;
- secrets uniquement côté serveur ; en-têtes de sécurité (CSP, `X-Frame-Options`, etc.) ;
- limitation des appels à l'IA par personne (minute / jour, en mémoire : une seule instance) et plafond cumulé de consommation ;
- nombre de comptes plafonnable (`NUXT_REGISTRATION_LIMIT`) ;
- journaux techniques sans contenu personnel ; Prisma sans journalisation des requêtes ;
- export et effacement complet des données contrôlées par l'application.

## Utiliser Drepa sur Android

Voir [`docs/hebergement-android.md`](docs/hebergement-android.md) : hébergement de test privé sur GitHub Codespaces
(HTTPS, Auth0, PostgreSQL, PWA installable, suivi de consommation, sauvegardes).

## Démarrage local

Prérequis : Node.js ≥ 22, pnpm 10, Docker (ou un PostgreSQL 16 local).

```bash
pnpm install
cp .env.example .env            # puis renseigner les valeurs (voir ci-dessous)
docker compose up -d            # PostgreSQL : bases twin, twin_test, twin_e2e (vides)
pnpm db:deploy                  # applique les migrations sur la base de développement
pnpm dev                        # http://localhost:3000
```

Variables obligatoires dans `.env` :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | base de développement (`twin`) |
| `NUXT_SESSION_PASSWORD` | ≥ 32 caractères aléatoires |
| `NUXT_DATA_ENCRYPTION_KEY` | 32 octets en base64 — la perdre rend les contenus illisibles |
| `NUXT_OAUTH_AUTH0_DOMAIN`, `NUXT_OAUTH_AUTH0_CLIENT_ID`, `NUXT_OAUTH_AUTH0_CLIENT_SECRET` | application Auth0 |
| `NUXT_ANTHROPIC_API_KEY` | clé API Anthropic (sans clé, l'envoi échoue explicitement : aucune réponse simulée) |

### Configuration Auth0 (à faire par vous)

Créer une application **Regular Web Application** :

- *Allowed Callback URLs* : `http://localhost:3000/auth/auth0`
- *Allowed Logout URLs* : `http://localhost:3000`
- l'inscription passe par la page Auth0 (`/auth/auth0?intent=signup` ⇒ `screen_hint=signup`).

Seul l'identifiant `sub` est utilisé (scope `openid`) : aucun e-mail n'est demandé ni stocké.

### IA

Modèle par défaut : `claude-sonnet-5-5` (modifiable via `NUXT_ANTHROPIC_MODEL`), réflexion adaptative,
effort `low`, **aucun repli automatique** vers un autre modèle ni vers une IA simulée : les échecs sont expliqués
(clé refusée, modèle introuvable, crédits insuffisants, surcharge…). La consommation réelle (tokens) de chaque appel est
enregistrée sans contenu ni identité ; un plafond cumulé estimé (`NUXT_AI_BUDGET_USD`) bloque les appels une fois atteint
(estimation applicative, pas une garantie de facturation). `pnpm check:ai` vérifie sans coût que la clé et le modèle sont acceptés.
Pour un autre fournisseur, implémenter
`ConversationModel` (`src/domains/conversation/application/ports/ConversationModel.ts`) et le
sélectionner dans `src/composition/createServerContainer.ts` ; aucun cas d'utilisation n'est à modifier.

## Tests

```bash
pnpm typecheck                  # vue-tsc sur app, serveur, src et tests
pnpm lint
pnpm test                       # unitaires (TDD des règles critiques + garde-fous d'architecture)
TEST_DATABASE_URL=postgresql://twin:twin_local_password@localhost:5432/twin_test pnpm test:integration
pnpm test:e2e                   # build + Playwright sur la base twin_e2e
```

Les E2E lancent l'application compilée en **mode test** (`NUXT_PUBLIC_TEST_MODE=true`) : connexion
par identifiant de test (`/connexion/test`) et modèle conversationnel simulé, signalés par un bandeau.
Ce mode est refusé hors `localhost` et hors d'une base dont le nom contient `test` ou `e2e`.
**Il ne prouve pas** le fonctionnement réel d'Auth0 ni d'Anthropic : voir `docs/hebergement-android.md` pour les vérifier avec vos identifiants.

Si le Chromium de Playwright n'est pas installé : `pnpm exec playwright install chromium`, ou
`PLAYWRIGHT_CHROMIUM_EXECUTABLE=/chemin/vers/chrome pnpm test:e2e`.

## Limites connues du premier jet

- Auth0 et Anthropic n'ont pas encore été testés avec de vrais identifiants. Les tests vérifient la forme des requêtes et la gestion des erreurs avec un transport simulé, ce qui ne prouve pas l'intégration réelle.
- Limiteur d'appels en mémoire du processus : à remplacer par un stockage partagé si plusieurs instances.
- Pas de rotation de la clé de chiffrement ni de sauvegarde ; l'effacement ne couvre pas les éventuelles
  sauvegardes de base ni les données déjà transmises au fournisseur d'IA.
- Textes produit et ton à aligner sur la Vision Produit et la Plateforme de Marque une fois fournies.
