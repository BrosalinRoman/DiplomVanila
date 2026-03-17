-- =====================================================
-- V2: Remove description field from roles table
-- =====================================================

-- Remove the description column from roles table
ALTER TABLE user_service.roles DROP COLUMN IF EXISTS description;

-- Update comments
COMMENT ON TABLE user_service.roles IS 'Таблица ролей пользователей в системе';
COMMENT ON COLUMN user_service.roles.id IS 'Уникальный идентификатор роли';
COMMENT ON COLUMN user_service.roles.name IS 'Наименование роли (ADMIN, INVESTOR, APPLICANT)';
COMMENT ON COLUMN user_service.roles.created_at IS 'Дата создания роли';
