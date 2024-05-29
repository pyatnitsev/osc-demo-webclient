# Используем официальный образ Node.js в качестве базового
FROM node:22-alpine3.19

ENV NODE_ENV=development

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json в контейнер
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы проекта в контейнер
COPY . .

# Собираем проект
RUN npm run build

# Публикуем порт 8094 для доступа к приложению
EXPOSE 8094

# Определяем команду для запуска приложения
CMD ["npm", "start"]