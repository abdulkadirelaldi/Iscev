FROM node:20-alpine AS base
WORKDIR /app

# Bağımlılıkları önce kopyala (cache optimizasyonu)
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Uploads dizini volume ile mount edilecek
RUN mkdir -p uploads/images uploads/pdfs uploads/videos logs

EXPOSE 5001

CMD ["node", "server.js"]
