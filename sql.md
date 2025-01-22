-- =============================
-- 1. 创建表：users
-- =============================
CREATE TABLE IF NOT EXISTS "users" (
    "id" BIGSERIAL PRIMARY KEY,
    "email" VARCHAR(100) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" SMALLINT NOT NULL DEFAULT 1
);

-- =============================
-- 2. 创建表：activities
-- =============================
CREATE TABLE IF NOT EXISTS "activities" (
    "id" BIGSERIAL PRIMARY KEY,
    "organizer_id" BIGINT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,
    "capacity" INT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" SMALLINT NOT NULL DEFAULT 1
);

-- 为查询活动发布者(organizer_id)创建必要的索引
CREATE INDEX IF NOT EXISTS idx_activities_organizer_id
    ON "activities" ("organizer_id");

-- =============================
-- 3. 创建表：registrations
-- =============================
CREATE TABLE IF NOT EXISTS "registrations" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT NOT NULL,
    "activity_id" BIGINT NOT NULL,
    "registered_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" SMALLINT NOT NULL DEFAULT 1
);

-- 根据常见查询维度建立索引
CREATE INDEX IF NOT EXISTS idx_registrations_user_id
    ON "registrations" ("user_id");

CREATE INDEX IF NOT EXISTS idx_registrations_activity_id
    ON "registrations" ("activity_id");

-- =============================
-- 4. 创建表：notifications
-- =============================
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT NOT NULL,
    "activity_id" BIGINT,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" SMALLINT NOT NULL DEFAULT 0
);

-- 给 user_id 建索引，方便按用户查询
CREATE INDEX IF NOT EXISTS idx_notifications_user_id
    ON "notifications" ("user_id");

-- 如果经常需要按 activity_id 查询通知，视情况添加索引
CREATE INDEX IF NOT EXISTS idx_notifications_activity_id
    ON "notifications" ("activity_id");

-- =============================
-- 5. （可选）创建表：feedback
-- =============================
CREATE TABLE IF NOT EXISTS "feedback" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT NOT NULL,
    "activity_id" BIGINT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 常用查询维度：用户 / 活动
CREATE INDEX IF NOT EXISTS idx_feedback_user_id
    ON "feedback" ("user_id");

CREATE INDEX IF NOT EXISTS idx_feedback_activity_id
    ON "feedback" ("activity_id");

-- =============================
-- 6. 创建更新触发器所需的函数
--  在 PostgreSQL 中，若要在表更新时自动更新 updated_at，
--  可先写一个通用函数 set_timestamp()，然后在各表上创建 Trigger。
-- =============================
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();  -- 将 updated_at 修改为当前时间
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================
-- 7. 为有 updated_at 字段的表创建触发器
-- =============================

-- 7.1 users 表触发器
CREATE TRIGGER users_update_timestamp
BEFORE UPDATE ON "users"
FOR EACH ROW
EXECUTE FUNCTION set_timestamp();

-- 7.2 activities 表触发器
CREATE TRIGGER activities_update_timestamp
BEFORE UPDATE ON "activities"
FOR EACH ROW
EXECUTE FUNCTION set_timestamp();

-- 如果你也想为 registrations / notifications / feedback 添加自动更新时间，
-- 请先在对应表里添加 updated_at 字段，再重复以上触发器的创建即可。

-- =============================
-- 至此，所有表和必要的触发器已创建完成
-- =============================
