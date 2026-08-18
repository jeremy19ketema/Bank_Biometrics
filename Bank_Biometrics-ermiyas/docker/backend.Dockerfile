FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --workspace=backend
COPY backend/ ./backend/
RUN npm run build --workspace=backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY backend/package*.json ./backend/
RUN npm ci --omit=dev --workspace=backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
RUN npx prisma generate --schema=./backend/prisma/schema.prisma

EXPOSE 5000
CMD ["node", "backend/dist/server.js"]
