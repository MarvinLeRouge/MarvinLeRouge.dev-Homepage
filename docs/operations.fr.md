🇫🇷 Version française | [🇬🇧 English version](operations.md)

---

# Exploitation

Comment le site est construit, déployé, vérifié et restauré.

## Vue d'ensemble

```
pull request ──> CI ──> merge sur main ──> CI sur main ──> Build & Deploy
                                                           ├─ build : image poussée sur GHCR (tags latest et <sha>)
                                                           ├─ deploy : SSH vers le VPS, compose pull et up
                                                           └─ verify : https://marvinlerouge.dev sert la nouvelle version
```

- Image : `ghcr.io/marvinlerouge/marvinlerouge.dev-website`, taguée `latest` et avec le SHA complet du commit.
- Le VPS exécute toujours une image figée sur un SHA de commit, jamais `latest`. Chaque image sert son SHA de commit à l'adresse `/version.txt`.
- Stack de production : `docker-compose.prod.yml`, projet compose `website`, dans `/home/mlr/marvinlerouge.dev/website/compose` sur le VPS.
- Routage : le Traefik partagé du VPS (réseau `traefik-public`, entrypoint `websecure`, résolveur de certificats `letsencrypt`), derrière le proxy Cloudflare.
- `www.marvinlerouge.dev` (couvert par l'enregistrement DNS `*.marvinlerouge.dev`) redirige de façon permanente (301) vers `https://marvinlerouge.dev`, chemin et paramètres conservés : routeur `website-www`, middleware `website-www-redirect`.

## Secrets

Secrets du dépôt (Settings, Secrets and variables, Actions) :

| Secret                   | Valeur                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| `DEPLOY_SSH_HOST`        | Nom d'hôte ou IP du VPS, même valeur que dans les autres dépôts du portfolio                    |
| `DEPLOY_SSH_USER`        | Utilisateur SSH sur le VPS, même valeur que dans les autres dépôts du portfolio                 |
| `DEPLOY_SSH_PRIVATE_KEY` | Clé privée propre à ce dépôt (`~/.ssh/id_ed25519_website_deploy`, commentaire `website-deploy`) |

Chaque projet du portfolio se déploie avec sa propre clé, autorisée dans `~/.ssh/authorized_keys` sur le VPS : une clé peut être révoquée sans toucher aux autres projets. Pour créer ou remplacer la clé de ce dépôt :

```bash
ssh-keygen -t ed25519 -N '' -C website-deploy -f ~/.ssh/id_ed25519_website_deploy
ssh-copy-id -i ~/.ssh/id_ed25519_website_deploy.pub <utilisateur-vps>@<hôte-vps>    # ajoute, n'écrase rien
ssh -i ~/.ssh/id_ed25519_website_deploy -o IdentitiesOnly=yes -o BatchMode=yes <utilisateur-vps>@<hôte-vps> 'echo ok'
gh secret set DEPLOY_SSH_PRIVATE_KEY --repo MarvinLeRouge/MarvinLeRouge.dev-Website < ~/.ssh/id_ed25519_website_deploy
```

La dernière commande lit la clé depuis le fichier et ne l'affiche jamais.

Le push et le pull de l'image utilisent le `GITHUB_TOKEN` du workflow : aucun secret de registre n'est nécessaire.

## Déployer

Merger une pull request dans `main` suffit : une fois le workflow `CI` réussi sur `main`, `Build & Deploy` démarre sur le même commit.

Garde-fous :

- Seules les exécutions de CI déclenchées par un push sur le `main` de ce dépôt déploient : une pull request, même depuis la branche `main` d'un fork, ne déploie jamais.
- Si `main` a avancé entre-temps, l'exécution saute le déploiement : celle du commit plus récent s'en charge.
- Le déploiement attend que le conteneur soit en bonne santé (`docker compose up --wait`) et échoue sinon.

Pour redéployer à la main la version actuelle de `main` : Actions, `Build & Deploy`, Run workflow, branche `main`, `rollback_sha` vide. Les lancements manuels depuis une autre branche sont refusés, retours arrière compris.

Chaque exécution se termine par le job `Verify production` : `https://marvinlerouge.dev/version.txt` doit renvoyer le SHA déployé, la page d'accueil doit répondre 200 avec l'en-tête `Content-Security-Policy`, un chemin inconnu doit répondre 404, et `www` doit répondre par une 301 vers le domaine principal, chemin conservé.

## Revenir en arrière

### Vers une version précédente de ce site

Chaque commit déployé a son image dans GHCR. Pour en remettre une en ligne :

1. Retrouver le SHA complet du dernier commit sain (`git log` sur `main`, ou les tags du package sur GitHub).
2. Actions, `Build & Deploy`, Run workflow, branche `main`, `rollback_sha` = ce SHA complet de 40 caractères.

Le build est sauté, et le VPS exécute l'image et le `docker-compose.prod.yml` de ce commit. Le merge suivant sur `main` redéploie la dernière version.

Les déploiements partagent une file d'attente et ne s'annulent jamais entre eux, mais GitHub n'y garde qu'une seule exécution en attente : un retour arrière encore en attente est remplacé si un merge sur `main` arrive derrière lui. Lancer le retour arrière une fois la file vide, et vérifier dans Actions qu'il s'est exécuté.

### En urgence, depuis le VPS

Utilise le fichier compose déjà présent sur le serveur. Pour prendre aussi le fichier compose de ce commit, comme le fait le workflow, le récupérer d'abord :

```bash
cd /home/mlr/marvinlerouge.dev/website/compose
curl -fsSL https://raw.githubusercontent.com/MarvinLeRouge/MarvinLeRouge.dev-Website/<sha-complet>/docker-compose.prod.yml -o docker-compose.prod.yml   # facultatif
IMAGE_TAG=<sha-complet> docker compose -f docker-compose.prod.yml up -d --wait
```

Un package privé demande d'abord un `docker login ghcr.io`, avec un jeton autorisé à lire les packages.

## Premier déploiement et bascule

Avant le déploiement de ce dépôt, le site était servi par le conteneur `homepage` (`/home/mlr/marvinlerouge.dev/homepage/`, Nginx servant un dossier monté, routeur Traefik `homepage` sur le même hôte).

Le routeur `website` a une priorité explicite (`priority=26`, un cran au-dessus de la priorité par défaut de la règle commune, qui est sa longueur) : il prend le trafic dès que son conteneur est en bonne santé, même si `homepage` tourne encore. La bascule se fait donc sans coupure :

1. Merge sur `main` : la CI, puis `Build & Deploy`, démarrent le nouveau conteneur. `Verify production` confirme que la nouvelle version répond.
2. Vérifier https://marvinlerouge.dev dans un navigateur.
3. Arrêter l'ancien conteneur, en gardant ses fichiers pour un éventuel retour arrière :
   ```bash
   docker compose -f /home/mlr/marvinlerouge.dev/homepage/docker-compose.yml down
   ```
4. Plus tard, une fois le nouveau site stable : archiver `/home/mlr/marvinlerouge.dev/homepage/`.

Retour à l'ancien site, tant que ses fichiers sont en place (`website` garde le trafic tant qu'il n'est pas arrêté) :

```bash
docker compose -f /home/mlr/marvinlerouge.dev/homepage/docker-compose.yml up -d
docker compose -f /home/mlr/marvinlerouge.dev/website/compose/docker-compose.prod.yml down
```

## Visibilité du package GHCR

Le premier push crée le package. Sa visibilité se règle dans ses paramètres sur GitHub (Packages, `marvinlerouge.dev-website`, Package settings). Le déploiement se connecte à GHCR avant le pull : il fonctionne que le package soit public ou privé.

## Diagnostic

Sur le VPS :

```bash
cd /home/mlr/marvinlerouge.dev/website/compose
docker compose -f docker-compose.prod.yml ps        # état et santé
docker compose -f docker-compose.prod.yml logs -f   # journaux d'accès et d'erreur Nginx
docker logs traefik 2>&1 | grep -i website          # erreurs de routage et de certificat
curl -sI https://marvinlerouge.dev/                 # code et en-têtes vus de l'extérieur
```

- `Verify production` échoue sur `www` : chercher le routeur `website-www` et son certificat dans `docker logs traefik`.
- `Verify production` lit un autre SHA, ou aucun, à `/version.txt` : Traefik envoie encore le trafic vers un autre conteneur. Vérifier que le conteneur `website` est en bonne santé (Traefik ignore les conteneurs dont le healthcheck démarre encore ou échoue) et que le routeur porte bien son label de priorité.
- Le déploiement échoue avec `ssh: unable to authenticate` : la clé de `DEPLOY_SSH_PRIVATE_KEY` n'est pas autorisée sur le VPS. Lancer le test `ssh -i ... 'echo ok'` ci-dessus, puis `ssh-copy-id` si besoin.
- `docker compose pull` échoue avec `denied` : le package est privé et la connexion a échoué, ou le tag d'image n'existe pas (`rollback_sha` erroné).
