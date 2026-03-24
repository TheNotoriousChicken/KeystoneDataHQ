FROM node:18-alpine
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/. ./
RUN npm run build
RUN npm install -g http-server
EXPOSE 5173
CMD ["http-server", "dist", "-p", "5173"]
