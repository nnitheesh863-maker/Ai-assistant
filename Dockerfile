FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/
RUN npm install
COPY . .
RUN npm --prefix frontend run build
EXPOSE 5000
CMD ["npm", "run", "start:backend"]
