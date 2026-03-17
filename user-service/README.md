# 📋 Summary: Role-Based Access Control (RBAC) реализована

## ✅ Что было реализовано

### 1. **Правильная структура БД**
- ✅ Таблица `users` - пользователи системы
- ✅ Таблица `roles` - роли (ADMIN, INVESTOR, APPLICANT)
- ✅ Таблица `user_roles` - связь many-to-many
- ✅ Индексы для производительности
- ✅ Комментарии к колонкам и таблицам
- ✅ Представление `v_users_with_roles` для удобства

### 2. **Автоматические миграции БД (Flyway)**
- ✅ Файл миграции: `V1__Create_User_Service_Schema.sql`
- ✅ Автоматическое создание таблиц при запуске приложения
- ✅ Вставка начальных ролей
- ✅ Назначение ролей администратору
- ✅ Зависимость Flyway добавлена в pom.xml

### 3. **JWT с ролями**
- ✅ `JwtService.generateToken()` - генерирует токен с ролями
- ✅ `JwtService.extractRoles()` - извлекает роли из токена
- ✅ Токен содержит: userId, login, roles, exp
- ✅ Роли автоматически загружаются при генерации токена

### 4. **Spring Security + RBAC**
- ✅ `JwtAuthenticationFilter` - фильтр для проверки токена
- ✅ Роли из JWT добавляются в Authentication
- ✅ `SecurityConfig` поддерживает аннотации `@PreAuthorize`
- ✅ `@EnableMethodSecurity` для проверки ролей на методах

### 5. **Контроллеры**
- ✅ `AuthController` - регистрация и вход
  - `POST /auth/register` - создание пользователя
  - `POST /auth/login` - получение JWT токена с ролями
- ✅ `UserController` - управление пользователями
  - `GET /users` - доступен только ADMIN (`@PreAuthorize("hasRole('ADMIN')")`)

### 6. **Документация**
- ✅ `DATABASE_SCHEMA.md` - полное описание структуры БД
- ✅ `ER_DIAGRAM.md` - диаграммы и визуализация
- ✅ `TESTING_RBAC.md` - пошаговое руководство по тестированию
- ✅ `STARTUP.md` - инструкция по запуску и первой работе
- ✅ `application.properties` - конфигурация с комментариями

---

## 🏗️ Архитектура

### Поток авторизации

```
Пользователь
    ↓
1. POST /auth/register (создание)
    ↓
2. POST /auth/login (вход)
    ↓
UserService проверяет пароль
    ↓
JwtService генерирует JWT
    ↓ (загружает роли пользователя)
    ↓
JWT токен: {sub: "login", userId: "uuid", roles: ["ADMIN"], exp: ...}
    ↓
3. Клиент отправляет: GET /users + Authorization: Bearer JWT
    ↓
JwtAuthenticationFilter читает токен
    ↓
Извлекает роли: ["ADMIN"]
    ↓
Создаёт Authentication с GrantedAuthority: ["ROLE_ADMIN"]
    ↓
SecurityContextHolder.setAuthentication()
    ↓
4. @PreAuthorize("hasRole('ADMIN')") проверяет роли
    ↓
Если есть - 200 OK
Если нет - 403 Forbidden
```

### Таблицы и связи

```
USERS (1) -------- (N) USER_ROLES (N) -------- (1) ROLES

Пример:
- admin (user) ← связь → ADMIN (role)
- john (user) ← связь → INVESTOR (role)
- john (user) ← связь → APPLICANT (role)
```

---

## 📊 Структура файлов

```
user-service/
├── src/main/java/com/investment/userservice/
│   ├── config/
│   │   ├── SecurityConfig.java          ✅ @EnableMethodSecurity
│   │   └── SecurityBeansConfig.java     ✅ PasswordEncoder bean
│   ├── controller/
│   │   ├── AuthController.java          ✅ /auth/register, /auth/login
│   │   └── UserController.java          ✅ /users (only ADMIN)
│   ├── service/
│   │   └── UserService.java             ✅ createUser, findByLogin
│   ├── repository/
│   │   ├── UserRepository.java          ✅ findByLogin
│   │   ├── RoleRepository.java          ✅ findByName
│   │   └── UserRoleRepository.java      ✅ findByUserId
│   ├── entity/
│   │   ├── User.java                    ✅ @Entity
│   │   ├── Role.java                    ✅ @Entity
│   │   └── UserRole.java                ✅ @Entity (many-to-many)
│   ├── dto/
│   │   ├── LoginRequest.java            ✅
│   │   └── RegisterRequest.java         ✅
│   ├── security/
│   │   ├── JwtService.java              ✅ generateToken, extractRoles
│   │   └── JwtAuthenticationFilter.java ✅ читает токен, устанавливает роли
│   └── UserServiceApplication.java      ✅ @SpringBootApplication
│
├── src/main/resources/
│   ├── application.properties            ✅ Flyway конфигурация
│   └── db/migration/
│       └── V1__Create_User_Service_Schema.sql  ✅ автоматическая миграция
│
├── pom.xml                               ✅ Flyway, JJWT зависимости
│
└── Документация/
    ├── DATABASE_SCHEMA.md                ✅ Описание БД
    ├── ER_DIAGRAM.md                     ✅ Визуализация
    ├── TESTING_RBAC.md                   ✅ Тестирование
    └── STARTUP.md                        ✅ Запуск приложения
```

---

## 🔐 Безопасность

### ✅ Что защищено

1. **Пароли**
   - Хешируются через bcrypt
   - Никогда не передаются в ответе API
   - Проверяются через passwordEncoder.matches()

2. **JWT Токены**
   - Подписаны секретным ключом
   - Содержат сроки действия (exp)
   - Проверяются на каждом запросе
   - Содержат роли для RBAC

3. **Доступ по ролям**
   - @PreAuthorize("hasRole('ADMIN')") на контроллерах
   - Spring Security блокирует неавторизованные запросы
   - 403 Forbidden если роли недостаточно

4. **CSRF отключена**
   - Для REST API это нормально
   - Используются токены вместо CSRF tokens

---

## 🧪 Тестирование

### Полный сценарий RBAC

```bash
# 1. Регистрация
POST /auth/register
{
  "login": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
→ 201 Created

# 2. Логин (БЕЗ роли)
POST /auth/login
{
  "login": "testuser",
  "password": "password123"
}
→ 200 OK с JWT (roles: [])

# 3. Попытка доступа
GET /users
Authorization: Bearer JWT
→ 403 Forbidden

# 4. Добавить роль в БД (SQL)
INSERT INTO user_service.user_roles (user_id, role_id)
SELECT ... WHERE login = 'testuser' AND name = 'ADMIN'

# 5. Повторный логин
POST /auth/login
{
  "login": "testuser",
  "password": "password123"
}
→ 200 OK с JWT (roles: ["ADMIN"])

# 6. Повторный доступ
GET /users
Authorization: Bearer NEW_JWT
→ 200 OK с списком пользователей ✅
```

**Полная инструкция в файле: TESTING_RBAC.md**

---

## 📝 Шаги для начала работы

### 1. Создать БД
```sql
CREATE DATABASE investment_system;
```

### 2. Запустить приложение
```bash
./mvnw spring-boot:run
```

### 3. Flyway автоматически
- Создаст таблицы
- Вставит роли
- Настроит индексы

### 4. Протестировать
Смотрите **TESTING_RBAC.md**

---

## 🚀 Возможности расширения

### Добавить новую роль
```sql
INSERT INTO user_service.roles (name, description)
VALUES ('MANAGER', 'Менеджер проектов');
```
✅ Система автоматически будет её использовать

### Добавить новый endpoint с ограничением
```java
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@DeleteMapping("/users/{id}")
public void deleteUser(@PathVariable UUID id) {
    // ...
}
```

### Добавить новые поля в User
```sql
ALTER TABLE user_service.users ADD COLUMN first_name VARCHAR(100);
```

---

## 📚 Дополнительная информация

### Что дальше?

После User Service готовы развивать:

1. **NSI Service** - справочники (направления, характеристики)
2. **Project Service** - управление проектами
3. **Gateway** - единая точка входа для фронтенда
4. **Analytics Service** - аналитика (на C#)

### Интеграция с другими сервисами

User Service может быть вызван из других сервисов через:
- REST HTTP запросы
- gRPC (если внедрить proto)

Пример для Project Service:
```java
// Project Service получает userId и роли из JWT
String userId = SecurityContextHolder.getContext()
    .getAuthentication()
    .getPrincipal();
```

---

## ✨ Итог

### ✅ RBAC полностью реализована

- Пользователи хранятся в БД ✅
- Роли хранятся в БД ✅
- JWT содержит роли ✅
- Spring Security проверяет роли ✅
- Доступ контролируется по ролям ✅
- Всё задокументировано ✅
- Готово к расширению ✅

### Начните с:
1. **STARTUP.md** - запуск приложения
2. **TESTING_RBAC.md** - тестирование
3. **DATABASE_SCHEMA.md** - понимание БД

---

**🎉 Система готова к использованию и разработке остальных сервисов!**

Если возникли вопросы - обратитесь к документации или создайте issue. 💪

