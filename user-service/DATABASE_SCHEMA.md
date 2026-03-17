# User Service - Структура Базы Данных

## Обзор

User Service использует PostgreSQL с следующей структурой:
- **Схема:** `user_service`
- **Управление миграциями:** Flyway
- **ORM:** Hibernate/JPA

---

## Таблицы

### 1. `users` - Пользователи системы

| Колонка | Тип | Ограничения | Описание |
|---------|-----|------------|---------|
| id | UUID | PRIMARY KEY | Уникальный идентификатор пользователя |
| login | VARCHAR(100) | NOT NULL, UNIQUE | Логин для входа |
| password_hash | VARCHAR(255) | NOT NULL | Хешированный пароль (bcrypt) |
| email | VARCHAR(100) | NOT NULL, UNIQUE | Email адрес |
| is_active | BOOLEAN | DEFAULT true | Флаг активности пользователя |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Дата создания |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Дата последнего обновления |

**Индексы:**
- `idx_users_login` - для быстрого поиска по логину
- `idx_users_email` - для быстрого поиска по email
- `idx_users_is_active` - для фильтрации активных пользователей

---

### 2. `roles` - Роли пользователей

| Колонка | Тип | Ограничения | Описание |
|---------|-----|------------|---------|
| id | UUID | PRIMARY KEY | Уникальный идентификатор роли |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Наименование роли |
| description | TEXT | - | Описание роли |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Дата создания |

**Индексы:**
- `idx_roles_name` - для быстрого поиска по названию

**Начальные роли:**
- `ADMIN` - Администратор системы
- `INVESTOR` - Инвестор (может оценивать проекты)
- `APPLICANT` - Заявитель (может создавать проекты)

---

### 3. `user_roles` - Связь пользователей и ролей (Many-to-Many)

| Колонка | Тип | Ограничения | Описание |
|---------|-----|------------|---------|
| id | UUID | PRIMARY KEY | Уникальный идентификатор |
| user_id | UUID | NOT NULL, FK (users) | Ссылка на пользователя |
| role_id | UUID | NOT NULL, FK (roles) | Ссылка на роль |
| assigned_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Дата назначения роли |

**Ограничения:**
- `UNIQUE(user_id, role_id)` - один пользователь не может иметь одну роль дважды
- `CASCADE DELETE` - при удалении пользователя/роли удаляются связи

**Индексы:**
- `idx_user_roles_user_id` - для быстрого поиска ролей пользователя
- `idx_user_roles_role_id` - для быстрого поиска пользователей с ролью

---

## Представления (Views)

### `v_users_with_roles` - Пользователи с их ролями

Удобное представление для просмотра пользователей и всех их ролей в одной строке.

**Пример запроса:**
```sql
SELECT * FROM user_service.v_users_with_roles;
```

**Пример результата:**
```
id                                   | login | email           | is_active | roles
550e8400-e29b-41d4-a716-446655440000 | admin | admin@mail.com  | true      | ADMIN
```

---

## Миграции

Используется **Flyway** для версионирования и миграции БД.

**Расположение миграций:** `src/main/resources/db/migration`

**Версионирование:**
- `V1__Create_User_Service_Schema.sql` - Создание всех таблиц и начальных данных

**Порядок выполнения миграций:**
1. Создание таблиц (roles, users, user_roles)
2. Создание индексов
3. Вставка начальных ролей (ADMIN, INVESTOR, APPLICANT)
4. Назначение ролей администратору

---

## Примеры SQL запросов

### Получить всех пользователей с их ролями
```sql
SELECT 
    u.id,
    u.login,
    u.email,
    STRING_AGG(r.name, ', ' ORDER BY r.name) as roles
FROM user_service.users u
LEFT JOIN user_service.user_roles ur ON u.id = ur.user_id
LEFT JOIN user_service.roles r ON ur.role_id = r.id
GROUP BY u.id, u.login, u.email;
```

### Получить роли конкретного пользователя
```sql
SELECT r.name, r.description
FROM user_service.roles r
JOIN user_service.user_roles ur ON r.id = ur.role_id
JOIN user_service.users u ON u.id = ur.user_id
WHERE u.login = 'admin';
```

### Назначить роль пользователю
```sql
INSERT INTO user_service.user_roles (user_id, role_id)
SELECT 
    (SELECT id FROM user_service.users WHERE login = 'testuser'),
    (SELECT id FROM user_service.roles WHERE name = 'INVESTOR')
ON CONFLICT DO NOTHING;
```

### Удалить роль у пользователя
```sql
DELETE FROM user_service.user_roles
WHERE user_id = (SELECT id FROM user_service.users WHERE login = 'testuser')
AND role_id = (SELECT id FROM user_service.roles WHERE name = 'INVESTOR');
```

### Получить всех ADMIN'ов
```sql
SELECT u.login, u.email
FROM user_service.users u
JOIN user_service.user_roles ur ON u.id = ur.user_id
JOIN user_service.roles r ON r.id = ur.role_id
WHERE r.name = 'ADMIN' AND u.is_active = true;
```

---

## Настройка в application.properties

```properties
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.default_schema=user_service
spring.flyway.enabled=true
spring.flyway.schemas=user_service
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
```

**Описание:**
- `ddl-auto=validate` - не создаёт таблицы, только проверяет схему
- `default_schema=user_service` - все сущности используют эту схему
- `flyway.enabled=true` - включены миграции
- `flyway.schemas=user_service` - миграции применяются к этой схеме
- `flyway.locations=classpath:db/migration` - где искать миграции

---

## Диаграмма связей

```
┌─────────────┐
│   USERS     │
├─────────────┤
│ id (PK)     │
│ login       │
│ email       │
│ password... │
│ is_active   │
│ created_at  │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌──────────────────┐         ┌──────────┐
│  USER_ROLES      │◄────────│  ROLES   │
├──────────────────┤  1:N    ├──────────┤
│ id (PK)          │         │ id (PK)  │
│ user_id (FK)     │         │ name     │
│ role_id (FK)     │         │ descrip..│
│ assigned_at      │         │ created..│
└──────────────────┘         └──────────┘
```

---

## Запуск миграций

### При запуске приложения
Flyway автоматически запустит все миграции при старте приложения.

### Вручную через Maven
```bash
mvn flyway:migrate
```

### Информация о миграциях
```bash
mvn flyway:info
```

---

## Безопасность

### Хеширование паролей
- Алгоритм: BCrypt
- Версия: 10 раундов
- Сгенерированные пароли никогда не хранятся в исходном виде

### Ограничение доступа
- Все пользователи имеют права на основе ролей
- Роли проверяются через JWT токен
- Доступ по ролям проверяется на уровне Spring Security

---

## Масштабируемость

### Добавление новых ролей
Просто добавьте запись в таблицу `roles`:
```sql
INSERT INTO user_service.roles (name, description)
VALUES ('NEW_ROLE', 'Описание новой роли');
```

### Добавление новых колонок
Создайте новую миграцию:
```bash
touch src/main/resources/db/migration/V2__Add_new_column.sql
```

---

## Контакты и поддержка

Если у вас есть вопросы по структуре БД, обратитесь к документации User Service.

