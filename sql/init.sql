-- ByteBlog 数据库初始化脚本
-- 使用方法: mysql -u root -p < init.sql

CREATE DATABASE IF NOT EXISTS blog_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE blog_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id          INT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50)  NOT NULL UNIQUE,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar      VARCHAR(500) DEFAULT '',
    role        ENUM('user','admin') NOT NULL DEFAULT 'user',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章表
CREATE TABLE IF NOT EXISTS articles (
    id             INT PRIMARY KEY AUTO_INCREMENT,
    title          VARCHAR(500) NOT NULL,
    content_md     LONGTEXT,
    content_html   LONGTEXT,
    summary        VARCHAR(500) DEFAULT '',
    cover_url      VARCHAR(500) DEFAULT '',
    status         ENUM('draft','pending','published','archived') NOT NULL DEFAULT 'draft',
    author_id      INT NOT NULL,
    reviewer_id    INT DEFAULT NULL,
    review_comment VARCHAR(500) DEFAULT '',
    published_at   DATETIME DEFAULT NULL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id)   REFERENCES users(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    INDEX idx_status (status),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
    id   INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文章-标签关联表
CREATE TABLE IF NOT EXISTS article_tags (
    article_id INT NOT NULL,
    tag_id     INT NOT NULL,
    PRIMARY KEY (article_id, tag_id),
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id)     REFERENCES tags(id)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    content    TEXT NOT NULL,
    article_id INT NOT NULL,
    user_id    INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI 使用记录表
CREATE TABLE IF NOT EXISTS ai_logs (
    id         INT PRIMARY KEY AUTO_INCREMENT,
    article_id INT NOT NULL DEFAULT 0,
    type       VARCHAR(20) NOT NULL,
    prompt     TEXT,
    result     TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认管理员
INSERT INTO users (username, email, password_hash, role)
VALUES ('admin', 'admin@byteblog.com',
        '$2b$12$LJ3m4ys3GZRIb05gORNXu.YjIfC4ZDxHWKb1dFzG1sdFJNXRSOOky', 'admin')
ON DUPLICATE KEY UPDATE username=username;
-- 默认密码: admin123

-- 插入默认标签
INSERT INTO tags (name, slug) VALUES
    ('前端开发', 'frontend'),
    ('后端开发', 'backend'),
    ('AI', 'ai'),
    ('JavaScript', 'javascript'),
    ('Python', 'python'),
    ('Vue', 'vue'),
    ('React', 'react'),
    ('CSS', 'css'),
    ('数据库', 'database'),
    ('设计模式', 'design-pattern')
ON DUPLICATE KEY UPDATE name=name;
