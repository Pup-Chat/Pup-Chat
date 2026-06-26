# 🐾 PupChat

Виртуальный чат с пупсами, которых можно одевать и перемещать по комнате.

## О проекте

PupChat — это современная реинкарнация флеш-чатов эпохи 2010-х. Одевай пупса, общайся в реальном времени, зарабатывай монеты и кастомизируй комнату.

## Возможности

- 💬 Чат в реальном времени
- 👕 Кастомизация пупсов
- 🎮 Мини-игры и заработок монет
- 🐾 Компаньоны (питомцы)
- 🏠 Кастомизация комнат
- 🎁 Система подарков
- 🏆 Достижения

## Технологии

- **Frontend**: HTML5, CSS3, JavaScript (Canvas API)
- **Backend**: Firebase (Auth, Firestore, Hosting)
- **Деплой**: Firebase Hosting

## Установка

1. Создай проект в Firebase Console: https://console.firebase.google.com/
2. Включи Authentication (Email/Password)
3. Создай Firestore Database
4. Скопируй конфигурацию Firebase в `public/scripts/firebase-config.js`
5. Установи Firebase CLI: `npm install -g firebase-tools`
6. Залогинься: `firebase login`
7. Инициализируй проект: `firebase init`
8. Задеплой: `firebase deploy`

## Локальная разработка

```bash
firebase serve
