[🇫🇷 Version française](operations.fr.md) | 🇬🇧 English version

---

# Operations

How the site is built, deployed, checked and rolled back.

## Overview

```
pull request ──> CI ──> merge on main ──> CI on main ──> Build & Deploy
                                                         ├─ build: image pushed to GHCR (tags latest and <sha>)
                                                         ├─ deploy: SSH to the VPS, compose pull and up
                                                         └─ verify: https://marvinlerouge.dev serves the new release
```

- Image: `ghcr.io/marvinlerouge/marvinlerouge.dev-website`, tagged `latest` and with the full commit SHA.
- The VPS always runs an image pinned to a commit SHA, never `latest`. Each image serves its commit SHA at `/version.txt`.
- Production stack: `docker-compose.prod.yml`, compose project `website`, in `/home/mlr/marvinlerouge.dev/website/compose` on the VPS.
- Routing: the shared Traefik on the VPS (network `traefik-public`, entrypoint `websecure`, certificate resolver `letsencrypt`).

## Secrets

Repository secrets (Settings, Secrets and variables, Actions):

| Secret                   | Value                                                                     |
| ------------------------ | ------------------------------------------------------------------------- |
| `DEPLOY_SSH_HOST`        | VPS host name or IP, same value as in the other portfolio repositories    |
| `DEPLOY_SSH_USER`        | SSH user on the VPS, same value as in the other portfolio repositories    |
| `DEPLOY_SSH_PRIVATE_KEY` | Private deploy key; its public key is authorized on the VPS for that user |

The private key can be set without printing it:

```bash
gh secret set DEPLOY_SSH_PRIVATE_KEY --repo MarvinLeRouge/MarvinLeRouge.dev-Website < ~/.ssh/id_ed25519_github_actions_deploy
```

Pushing and pulling the image uses the workflow's own `GITHUB_TOKEN`: no registry secret is needed.

## Deploying

Merging a pull request into `main` is enough: once the `CI` workflow succeeds on `main`, `Build & Deploy` starts on the same commit.

Safeguards:

- Only CI runs triggered by a push to this repository's `main` deploy: a pull request, even from a fork's `main` branch, never does.
- If `main` has moved on by the time a run starts, that run skips the deploy: the run of the newer commit deploys it.
- The deploy waits for the container to be healthy (`docker compose up --wait`) and fails otherwise.

To redeploy the current `main` by hand: Actions, `Build & Deploy`, Run workflow, branch `main`, `rollback_sha` empty. Manual runs from any other branch are refused, rollbacks included.

Each run ends with the `Verify production` job: `https://marvinlerouge.dev/version.txt` must return the deployed SHA, the homepage must answer 200 with the `Content-Security-Policy` header, and an unknown path must answer 404.

## Rolling back

### To a previous version of this site

Every deployed commit has its image in GHCR. To put one back online:

1. Find the full SHA of the last good commit (`git log` on `main`, or the tags of the package on GitHub).
2. Actions, `Build & Deploy`, Run workflow, branch `main`, `rollback_sha` = that full 40-character SHA.

The build is skipped, and the VPS runs the image and the `docker-compose.prod.yml` of that commit. The next merge on `main` deploys the latest version again.

Deploys share one queue and never cancel each other, but GitHub keeps only one pending run in it: a rollback still waiting is replaced if a merge on `main` arrives behind it. Start the rollback once the queue is empty, and check in Actions that it ran.

### Emergency, from the VPS

Uses the compose file already on the server. To also take the compose file of that commit, as the workflow does, fetch it first:

```bash
cd /home/mlr/marvinlerouge.dev/website/compose
curl -fsSL https://raw.githubusercontent.com/MarvinLeRouge/MarvinLeRouge.dev-Website/<full-sha>/docker-compose.prod.yml -o docker-compose.prod.yml   # optional
IMAGE_TAG=<full-sha> docker compose -f docker-compose.prod.yml up -d --wait
```

A private package needs a `docker login ghcr.io` first, with a token allowed to read packages.

## First deployment and cutover

Before this repository was deployed, the site was the `homepage` container (`/home/mlr/marvinlerouge.dev/homepage/`, Nginx serving a bind-mounted folder, Traefik router `homepage` on the same host).

The `website` router has an explicit priority (`priority=26`, one above the default priority of the shared rule, which is its length), so it takes the traffic as soon as its container is healthy, even while `homepage` is still running. The cutover therefore has no downtime:

1. Merge on `main`: CI, then `Build & Deploy`, start the new container. `Verify production` confirms that the new release answers.
2. Check https://marvinlerouge.dev in a browser.
3. Stop the legacy container, keeping its files for a rollback:
   ```bash
   docker compose -f /home/mlr/marvinlerouge.dev/homepage/docker-compose.yml down
   ```
4. Later, once the new site has run without issue: archive `/home/mlr/marvinlerouge.dev/homepage/`.

Rollback to the legacy site, as long as its files are in place (`website` keeps the traffic until it is stopped):

```bash
docker compose -f /home/mlr/marvinlerouge.dev/homepage/docker-compose.yml up -d
docker compose -f /home/mlr/marvinlerouge.dev/website/compose/docker-compose.prod.yml down
```

## GHCR package visibility

The first push creates the package. Its visibility is set in the package settings on GitHub (Packages, `marvinlerouge.dev-website`, Package settings). The deploy logs in to GHCR before pulling, so it works whether the package is public or private.

## Troubleshooting

On the VPS:

```bash
cd /home/mlr/marvinlerouge.dev/website/compose
docker compose -f docker-compose.prod.yml ps        # status and health
docker compose -f docker-compose.prod.yml logs -f   # Nginx access and error logs
docker logs traefik 2>&1 | grep -i website          # routing and certificate errors
curl -sI https://marvinlerouge.dev/                 # status and headers as seen from outside
```

- `Verify production` reports another SHA, or none, at `/version.txt`: Traefik still sends the traffic to another container. Check that the `website` container is healthy (Traefik ignores containers whose healthcheck is still starting or failing) and that the router has its priority label.
- `docker compose pull` fails with `denied`: the package is private and the login failed, or the image tag does not exist (wrong `rollback_sha`).
