FROM node:22-slim AS builder

# Instalar dependencias del sistema para Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

RUN npx prisma generate

COPY . .

RUN npm run build

# ─── Imagen de producción ─────────────────────────────────────────────────────
FROM node:22-slim AS runner

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev

RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "start:migrate"]
