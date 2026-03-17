# 🚀 User Service - Инструкция по запуску

## Подготовка

### Требования
- Java 17+
- Maven 3.6+
- PostgreSQL 12+

### Переменные окружения или конфигурация БД

Отредактируйте `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/investment_system
spring.datasource.username=postgres
spring.datasource.password=admin
```

---

## 1️⃣ Первый запуск

### Создать БД (если не существует)

```sql
CREATE DATABASE investment_system;
```

### Запустить приложение

```bash
./mvnw spring-boot:run
```

**Flyway автоматически:**
- Создаст схему `user_service`
- Создаст таблицы (users, roles, user_roles)
- Вставит начальные роли (ADMIN, INVESTOR, APPLICANT)
- Назначит роль ADMIN пользователю 'admin' (если он существует)

---

## 2️⃣ Проверить, что всё создалось

### Подключитесь к PostgreSQL:

```bash
psql -U postgres -d investment_system
```

### Проверьте таблицы:

```sql
\dt user_service.*
```

Должны быть:
```
user_service.users
user_service.roles
user_service.user_roles
```

### Проверьте начальные роли:

```sql
SELECT * FROM user_service.roles;
```

Результат:
```
id                                   | name      | created_at
550e8400-e29b-41d4-a716-446655440001 | ADMIN     | 2026-03-17...
550e8400-e29b-41d4-a716-446655440002 | INVESTOR  | 2026-03-17...
550e8400-e29b-41d4-a716-446655440003 | APPLICANT | 2026-03-17...
```

---

## 3️⃣ Работа с пользователями и ролями

### Назначить роль пользователю

```sql
INSERT INTO user_service.user_roles (id, user_id, role_id)
SELECT
  gen_random_uuid(),
  (SELECT id FROM user_service.users WHERE login = 'username'),
  (SELECT id FROM user_service.roles WHERE name = 'ADMIN')
ON CONFLICT DO NOTHING;
```

### Просмотреть пользователей с ролями

```sql
SELECT * FROM user_service.v_users_with_roles;
```

### Удалить роль у пользователя

```sql
DELETE FROM user_service.user_roles
WHERE user_id = (SELECT id FROM user_service.users WHERE login = 'username')
AND role_id = (SELECT id FROM user_service.roles WHERE name = 'ADMIN');
```

---

## 4️⃣ Тестирование RBAC

Смотрите подробную инструкцию в файле: **TESTING_RBAC.md**

Краткий сценарий:

1. **Регистрация:**
   ```http
   POST /auth/register
   {"login": "testuser", "password": "pass", "email": "test@example.com"}
   ```

2. **Вход (без роли):**
   ```http
   POST /auth/login
   {"login": "testuser", "password": "pass"}
   ```
   Получаете JWT с `"roles": []`

3. **Попытка доступа:**
   ```http
   GET /users
   Authorization: Bearer <TOKEN>
   ```
   Результат: **403 Forbidden**

4. **Назначьте роль ADMIN в БД:**
   ```sql
   INSERT INTO user_service.user_roles ...
   ```

5. **Повторный вход:**
   ```http
   POST /auth/login
   {"login": "testuser", "password": "pass"}
   ```
   Получаете JWT с `"roles": ["ADMIN"]`

6. **Повторная попытка доступа:**
   ```http
   GET /users
   Authorization: Bearer <NEW_TOKEN>
   ```
   Результат: **200 OK** с списком пользователей

---

## 5️⃣ Чистая переинициализация БД

### Если нужно начать заново:

```sql
-- Удалить схему с каскадом
DROP SCHEMA IF EXISTS user_service CASCADE;

-- Удалить историю миграций (Flyway)
DELETE FROM public.flyway_schema_history WHERE success = true;
```

Затем перезапустите приложение:
```bash
./mvnw spring-boot:run
```

Flyway автоматически создаст всё заново.

---

## 6️⃣ Сборка и запуск JAR

### Собрать проект:

```bash
./mvnw clean package
```

### Запустить JAR:

```bash
java -jar target/user-service-0.0.1-SNAPSHOT.jar
```

---

## 7️⃣ Структура проекта

```
user-service/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/investment/userservice/
│   │   │       ├── config/          # SecurityConfig, SecurityBeansConfig
│   │   │       ├── controller/      # AuthController, UserController
│   │   │       ├── service/         # UserService
│   │   │       ├── repository/      # UserRepository, RoleRepository, UserRoleRepository
│   │   │       ├── entity/          # User, Role, UserRole
│   │   │       ├── dto/             # LoginRequest, RegisterRequest
│   │   │       ├── security/        # JwtService, JwtAuthenticationFilter
│   │   │       └── UserServiceApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/migration/
│   │           └── V1__Create_User_Service_Schema.sql
│   └── test/
│       └── java/...
├── pom.xml
├── DATABASE_SCHEMA.md    # Структура БД
├── TESTING_RBAC.md       # Инструкция по тестированию
└── HELP.md
```

---

## 8️⃣ Основные endpoints

### Авторизация (публичные)
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход

### Пользователи (требует токен)
- `GET /users` - Список всех пользователей (только ADMIN)

---

## 9️⃣ Что дальше?

После успешного запуска:

1. ✅ **RBAC работает** - роли хранятся в БД и проверяются через JWT
2. ✅ **Миграции автоматические** - используется Flyway
3. ✅ **Легко расширяется** - добавьте новые роли, endpoints, валидацию

Готовы разрабатывать остальные сервисы:
- NSI Service
- Project Service
- Gateway

---

## 🔧 Решение проблем

### Ошибка: "ERROR: relation "user_service.users" does not exist"

**Решение:**
```bash
./mvnw flyway:clean
./mvnw flyway:migrate
```

### Ошибка: "database ... does not exist"

Создайте БД:
```sql
CREATE DATABASE investment_system;
```

### Ошибка подключения к PostgreSQL

Проверьте:
- PostgreSQL запущен
- Параметры подключения в application.properties верны
- Username/password верны

### Flyway не запускается

Попробуйте в application.properties:
```properties
spring.flyway.baseline-on-migrate=true
spring.flyway.validate-on-migrate=true
```

---

**Всё готово к работе!** 🚀

Если возникли вопросы, смотрите DATABASE_SCHEMA.md и TESTING_RBAC.md.
