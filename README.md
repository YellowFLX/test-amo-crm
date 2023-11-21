# Тестовыое задание

Этот репозиторий содержит решение для тестового задания по интеграции с `amoCRM`, реализованное с использованием фреймворка `NestJS`.

### Запущенный сервер 
https://fcb6-77-236-80-6.ngrok-free.app/

### Данные от CRM

Ссылка для входа: https://yellowf1.amocrm.ru/
```
Логин: yellowf1@ya.ru
Пароль: KUXEnhew
```

## Установка

```bash
$ npm install
```

## Запуск приложения


```bash
# deploy database
$ npm run db:deploy

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Примеры запросов

```
/auth/?code={code} - генерация access_token и refresh_token

/amo?name=Misha&phone=79876543222&email=email2@mail.ru - создание сделки в amoCRM для контакта с указанными параметрами
```

