-- =====================================================
-- User Service Schema
-- =====================================================

-- Создаем схему user_service (если не существует)
CREATE SCHEMA IF NOT EXISTS user_service;

-- =====================================================
-- Таблица ROLES
-- =====================================================
-- Описание: Роли пользователей в системе
-- Примеры: ADMIN, INVESTOR, APPLICANT

DROP TABLE IF EXISTS user_service.user_roles CASCADE;
DROP TABLE IF EXISTS user_service.roles CASCADE;
DROP TABLE IF EXISTS user_service.users CASCADE;

CREATE TABLE user_service.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем индекс для быстрого поиска по name
CREATE INDEX idx_roles_name ON user_service.roles(name);

-- Добавляем комментарии
COMMENT ON TABLE user_service.roles IS 'Таблица ролей пользователей в системе';
COMMENT ON COLUMN user_service.roles.id IS 'Уникальный идентификатор роли';
COMMENT ON COLUMN user_service.roles.name IS 'Наименование роли (ADMIN, INVESTOR, APPLICANT)';
COMMENT ON COLUMN user_service.roles.created_at IS 'Дата создания роли';

-- =====================================================
-- Таблица USERS
-- =====================================================
-- Описание: Пользователи системы

CREATE TABLE user_service.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    login VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавляем индексы для быстрого поиска
CREATE INDEX idx_users_login ON user_service.users(login);
CREATE INDEX idx_users_email ON user_service.users(email);
CREATE INDEX idx_users_is_active ON user_service.users(is_active);

-- Добавляем комментарии
COMMENT ON TABLE user_service.users IS 'Таблица пользователей системы';
COMMENT ON COLUMN user_service.users.id IS 'Уникальный идентификатор пользователя';
COMMENT ON COLUMN user_service.users.login IS 'Логин пользователя для входа в систему';
COMMENT ON COLUMN user_service.users.password_hash IS 'Хешированный пароль пользователя (bcrypt)';
COMMENT ON COLUMN user_service.users.email IS 'Email адрес пользователя';
COMMENT ON COLUMN user_service.users.is_active IS 'Флаг активности пользователя';
COMMENT ON COLUMN user_service.users.created_at IS 'Дата создания пользователя';
COMMENT ON COLUMN user_service.users.updated_at IS 'Дата последнего обновления профиля';

-- =====================================================
-- Таблица USER_ROLES
-- =====================================================
-- Описание: Связь между пользователями и ролями (many-to-many)

CREATE TABLE user_service.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_service.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES user_service.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role_id)
);

-- Добавляем индексы для быстрого поиска
CREATE INDEX idx_user_roles_user_id ON user_service.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_service.user_roles(role_id);

-- Добавляем комментарии
COMMENT ON TABLE user_service.user_roles IS 'Таблица связи пользователей и ролей (многие-ко-многим)';
COMMENT ON COLUMN user_service.user_roles.id IS 'Уникальный идентификатор записи';
COMMENT ON COLUMN user_service.user_roles.user_id IS 'Ссылка на пользователя';
COMMENT ON COLUMN user_service.user_roles.role_id IS 'Ссылка на роль';
COMMENT ON COLUMN user_service.user_roles.assigned_at IS 'Дата назначения роли пользователю';

-- =====================================================
-- Начальные данные - РОЛИ
-- =====================================================

INSERT INTO user_service.roles (name) VALUES
('ADMIN')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_service.roles (name) VALUES
('INVESTOR')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_service.roles (name) VALUES
('APPLICANT')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- Назначение ролей существующему администратору
-- =====================================================

-- Найти пользователя с логином 'admin' и назначить ему роль ADMIN
INSERT INTO user_service.user_roles (user_id, role_id)
SELECT
    (SELECT id FROM user_service.users WHERE login = 'admin' LIMIT 1) as user_id,
    (SELECT id FROM user_service.roles WHERE name = 'ADMIN' LIMIT 1) as role_id
WHERE EXISTS (SELECT 1 FROM user_service.users WHERE login = 'admin')
AND EXISTS (SELECT 1 FROM user_service.roles WHERE name = 'ADMIN')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Представление для удобного просмотра пользователей и их ролей
-- =====================================================

CREATE OR REPLACE VIEW user_service.v_users_with_roles AS
SELECT
    u.id,
    u.login,
    u.email,
    u.is_active,
    u.created_at,
    u.updated_at,
    STRING_AGG(r.name, ', ' ORDER BY r.name) as roles
FROM user_service.users u
LEFT JOIN user_service.user_roles ur ON u.id = ur.user_id
LEFT JOIN user_service.roles r ON ur.role_id = r.id
GROUP BY u.id, u.login, u.email, u.is_active, u.created_at, u.updated_at;

COMMENT ON VIEW user_service.v_users_with_roles IS 'Представление для просмотра пользователей с их ролями';

-- =====================================================
-- Окончание миграции
-- =====================================================

