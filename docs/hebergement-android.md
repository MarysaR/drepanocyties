# Utiliser Drepa sur Android (hébergement de test privé)

Solution retenue pour cette phase : **GitHub Codespaces**. Le dépôt y est déjà, le port de l'application est **privé**
(accessible uniquement quand tu es connecté à ton compte GitHub), l'URL est en HTTPS, PostgreSQL n'est joignable que depuis
le conteneur de l'application, et il n'y a rien à payer tant que tu restes dans le quota gratuit.

Ce qui n'est pas idéal, et que tu dois savoir :

- Un codespace **s'arrête après une période d'inactivité** (30 min par défaut, réglable jusqu'à 4 h sur
  <https://github.com/settings/codespaces>). Pour rouvrir Drepa, tu le redémarres depuis <https://github.com/codespaces>
  (depuis le navigateur du téléphone) : l'application se relance seule et reprend la même base.
- Un codespace inutilisé est **supprimé après la durée de rétention** (30 jours par défaut) : la base disparaît avec lui.
  Fais des sauvegardes (voir plus bas) si tes données comptent.
- Quota gratuit d'un compte personnel : 120 heures-cœur par mois (soit 60 h pour une machine 2 cœurs) et 15 Go de stockage.
  Vérifie les chiffres actuels et ta limite de dépense (à laisser à 0 $) sur <https://github.com/settings/billing>.
- Une URL non répertoriée n'est pas une protection : l'accès est protégé par la connexion GitHub (port privé) **et** par
  l'authentification Auth0 de l'application, avec un nombre de comptes plafonné (`NUXT_REGISTRATION_LIMIT=1`).
- Si ces contraintes te pèsent, la suite logique est un hébergement payant toujours allumé (Fly.io, Railway…). Il faudra ton accord
  avant toute création.

## Mise en route (une seule fois)

1. **Pousser la branche** sur GitHub (déjà fait pour le premier commit ; les nouveaux changements doivent l'être aussi).
2. **Créer le codespace** : sur le dépôt, *Code* → *Codespaces* → *Create codespace on branch*
   `claude/mvp-emotional-twin-sickle-wmc0n2` (machine 2 cœurs). La création installe, compile et lance l'application.
   Les secrets techniques (base, session, chiffrement) sont générés automatiquement dans `.devcontainer/.env` (jamais versionné).
3. **Noter l'URL** : `https://<nom-du-codespace>-3000.app.github.dev` (le nom est affiché sur <https://github.com/codespaces>).
4. **Auth0** (<https://manage.auth0.com>) :
   - *Applications* → *Create Application* → type **Regular Web Applications**.
   - *Allowed Callback URLs* : `https://<nom-du-codespace>-3000.app.github.dev/auth/auth0`
   - *Allowed Logout URLs* : `https://<nom-du-codespace>-3000.app.github.dev`
   - Vérifie que la connexion *Username-Password-Authentication* est activée pour cette application (onglet *Connections*).
5. **Secrets Codespaces** (<https://github.com/settings/codespaces> → *New secret*, accès au dépôt `drepanocyties`) :
   `NUXT_ANTHROPIC_API_KEY`, `NUXT_OAUTH_AUTH0_DOMAIN`, `NUXT_OAUTH_AUTH0_CLIENT_ID`, `NUXT_OAUTH_AUTH0_CLIENT_SECRET`.
   Tu les saisis toi-même dans GitHub : ils ne transitent jamais par une conversation ni par Git.
6. **Redémarrer le codespace** (l'arrêter puis le redémarrer) pour que les secrets soient pris en compte.
7. **Vérifier le modèle sans consommer de crédit** : dans le terminal du codespace, `pnpm check:ai`.
   Cette commande interroge uniquement la liste des modèles (gratuit) et confirme que `claude-sonnet-5-5` est accessible.
8. Sur Android, dans Chrome : ouvre l'URL, connecte-toi à GitHub si nécessaire, puis **Créer un compte**.
9. Une fois ton compte créé, **désactive les inscriptions Auth0** : *Authentication* → *Database* →
   *Username-Password-Authentication* → *Settings* → *Disable Sign Ups*. (L'application refuse déjà tout second compte.)
10. **Installer sur l'écran d'accueil** : menu ⋮ de Chrome → *Ajouter à l'écran d'accueil* / *Installer l'application*.

## Maîtrise des coûts de l'IA

- Modèle unique : `claude-sonnet-5-5` (2 $ / M tokens en entrée, 10 $ / M en sortie). Aucun repli automatique vers un autre modèle ni
  vers une IA simulée ; en cas d'indisponibilité, l'erreur et sa cause sont affichées.
- Réponses plafonnées (`NUXT_ANTHROPIC_MAX_OUTPUT_TOKENS`, 2 000 par défaut), historique limité aux 30 derniers messages
  (16 000 caractères), 40 souvenirs au plus, effort de raisonnement faible, prompt système mis en cache.
- Limites par personne : 6 messages par minute, 100 par jour.
- **Plafond applicatif cumulé** (`NUXT_AI_BUDGET_USD`, 12 $ par défaut) : au-delà, plus aucune requête n'est envoyée. Le suivi
  s'affiche sur le tableau de bord. C'est une **estimation** d'après les tokens renvoyés par l'API, pas une garantie de facturation :
  la console Anthropic fait foi. Le rechargement automatique doit rester désactivé.

## Sauvegarde et récupération

- `pnpm db:backup` crée `backups/drepa-<date>.sql.gz` dans le codespace. Les contenus personnels y sont déjà chiffrés, mais la
  sauvegarde n'est lisible qu'avec la clé `NUXT_DATA_ENCRYPTION_KEY` de `.devcontainer/.env` : conserve les deux ensemble, hors du dépôt.
- Restauration : `gunzip -c backups/<fichier>.sql.gz | psql "$DATABASE_URL"` sur une base vide.
- Une sauvegarde qui reste dans le codespace ne protège pas de la suppression du codespace : télécharge-la (explorateur de fichiers
  du codespace) si elle compte.

## Sécurité

- Secrets : Codespaces (externes) et `.devcontainer/.env` (techniques), jamais dans Git, jamais dans le navigateur.
- Cookies de session `httpOnly`, `Secure`, `SameSite=Lax`, 72 h ; contrôle d'origine sur toute requête modifiante, calé sur l'URL
  publique configurée ; mode test inactif ; PostgreSQL sans port publié.
- Ce n'est pas un environnement conforme aux exigences applicables aux données de santé : n'y saisis que des informations fictives.

## Dépannage

| Symptôme | Piste |
| --- | --- |
| Page d'accueil « La connexion n'a pas abouti » | Les URL de rappel Auth0 ne correspondent pas exactement à l'URL du codespace, ou les secrets Auth0 manquent (redémarrer après les avoir ajoutés). |
| « Les inscriptions sont fermées » | Un compte existe déjà (`NUXT_REGISTRATION_LIMIT=1`). Augmente la valeur dans `.devcontainer/.env` si besoin, puis redémarre. |
| Message d'erreur du fournisseur d'IA | Le message indique la cause : clé refusée, modèle introuvable, crédits insuffisants, surcharge. `pnpm check:ai` aide à trancher. |
| L'application ne répond plus | Le codespace est arrêté : le redémarrer depuis <https://github.com/codespaces>. Journaux : `.logs/app.log`. |
