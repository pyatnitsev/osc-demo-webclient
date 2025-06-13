# Базовый слой: билдим проект
FROM node:22-alpine3.19 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Добавляем build-time аргументы для переменных
ARG WS_HOST=localhost
ARG WS_PORT=8080
ARG RESET_TIME=0
ARG LOGO_PRESS_TIME=2000

# Пробрасываем их как ENV, чтобы npm run build их увидел
ENV WS_HOST=${WS_HOST}
ENV WS_PORT=${WS_PORT}
ENV RESET_TIME=${RESET_TIME}
ENV LOGO_PRESS_TIME=${LOGO_PRESS_TIME}

RUN echo "WS_PORT is $WS_PORT"

COPY . .
RUN npm run build

# Продакшен-слой: только статика
FROM node:22-alpine3.19 AS prod

WORKDIR /app
RUN npm install -g http-server

COPY --from=build /app/dist /app/dist
EXPOSE 8094
CMD ["http-server", "dist", "-p", "8094", "--cors"]

# Дев-слой (опционально, для локальной разработки)
FROM node:22-alpine3.19 AS dev

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8094
CMD ["npm", "start"]
