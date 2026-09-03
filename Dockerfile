FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S cdn && \
    adduser -u 1001 -S cdn -G cdn

RUN chown -R cdn:cdn /app

USER cdn

EXPOSE 8080

CMD ["node", "dist/server.js"]