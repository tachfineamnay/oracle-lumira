# ================= Stage 1: Build =================
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ================= Stage 2: Production =================
FROM node:18-alpine
WORKDIR /app

# Installer su-exec pour le changement d'utilisateur sécurisé
RUN apk add --no-cache su-exec

# Les variables d'environnement sensibles doivent être configurées
# via Coolify ou un gestionnaire de secrets, PAS dans le Dockerfile

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY entrypoint.sh /entrypoint.sh

# Rendre le script exécutable
RUN chmod +x /entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/entrypoint.sh"]