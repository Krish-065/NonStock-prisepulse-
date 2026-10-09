FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev --no-audit --no-fund

COPY src ./src

ENV NODE_ENV=production
ENV PORT=8200
ENV BIND_HOST=0.0.0.0

EXPOSE 8200

CMD ["node", "src/index.js"]
