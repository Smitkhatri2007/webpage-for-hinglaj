# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "--port", "5173"]

