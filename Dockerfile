FROM node:20-alpine AS backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend ./
EXPOSE 5000
CMD ["npm", "run", "dev"]

FROM node:20-alpine AS frontend
WORKDIR /app
RUN npm install -g live-server
COPY frontend ./frontend
COPY docker/frontend-entrypoint.sh /usr/local/bin/frontend-entrypoint.sh
RUN chmod +x /usr/local/bin/frontend-entrypoint.sh
EXPOSE 5500
CMD ["sh", "/usr/local/bin/frontend-entrypoint.sh"]
