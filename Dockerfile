# ─── base ────────────────────────────────────────────────────────────────────
FROM node:25-alpine AS base
WORKDIR /app

# ─── dev: Astro dev server with hot reload ───────────────────────────────────
FROM base AS dev
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ─── build: static site into dist/ ───────────────────────────────────────────
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── production: Nginx serving the static site ───────────────────────────────
FROM nginx:alpine AS production
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --retries=3 --start-period=10s --start-interval=1s CMD wget -q --spider http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
