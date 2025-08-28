# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
ENV PORT=4000
EXPOSE 4000
CMD ["npm", "run", "start"]

