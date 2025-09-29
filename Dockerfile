# Dockerfile (prod)
FROM node:22-alpine

WORKDIR /usr/src/app

# Instala apenas prod deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o restante do código
COPY . .

# Exponha a porta da app
EXPOSE 3000

# Variável ambiente padrão 
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
