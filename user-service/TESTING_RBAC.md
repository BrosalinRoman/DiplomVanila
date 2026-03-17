## Полное руководство по тестированию RBAC в Postman

После выполнения миграций БД, вы можете полностью протестировать RBAC.

---

### Шаг 1️⃣: Убедиться, что миграция выполнена

**Проверьте в PostgreSQL, что таблицы созданы:**

```sql
-- Подключитесь к БД investment_system и схеме user_service
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'user_service';
```

**Результат должен содержать:**
- users
- roles
- user_roles
- flyway_schema_history

**Проверьте начальные роли:**

```sql
SELECT id, name FROM user_service.roles;
```

**Результат:**
```
id                                   | name
550e8400-e29b-41d4-a716-446655440001 | ADMIN
550e8400-e29b-41d4-a716-446655440002 | INVESTOR
550e8400-e29b-41d4-a716-446655440003 | APPLICANT
```

---

### Шаг 2️⃣: Запустить приложение

```bash
./mvnw spring-boot:run
```

или в Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

---

### Шаг 3️⃣: Регистрация нового пользователя

**Запрос:**
```http
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "login": "testuser",
  "password": "password123",
  "email": "testuser@example.com"
}
```

**Ответ (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "login": "testuser",
  "passwordHash": "$2a$10$Hrm7TrKkJuE6p142CfavfOwKmOfcn60UuKOnxnXsSiTWIbgqv7D7y",
  "email": "testuser@example.com",
  "isActive": true,
  "createdAt": "2026-03-17T15:30:00"
}
```

---

### Шаг 4️⃣: Вход БЕЗ роли и получить JWT токен

**Запрос:**
```http
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "login": "testuser",
  "password": "password123"
}
```

**Ответ (200 OK):**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInVzZXJJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwNCIsInJvbGVzIjpbXSwiaWF0IjoxNzEwNzUwNjAwLCJleHAiOjE3MTA4MzcwMDB9.abc123...
```

**Декодируйте токен (используйте jwt.io):**
```json
{
  "sub": "testuser",
  "userId": "550e8400-e29b-41d4-a716-446655440004",
  "roles": [],
  "iat": 1710750600,
  "exp": 1710837000
}
```

Обратите внимание: `"roles": []` — пусто, потому что мы еще не назначили роль пользователю.

---

### Шаг 5️⃣: Попытка доступа к /users БЕЗ роли

**Запрос:**
```http
GET http://localhost:8080/users
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInVzZXJJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwNCIsInJvbGVzIjpbXSwiaWF0IjoxNzEwNzUwNjAwLCJleHAiOjE3MTA4MzcwMDB9.abc123...
```

**Ответ (403 Forbidden):**
```json
{
  "error": "Access Denied"
}
```

✅ **Правильно!** Доступ запрещён, потому что нет роли ADMIN.

---

### Шаг 6️⃣: Назначить пользователю роль ADMIN через БД

**В PostgreSQL выполните:**

```sql
-- Вариант 1: Если вы знаете ID пользователя
INSERT INTO user_service.user_roles (id, user_id, role_id)
VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440004',  -- ID testuser
  (SELECT id FROM user_service.roles WHERE name = 'ADMIN')
)
ON CONFLICT DO NOTHING;

-- Или Вариант 2: По логину (проще)
INSERT INTO user_service.user_roles (id, user_id, role_id)
SELECT
  gen_random_uuid(),
  (SELECT id FROM user_service.users WHERE login = 'testuser'),
  (SELECT id FROM user_service.roles WHERE name = 'ADMIN')
ON CONFLICT DO NOTHING;
```

**Проверьте, что роль назначена:**
```sql
SELECT u.login, r.name
FROM user_service.users u
JOIN user_service.user_roles ur ON u.id = ur.user_id
JOIN user_service.roles r ON ur.role_id = r.id
WHERE u.login = 'testuser';
```

**Результат:**
```
login    | name
---------|------
testuser | ADMIN
```

---

### Шаг 7️⃣: Повторный вход для получения нового JWT токена с ролью

**Запрос:**
```http
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "login": "testuser",
  "password": "password123"
}
```

**Ответ (200 OK):**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInVzZXJJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwNCIsInJvbGVzIjpbIkFETUluIl0sImlhdCI6MTcxMDc1MDYwMCwiZXhwIjoxNzEwODM3MDAwfQ.xyz789...
```

**Декодируйте токен:**
```json
{
  "sub": "testuser",
  "userId": "550e8400-e29b-41d4-a716-446655440004",
  "roles": ["ADMIN"],
  "iat": 1710750600,
  "exp": 1710837000
}
```

✅ **Отлично!** Теперь `"roles": ["ADMIN"]` — роль в токене!

---

### Шаг 8️⃣: Запрос к /users С ролью ADMIN

**Запрос:**
```http
GET http://localhost:8080/users
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInVzZXJJZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwNCIsInJvbGVzIjpbIkFETUluIl0sImlhdCI6MTcxMDc1MDYwMCwiZXhwIjoxNzEwODM3MDAwfQ.xyz789...
```

**Ответ (200 OK):**
```json
[
  {
    "id": "3e91d862-1528-494f-b78b-1ee04da9bf04",
    "login": "admin",
    "passwordHash": "$2a$10$Hrm7TrKkJuE6p142CfavfOwKmOfcn60UuKOnxnXsSiTWIbgqv7D7y",
    "email": "admin@mail.com",
    "isActive": true,
    "createdAt": "2026-03-15T20:57:30"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "login": "testuser",
    "passwordHash": "$2a$10$Hrm7TrKkJuE6p142CfavfOwKmOfcn60UuKOnxnXsSiTWIbgqv7D7y",
    "email": "testuser@example.com",
    "isActive": true,
    "createdAt": "2026-03-17T15:30:00"
  }
]
```

✅ **Успех!** Доступ разрешён, потому что у пользователя есть роль ADMIN!

---

### Шаг 9️⃣: Тестирование других ролей

#### Назначить роль INVESTOR:

```sql
INSERT INTO user_service.user_roles (id, user_id, role_id)
SELECT
  gen_random_uuid(),
  (SELECT id FROM user_service.users WHERE login = 'testuser'),
  (SELECT id FROM user_service.roles WHERE name = 'INVESTOR')
ON CONFLICT DO NOTHING;
```

Теперь пользователь будет иметь обе роли: ADMIN и INVESTOR.

**Повторный логин покажет:**
```json
{
  "roles": ["ADMIN", "INVESTOR"]
}
```

---

## Полный сценарий с curl (Windows PowerShell)

```powershell
# 1. Регистрация
$registerResponse = curl.exe -X POST http://localhost:8080/auth/register `
  -H "Content-Type: application/json" `
  -d '{"login":"testuser","password":"password123","email":"testuser@example.com"}'

# 2. Вход
$loginResponse = curl.exe -X POST http://localhost:8080/auth/login `
  -H "Content-Type: application/json" `
  -d '{"login":"testuser","password":"password123"}'

$token = $loginResponse

# 3. Попытка доступа БЕЗ роли
curl.exe -X GET http://localhost:8080/users `
  -H "Authorization: Bearer $token"

# Результат: 403 Forbidden

# 4. Назначить роль в БД (в PostgreSQL):
# INSERT INTO user_service.user_roles...

# 5. Повторный вход
$newLoginResponse = curl.exe -X POST http://localhost:8080/auth/login `
  -H "Content-Type: application/json" `
  -d '{"login":"testuser","password":"password123"}'

$newToken = $newLoginResponse

# 6. Доступ С ролью
curl.exe -X GET http://localhost:8080/users `
  -H "Authorization: Bearer $newToken"

# Результат: 200 OK - список пользователей
```

---

## Что вы проверили ✅

1. **Регистрация пользователя** — пользователь создан
2. **JWT без ролей** — токен содержит пустой список ролей
3. **Доступ без роли** — Spring Security блокирует запрос (403)
4. **Назначение роли** — роль добавлена в БД
5. **JWT с ролями** — новый токен содержит роль ADMIN
6. **Доступ с ролью** — Spring Security разрешает запрос (200)
7. **RBAC работает!** — система проверяет роли и контролирует доступ

---

## Дополнительные тесты

### Проверить, что APPLICANT не может доступить /users

```sql
-- Назначить роль APPLICANT вместо ADMIN
UPDATE user_service.user_roles
SET role_id = (SELECT id FROM user_service.roles WHERE name = 'APPLICANT')
WHERE user_id = (SELECT id FROM user_service.users WHERE login = 'testuser');
```

Повторный логин → доступ к /users будет 403 Forbidden

### Проверить несколько ролей

```sql
-- У пользователя будут обе роли
INSERT INTO user_service.user_roles (id, user_id, role_id)
SELECT
  gen_random_uuid(),
  (SELECT id FROM user_service.users WHERE login = 'testuser'),
  (SELECT id FROM user_service.roles WHERE name = 'INVESTOR')
ON CONFLICT DO NOTHING;
```

JWT токен: `"roles": ["ADMIN", "INVESTOR"]`

---

Всё готово для полного тестирования RBAC! 🚀
