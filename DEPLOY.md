# PricePulse Deployment

## Requirements

- Docker Engine
- Docker Compose plugin
- Sufficient disk space for PostgreSQL data

## Environment files

Create local environment files from the templates:

    cp .env.example .env
    cp backend/.env.example backend/.env

Edit the root `.env` and set a strong, unique `POSTGRES_PASSWORD`.
For this Compose configuration, use a long random password containing
only letters, digits, hyphens, and underscores so it is safe inside the
constructed PostgreSQL connection URL. Do not reuse a production password.

The optional `VITE_*` settings in the root `.env` are frontend build-time
configuration. Only put public browser configuration there; never put
private API credentials or server-side secrets in a `VITE_*` variable.
Do not commit `.env` or `backend/.env`.

Configure `backend/.env` with the application secrets and settings
required by the features you use, including JWT and email settings.
Set `FRONTEND_URL` to the intended public website URL.

The Compose configuration supplies `DATABASE_URL`, `PORT`,
`BIND_HOST`, and `DB_SSL` to the backend container. The PostgreSQL
credentials in the root `.env` must match the intended database.

## Validate the configuration

Run this from the directory containing `compose.yml`:

    docker compose config --quiet

This validates the Compose configuration without starting services.

## Build and start a new installation

Only use these commands for a deliberately prepared installation
after checking its database directory, credentials, and host port:

    docker compose build
    docker compose up -d
    docker compose ps

Inspect service logs if a container does not become healthy:

    docker compose logs --tail=100 db backend frontend

## Production precautions

- Never run `docker compose down -v` on a deployment with data to preserve.
- This Compose file uses `/srv/stocksoperator-college/postgres-data` for PostgreSQL persistence.
- The frontend binds to a loopback host address, not every network interface.
- Check reverse-proxy and Cloudflare Tunnel settings before changing ports, DNS, or tunnel routes.
- Back up the database before upgrades or migrations.
- Never replace existing production environment files with templates.
