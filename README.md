# Forum backend

Express + Prisma 8 + PostgreSQL. Структура: domain / repositories / services / transport.

## Запуск

1. `cd backend && npm install`
2. Скопіювати `.env.example` в `.env` і заповнити змінні
3. `npm run contract:emit` (створює `contract.json` і `contract.d.ts`)
4. `npm run db:init`
5. `npm run dev` (сервер на http://localhost:3000)

## Маршрути

| Метод | URL | Опис |
| --- | --- | --- |
| POST | /auth/register | `{ username, email, password }` |
| POST | /auth/login | `{ email, password }`, ставить cookie `accessToken` і `refreshToken` |
| POST | /auth/refresh | міняє refresh-токен на новий, старий більше не працює (401) |
| POST | /auth/logout | видаляє лише поточну refresh-сесію, чистить обидві cookie |
| GET | /auth/me | потрібен `accessToken` |
| GET | /posts | список постів |
| POST | /posts | `{ title, content }`, потрібен `accessToken` |

## Перевірка в Postman (два входи)

Postman зберігає cookie окремо для кожного Cookie Jar, тому другий клієнт можна зімітувати так:
перший клієнт: звичайна вкладка Postman, другий клієнт: Postman Agent / другий workspace,
або просто вручну підставити `refreshToken` з другого входу в заголовок `Cookie`.

1. Клієнт A: `POST /auth/login` → зберегти cookie A
2. Клієнт B: `POST /auth/login` (той самий користувач) → зберегти cookie B
3. Клієнт A: `POST /auth/logout` → 200, cookie очищені
4. Клієнт A: `POST /auth/refresh` → 401
5. Клієнт B: `POST /auth/refresh` → 200 (сесія B жива)
6. Повторно відправити в `/auth/refresh` старий refresh-токен B (до оновлення) → 401
