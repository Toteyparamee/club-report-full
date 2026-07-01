FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src ./src
RUN npx prisma generate
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node src/index.js"]
