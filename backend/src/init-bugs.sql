-- ============================================
-- ZERO BUG反馈系统 数据库初始化
-- ============================================

-- 创建 bugs 表
CREATE TABLE IF NOT EXISTS bugs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  bug_id VARCHAR(20) UNIQUE NOT NULL COMMENT 'BUG编号 BUG-001',
  project VARCHAR(50) NOT NULL COMMENT '所属项目',
  severity ENUM('P0', 'P1', 'P2', 'P3') NOT NULL COMMENT '严重程度',
  title VARCHAR(200) NOT NULL COMMENT 'BUG标题',
  steps TEXT COMMENT '复现步骤',
  expected TEXT COMMENT '预期结果',
  actual TEXT COMMENT '实际结果',
  reporter VARCHAR(50) COMMENT '报告者',
  status ENUM('待处理', '已确认', '修复中', '已修复', '已验证', '暂不处理', '重复Bug') DEFAULT '待处理' COMMENT '处理状态',
  handler VARCHAR(50) COMMENT '处理人',
  solution TEXT COMMENT '解决方案',
  screenshot VARCHAR(255) COMMENT '截图路径',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_project (project),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='BUG反馈表';

-- 插入示例数据
INSERT INTO bugs (bug_id, project, severity, title, steps, expected, actual, reporter, status) VALUES
('BUG-001', 'zerokara-site', 'P2', '【网站】登录页面加载缓慢', '1. 打开网站\n2. 点击登录按钮\n3. 等待页面响应', '页面应在2秒内加载完成', '页面需要5秒以上才能响应', '管理员', '已确认'),
('BUG-002', 'song-of-self', 'P1', '【游戏】角色移动时穿墙', '1. 进入游戏\n2. 移动到墙角\n3. 冲刺穿过墙壁', '角色应该在墙前停止', '角色穿过墙壁到达另一边', '测试员A', '待处理'),
('BUG-003', 'song-of-self', 'P3', '【游戏】蘑菇贴图边缘有锯齿', '1. 进入菌林之地\n2. 靠近蘑菇观察边缘', '贴图边缘应该平滑', '贴图边缘有明显锯齿', '美术审核', '修复中');
